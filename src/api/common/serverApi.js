import axios from 'axios';
import qs from 'qs';
import Vue from 'vue';  // 为了解决post默认使用的是x-www-from-urlencoded 去请求数据，导致请求参数无法传递到后台，所以还需要安装一个插件QS

const network = 'testnet';

const AJAXURL = process.env.NODE_ENV === 'development' ? '/api' : document.URL.startsWith('http')
    ? ''
    : process.env.API_ROOT;
;

const code = network == 'mainnet' ? '/bc' : '/testbc';
const trans = '/cypher';

var ServerApi = function() {};
Vue.prototype.$btcServerApi = ServerApi;

// https://blockchain.info/balance?active=$address
ServerApi.getBtcBalance = function(active, callback) {
  // TODO 获取用户的地址对应的余额
  var data = {
    active: active,
  };

  sendHttp(code + '/balance', 'get', data, function(response) {
    if (response.status === 200) {
      callback(null, response);
    }
    else {
      callback(response, null);
    }
  });
};
// https://blockchain.info/unspent?active=1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY
ServerApi.getBtcUnspent = function(active, callback) {
  // TODO 获取用户的地址对应的unspent
  var data = {
    active: active,
  };

  sendHttp(code + '/unspent', 'get', data, function(response) {

    if (response.status === 200) {
      callback(null, response);
    }
    else {
      callback(response, null);
    }
  });
};

// https://blockchain.info/rawaddr/$bitcoin_address
// Optional limit parameter to show n transactions e.g. &limit=50 (Default: 50, Max: 50)
// Optional offset parameter to skip the first n transactions e.g. &offset=100 (Page 2 for limit 50)
ServerApi.getRawAddr = function(address, offset, limit, callback) {
  // TODO 获取用户的地址对应的历史记录
  var data = {
    offset: offset,
    limit: limit,
  };
  sendHttp(code + '/rawaddr/' + address, 'get', data, function(response) {
    if (response.status === 200) {
      callback(null, response);
    }
    else {
      callback(response, null);
    }
  });
};
// https://www.blockchain.com/btc/tx/b876fc45ec92bcd1d66f5ed97e64e42f5578f6256714528618f12c29a250a417

// https://blockchain.info/latestblock
ServerApi.getLastBlock = function(callback) {
  // TODO 获取最新区块高度

  sendHttp(code + '/latestblock', 'get', '', function(response) {
    if (response.status === 200) {
      callback(null, response);
    }
    else {
      callback(response, null);
    }
  });
};

// 转账
/*var pushtx = {
  tx: "01000000011935b41d12936df99d322ac8972b74ecff7b79408bbccaf1b2eb8015228beac8000000006b483045022100921fc36b911094280f07d8504a80fbab9b823a25f102e2bc69b14bcd369dfc7902200d07067d47f040e724b556e5bc3061af132d5a47bd96e901429d53c41e0f8cca012102152e2bb5b273561ece7bbe8b1df51a4c44f5ab0bc940c105045e2cc77e618044ffffffff0240420f00000000001976a9145fb1af31edd2aa5a2bbaa24f6043d6ec31f7e63288ac20da3c00000000001976a914efec6de6c253e657a9d5506a78ee48d89762fb3188ac00000000"
};
$.post('https://api.blockcypher.com/v1/bcy/test/txs/push', JSON.stringify(pushtx))
  .then(function(d) {console.log(d)});*/

ServerApi.sendTrans = function(tx, callback) {
  // TODO 转账，发送
  var data = {
    tx: tx,
  };
  // sendHttp(trans+'/v1/bcy/test/txs/push','post',data,function (err, response) {
  sendHttp(trans + '/v1/btc/test3/txs/push', 'post', data, function(err, response) {
    console.log(response);
    callback(response, null);

  });
};
// TODO:获取 行情 icon
ServerApi.getQuotes = function(url, data, callback, fail) {
  let options = {};
  data = JSON.stringify(data) === '{}' ? '' : '?' + qs.stringify(data);
  options = {
    method: 'get',
    url: AJAXURL + url + data,
    headers: {
      'X-CMC_PRO_API_KEY': 'de751b55-71b5-4d3b-87a8-6d1d351aa055',
    },
  };
  axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
  axios(options).then((response) => {
    callback(response);
    // console.log(data);
  }).catch((error) => {
    fail(error);
  });

};

function sendHttp(url, type, data, callback) {
  // let self = this;
  console.log('url:' + url);
  console.log('data:' + JSON.stringify(data));
  let options = {};
  let n_type = type ? type : 'post';
  if (n_type === 'get') {
    data = JSON.stringify(data) === '{}' ? '' : '?' + qs.stringify(data);
    options = {
      method: n_type,
      url: AJAXURL + url + data,
    };
  } else if (n_type === 'post') {
    options = {
      method: n_type,
      url: AJAXURL + url,
      data: data,
    };
  }
  axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
  axios(options).then(function(response) {
    callback(response);
    // console.log(data);
  }).catch(function(error) {
    console.log(error);
  });
}

export {
  ServerApi,
};
