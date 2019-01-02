import {ServerApi} from "./ETH/serverApi";

const POLLTIMEBLOCK = 30000;
let Notice = function() {
  this.eth_wallets = null;
  this.addrNum = 0;
  this.cancelPoll = false;
  this.addrSet = [];
  this.timer = null;
};

Notice.prototype.init = function(callback) {

  if (JSON.parse(localStorage.getItem('eth_wallets'))) {
    this.eth_wallets = JSON.parse(localStorage.getItem('eth_wallets'));
    this.eth_wallets.forEach((value) => {
      if (value.address) {
        this.addrSet.push(value.address);
      }
    });
    this.longPoll(callback);
  }else {
    return false;
  }

};

Notice.prototype.longPoll = function(callback) {
  if (this.cancelPoll) { this.longPoll = null;return false }
  this.addrNum = this.addrNum >= this.addrSet.length ? 0 : this.addrNum;
  let addr = this.addrSet[this.addrNum];

  ServerApi.getNewEthMessage(addr, (res) => {
    if (res.status_code === 200) {
      console.log('etc长轮询数据',res);
      if (res.data.length) {
        // 为res 增加地址
        res.data[0].address = addr;
      }
      callback(res);
      this.addrNum++;
      this.timer = setTimeout(() => {
        this.longPoll(callback);
      }, POLLTIMEBLOCK);

    }else {
      setTimeout(() => {

        this.longPoll(callback);
      }, 20000);
    }

  },(err) => {
    setTimeout(() => {

      this.longPoll(callback);
    }, 20000);
  });

};
export default Notice
