var DEFAULT_BTC_URL = 'wss://ws.blockchain.info/inv';
var KEEPALIVE_TIMEOUT = 5 * 1000;
var REQUEST_TIMEOUT = 5 * 1000;
var MAX_RECONNECT_LIMIT = Infinity; //10;
var MAX_KEEPALIVE_FAILS = 3;
var ADDRESS_TIMEOUT = 60 * 1000;

/////////////////////////////////////
var CODE = {
  ERROR_NETWORK: -1,
  OK: 200,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  ERROR_TIMEOUT: 408,
  SERVER_ERROR: 500
};

var BTC_STATUS = {};
BTC_STATUS.UNCONNECTED = 1;
BTC_STATUS.CONNECTED = 2;
BTC_STATUS.CLOSED = 4; // login failed or close by server

var RECONN_STATUS = {};
RECONN_STATUS.NONE = 0;
RECONN_STATUS.OK = 1;
RECONN_STATUS.TERMINATED = 2;

var WalletBtcSDK = function (btcUrl) {
  this.btc_url = btcUrl || DEFAULT_BTC_URL;
  this.status = BTC_STATUS.UNCONNECTED;
  this.reconn_status = RECONN_STATUS.NONE;
  this.socket = null;

  // callbacks
  this.onmessage = null; // {method:xx, body:xx} 收到服务器推送消息

  this.onreconnecting = null; //num 重连中
  this.onreconnected = null; // num, loinRsp 重连成功
  this.onreconnect_failed = null; // num, reason 退出: 多次重连后最终重连失败

  // internal fields 内部
  this._address_interval_ref = null;

  this._keepRequset = {};
  // 心跳维持
  this._keepalive_interval_ref = null;
  this._keepalive_fails = 0;

  // 重连机制
  this._reconn_num = 0;
  this._reconn_timeout_ref = null;


};

WalletBtcSDK.prototype.CODE = CODE;
WalletBtcSDK.prototype.BTC_STATUS = BTC_STATUS;
WalletBtcSDK.prototype.RECONN_STATUS = RECONN_STATUS;


WalletBtcSDK.prototype.init = function (onsuccess,onfail) {

  this.socket = new WebSocket(this.btc_url);
  this.status = BTC_STATUS.UNCONNECTED;
  var Btc = this;

  this.socket.onopen = function (evt) {
    console.log('conn open success.');
    if(onsuccess) onsuccess();
    Btc.status = BTC_STATUS.CONNECTED;
    Btc.keepalive();
    // Btc.keepalive(onsuccess,onfail); 此处暂且不传回调
    Btc.sendAllAddress();
  };

  this.socket.onclose = function (evt) {
    Btc._onclose();
    console.log('conn closed.');
  };

  this.socket.onerror = function (evt) {
    console.log('build ws onerror', evt);
    if (Btc.status === BTC_STATUS.UNCONNECTED) {
      if(onfail) onfail({ status_code: CODE.ERROR_NETWORK, message: 'connect failed.' });
    }
  };

  this.socket.onmessage = function (evt) {
    Btc._onrecv(evt.data);
  };

};
WalletBtcSDK.prototype.keepalive = function(onsuccess,onfail) {
  // 定时心跳
  var Btc = this;
  Btc.reconn_status = RECONN_STATUS.OK;
  this._keepalive_interval_ref = setInterval(function () {
    if (Btc.status === BTC_STATUS.CONNECTED) {
      Btc._request({op:"ping"},
        function () {
          console.log('_keepalive success');
          Btc._keepalive_fails = 0;
          // if(onsuccess) onsuccess();
        }, function () {
          Btc._keepalive_fails++;
          console.log('_keepalive_fails===',Btc._keepalive_fails);
          if (Btc._keepalive_fails >= MAX_KEEPALIVE_FAILS) {

            console.log('_.keepalive reconnect....');
            Btc._onclose();
          }
          // if(onfail) onfail();
        });
    }else {
      clearInterval(Btc._keepalive_interval_ref);
      Btc._keepalive_interval_ref = null;
    }
  }, KEEPALIVE_TIMEOUT);
};


WalletBtcSDK.prototype.sendAllAddress = function () {

  if (JSON.parse(localStorage.getItem("btc_wallets"))) {
    let btcAddressArray = JSON.parse(localStorage.getItem("btc_wallets"));
    btcAddressArray.forEach(value=>{
      let req = {
        op: 'addr_sub',
        addr: value.address
      };
      this._request(req);
    });
  }

  this._address_interval_ref = setInterval(()=>{
    if (JSON.parse(localStorage.getItem("btc_wallets"))) {
      let btcAddressArray = JSON.parse(localStorage.getItem("btc_wallets"));
      btcAddressArray.forEach(value=>{
        let req = {
          op: 'addr_sub',
          addr: value.address
        };
        this._request(req);
      });
    }
  },ADDRESS_TIMEOUT);

};

WalletBtcSDK.prototype._request = function (data,onsuccess,onfail) {

  var Btc = this;

  if (!onsuccess) {
    onsuccess = function () { };
  }
  if (!onfail) {
    onfail = function () { };
  }

  // console.log('socket.readyState===',this.socket.readyState,WebSocket.OPEN);
  // console.log('链接当前数据',data);

  if (this.socket == null || this.socket.readyState !== WebSocket.OPEN) {
    console.log('ws not connected.');
    console.log('socket.readyState===',this.socket.readyState); // 1 对应常量OPEN 连接成功建立，可以进行通信  3 对应常量CLOSED 连接已经关闭或者根本没有建立
    onfail({ status_code: CODE.ERROR_NETWORK, message: 'ws not connected.' });
    return;
  }

  if (data.op === 'ping') {

    var ref = setTimeout(function () {
      delete Btc._keepRequset;
      onfail({ status_code: CODE.ERROR_TIMEOUT, message: 'request timeout' });
    }, REQUEST_TIMEOUT);

    this._keepRequset = {
      op: data.op,
      onsuccess: onsuccess,
      timeoutRef: ref
    };

  }
  this.socket.send(JSON.stringify(data));
};

WalletBtcSDK.prototype._onrecv = function (data) {
  var data = JSON.parse(data);
  if (data.op === 'utx'){
    if (this.onmessage != null) {
      this.onmessage(data);
    }
  }
  if (data.op === 'pong') {
    if (this._keepRequset) {
      var req = this._keepRequset;
      clearTimeout(req.timeoutRef);
      delete this._keepRequset;
      req.onsuccess(data);
    }

  }
};

WalletBtcSDK.prototype._onclose = function () {
  this.status = BTC_STATUS.CLOSED;
  this._clean();
  if (this.reconn_status === RECONN_STATUS.OK && this._reconn_timeout_ref == null) {
    if (this.onreconnecting) {
      this.onreconnecting(this._reconn_num);
    }
    var delayMs = 1000;
    if (this._reconn_num >= 3) {
      delayMs = 2000;
    }
    var Btc = this;
    Btc._reconn_timeout_ref = setTimeout(function () {
      Btc._reconn_timeout_ref = null;
      Btc._tryReconnect();
    }, delayMs);
  }
};

WalletBtcSDK.prototype._clean = function() {

  if (this.socket){
    this.socket.close();
    if (this._keepalive_interval_ref) {
      clearInterval(this._keepalive_interval_ref);
      this._keepalive_interval_ref = null;
    }

    if (this._address_interval_ref) {
      clearInterval(this._address_interval_ref);
      this._address_interval_ref = null;
    }

    this._keepalive_fails = 0;
    this.socket = null;
  }

};

WalletBtcSDK.prototype.onclose = function () {
  // 不能发起重连
  this.reconn_status = RECONN_STATUS.TERMINATED;
  this._onclose();
};


WalletBtcSDK.prototype._tryReconnect = function () {
  // 触发机制
  // 1. keepalive timeout
  // 2. socket close
  console.log('重连中....................');
  var Btc = this;
  Btc.init(function () {
    console.log('重连成功!');
    Btc._reconn_num = 0;
  },function () {
    Btc._reconn_num++;
    console.log('重连失败-------------------',Btc._reconn_num);
    if (Btc._reconn_num >= MAX_RECONNECT_LIMIT) {
      Btc.reconn_status = RECONN_STATUS.TERMINATED;
      console.log('重连失败!');
    }
  });

};

export default WalletBtcSDK

