import bip39 from 'bip39';
import crypto from 'crypto';
import bitcoin from 'bitcoinjs-lib';
import ezcrypto from 'ezcrypto';



import {ServerApi} from './serverApi';

import {Validator} from '../common/validator';
import usdtTransactionSend from './myUsdtWallet'
import Decimal from 'decimal.js';

var LOCALSTORAGE_CURR_WALLET = 'btc_currWallet';
var LOCALSTORAGE_WALLETS = 'btc_wallets';
// var INVALID_MNEMONIC = "invalid mnemonic";
var INVALID_MNEMONIC = '无效的助记符';
var LOCALSTORAGE_KEYSTORE_PREFIX = 'btc_private:';
var INVALID_PASSWORD = '无效的 password';
var INVALID_KEYSTORE = 'keystore 与密码不匹配';

var LOCALSTORAGE_BACKUP_ZJC = 'btc_zjc';

// const testnet = bitcoin.networks.testnet;
// const mainnet = bitcoin.networks.bitcoin;
// const mainnet = bitcoin.networks.testnet;
// const option = {
//   // network: bitcoin.networks.bitcoin
//   network: bitcoin.networks.testnet,
// };
var net = process.env.BTC_NET === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
const option = {
  network: net
};

var mainVersion = 0x80;
var testVersion = 0xEF;

// 创建钱包t-- --                                                                                                                                                                                                        ---------------------------------------------------------------------------
var BtcWallet = function(address, name, pwdPrompt) {
  this.address = address;
  this.walletName = name;
  this.pwdPrompt = pwdPrompt;
};

/*********************************  钱包基础  交互接口*****************************************/

BtcWallet.getCurrWallet = function() {
  var walletStr = getLocalStorage(LOCALSTORAGE_CURR_WALLET);
  if (walletStr !== null && walletStr !== undefined) {
    var walletObj = JSON.parse(walletStr);
    return new BtcWallet(walletObj.address, walletObj.walletName, walletObj.pwdPrompt);
  }
  return null;
};

/**
 * 查询当前的所有钱包列表
 * @ return [{
		address: '0x111aaaa2222',
		walletName: 'name',
		pwdPrompt: 'pwdPrompt'
 	}]
 */
BtcWallet.getWallets = function() {
  var wallets = getLocalStorage(LOCALSTORAGE_WALLETS);
  return wallets !== null ? JSON.parse(wallets) : undefined;
};

/**
 * 生成钱包
 * @param password {string} 用户输入的密码
 * @device {device_id:xxx, client_type:1, push_token:xxxx}
 * @callback function(err, wallet)
 */
BtcWallet.genAddress = function(password, walletName, pwdPrompt, callback, device) {
  try {
    // 钱包名字排重处理
    var walletsNames = getLocalStorage(LOCALSTORAGE_WALLETS);
    var walletsObj = (walletsNames !== undefined && walletsNames !== null) ? JSON.parse(walletsNames) : [];
    if (walletsObj !== [] && walletsObj.length > 0) {
      for (var i = 0; i < walletsObj.length; i++) {
        if (walletsObj[i].walletName === walletName) {
          callback('该用户名已被使用', null);
          return;
        }
      }
    }

    var randomBytes = crypto.randomBytes(16);  // 生成加密用的伪随机码
    var words = randomBytes.toString('hex');
    var mnemonic = bip39.entropyToMnemonic(words);   // 生成确定性密钥的助记符
    console.log('=============================BIP39==============================');
    console.log('BIP39 助记词: ', mnemonic);
    console.log('BIP39 Validation is : ', bip39.validateMnemonic(mnemonic));
    console.log('=============================BTC================================');

    if (!bip39.validateMnemonic(mnemonic)) {
      callback('create failed', null);
    }

    var key = exportKeyByMnemonic(mnemonic, password);

    var wallet = new BtcWallet(key.address, walletName, pwdPrompt);
    callback(null, wallet);

    // 保存备份助记词标志

    var keystore = this.keystore;
    addNewWallet(wallet, keystore);

  } catch (e) {
    console.error(e);
    callback('创建钱包失败', null);
  }
};

/**
 * 通过keystore导入钱包
 * @param password {string} 用户密码
 * @param input {string | object} keystore
 * @return address {string} 钱包地址
 */
BtcWallet.importFromKeyStore = function(password, input, callback, device) {
  try {
    var encryptedKey = input;
    var privateKey = decryptPrivate(encryptedKey, password);
    console.log('导入keystore的私钥', privateKey);

    const keyPair = bitcoin.ECPair.fromWIF(privateKey, net);
    const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: net});
    console.log('通过keystore导入钱包：========', address);
    var wallet = getWalletByAddress(address);
    if (wallet === null) {
      wallet = new BtcWallet(address, 'wallet-' + new Date().toLocaleString(), '');
    } else {
      wallet = new BtcWallet(address, wallet.walletName, wallet.pwdPrompt);
    }
    var keystore = input;
    addNewWallet(wallet, keystore);
    if (callback) {
      callback(null, wallet);
    }
  } catch (e) {
    console.log('导入keystore失败' + e);
    callback(INVALID_KEYSTORE, null);
  }

};

/**
 * 通过私钥导入钱包
 * @param password {string} 用户密码
 * @param privateKey {string} 私钥
 * @callback function(err, wallet)
 */
BtcWallet.importByPrivate = function(password, privateKey, callback, device) {
  try {
    const keyPair = bitcoin.ECPair.fromWIF(privateKey, net);
    const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: net});
    console.log('通过privateKey导入钱包：========', address);
    var wallet = getWalletByAddress(address);
    if (wallet === null) {
      wallet = new BtcWallet(address, 'wallet-' + new Date().toLocaleString(), '');
    } else {
      wallet = new BtcWallet(address, wallet.walletName, wallet.pwdPrompt);
    }
    var keystore = encryptPrivate(privateKey, password);
    addNewWallet(wallet, keystore);
    if (callback) {
      callback(null, wallet);
    }
  } catch (e) {
    console.log('导入私钥失败' + e);
    callback('导入私钥失败', null);
  }
};
/**
 }

 * 通过助记词导入钱包
 * @param password {string} 用户密码
 * @param mnemonic {string} 助记词
 * @callback function(err, wallet)
 */
BtcWallet.importByMnemonic = function(password, mnemonic, callback, device) {
  console.log('mnemonic:' + mnemonic);
  if (!Validator.isValidMnemonic(mnemonic)) {
    if (callback) {
      callback(INVALID_MNEMONIC, null);
    }
    return;
  }
  console.log('通过助记词导入钱包');
  var key = exportKeyByMnemonic(mnemonic, password);
  console.log('privateKey=======', key.private);
  var address = key.address;
  console.log('address========', address);
  var wallet = getWalletByAddress(address);
  if (wallet === null) {
    wallet = new BtcWallet(address, 'wallet-' + new Date().toLocaleString(), '');
  } else {
    wallet = new BtcWallet(address, wallet.walletName, wallet.pwdPrompt);
  }
  // var  keystore = createKeyStore(password,key.private);
  var keystore = encryptPrivate(key.private, password);
  addNewWallet(wallet, keystore);
  if (callback) {
    callback(null, wallet);
  }
};
/**
 * 备份助记词
 * @param password {string} 用户密码
 * @param address {string} 用户钱包地址
 * @param callback(err, mnemonic): err:错误信息 Mnemonic:助记词
 */
BtcWallet.prototype.genMnemonic = function(password, address, callback) {
  try {
    var encMnem = getLocalStorage('mnemonic:' + address);
    var mnem = decrypt(password, encMnem);
    return mnem;
    callback(null, mnem);

  } catch (e) {
    console.error('密码错误' + e);
    return false;
  }
};

/**
 * @param correctMne 正确的注记词
 * @param validationMne 待验证的助记词
 * @return true: 验证成功 false: 验证失败
 */
BtcWallet.prototype.validationMnemonic = function(correctMne, validationMne) {
  console.log('this.mnemonic:' + correctMne);
  console.log('mnemonic:' + validationMne);
  if (!Validator.isValidMnemonic(validationMne) &&
    correctMne !== validationMne) {
    return false;
  }
  return true;
};

/**
 * 导出私钥
 * @param address {string} 用户钱包地址
 * @return privateKey {string} 私钥 字符串
 */
BtcWallet.prototype.getPrivateKey = function(password, address, callback) {
  try {
    // var encryptedKey = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + this.address);
    var encryptedKey = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + address);
    console.log('encryptedKey===', encryptedKey);
    var privateKey = decryptPrivate(encryptedKey, password);
    callback(null, privateKey);
    return privateKey;
  } catch (err) {
    // console.error('密码错误' + err);
    if (callback) {
      callback('密码错误', null);
    }

  }
};
/**
 * 导出keyStore
 * @param address {string} 用户钱包地址
 * @return keystore {string} keystore 字符串
 */
BtcWallet.prototype.getKeystore = function(password, callback) {
  try {
    var keystore = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + this.address);
    var privatekey = decryptPrivate(keystore, password);
    // return k;
    callback(null, keystore);
  } catch (err) {
    console.error('密码错误' + err);
    if (callback)
      callback('密码错误', null);
  }
};
/**
 * 修改密码
 * @param oldPassword: 旧密码
 * @param newPassword: 新密码
 * @param callback(err, wallet)：err:错误信息， wallet:新钱包对像
 */
BtcWallet.prototype.setPassword = function(oldPassword, newPassword, address, callback) {
  // var keystore = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + this.address);
  var encryptedKey = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + address);
  console.log('旧密码的keystore', encryptedKey);
  let privateKey;
  try {
    privateKey = decryptPrivate(encryptedKey, oldPassword);
    console.log('旧密码的私钥', privateKey);

  } catch (err) {
    console.log(err);
    callback(INVALID_PASSWORD, null);
    return null;
  }

  var newPrivateKey = encryptPrivate(privateKey, newPassword);
  saveLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + address, newPrivateKey);
  // saveLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + this.address, privateKey);
  console.log('newPrivateKey====', newPrivateKey);

  var encMnem = getLocalStorage('mnemonic:' + address);
  var mnem = decrypt(oldPassword, encMnem);
  var newMnen = encrypt(newPassword, mnem);
  saveLocalStorage('mnemonic:' + address, newMnen);

  callback(null, this);
};

/**
 * 从一个钱包的JSON字符串生成钱包对像
 * @param wallet 钱包的json字符串
 * @return BtcWallet {} 对像
 */
BtcWallet.importFromWallet = function(wallet) {
  var walletObj = (typeof wallet == 'object') ? wallet : JSON.parse(wallet);
  console.log(walletObj);
  var newWallet = new BtcWallet(walletObj.address, walletObj.walletName, walletObj.pwdPrompt);
  console.log(newWallet);
  addNewWallet(newWallet);
  return newWallet;
};

// 删除钱包
BtcWallet.prototype.delete = function() {
  try {
    var address = this.address;
    var wallets = BtcWallet.getWallets();
    var curWallet = BtcWallet.getCurrWallet();
    var wallet_system = localStorage.getItem('wallet_system').toLocaleLowerCase();
    console.log('wallets===', wallets);
    console.log('curWallet===', curWallet);
    if (wallets != null && wallets.length > 0) {
      var ws = [];
      for (var i = 0; i < wallets.length; i++) {
        if (wallets[i].address != address) {
          ws.push(wallets[i]);
        }
      }
      if (address == curWallet.getAddress()) {
        console.log('success');
        // 修改当前钱包
        delLocalStorage(LOCALSTORAGE_CURR_WALLET);
        delLocalStorage(wallet_system + '_zjc' + address);
        delLocalStorage('keystore:' + address);
        delLocalStorage('mnemonic:' + address);
        delLocalStorage('private:' + address);
        if (ws != [] && ws.length > 0) {
          saveLocalStorage(LOCALSTORAGE_CURR_WALLET, JSON.stringify(ws[0]));
        }
      }
      saveLocalStorage(LOCALSTORAGE_WALLETS, JSON.stringify(ws));
    }
  } catch (err) {
    console.error('删除钱包失败' + err);
  }
};
/**
 * 查询交易记录
 * @param address 地址
 * @param offset 分页查询，
 * @param limit 每页限制条数
 * @param callback (err, result) 格式如下：
 */
BtcWallet.prototype.getTransactionHistory = function(address, offset, limit, callback) {
  // TODO 向服务端发启查询交易记录的请求。2,查询本地未完成交易记录，添加到列表的开头返回给用户
  var self = this;
  ServerApi.getRawAddr(address, offset, limit, function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    var historys = [];
    // 获取本地存储的未完成交易列表
    var confirmingList = [];

    if (callback) {
      callback(null, response);
    }
  });
};

BtcWallet.prototype.toJson = function() {
  return {
    address: this.address,
    walletName: this.walletName,
    pwdPrompt: this.pwdPrompt,
  };
};

BtcWallet.prototype.getAddress = function() {
  return this.address;
};
BtcWallet.prototype.getWalletName = function() {
  return this.walletName;
};
BtcWallet.prototype.getPwdPrompt = function() {
  return this.pwdPrompt;
};
BtcWallet.prototype.setWalletName = function(name, callback) {

  // 钱包名字排重处理
  var walletsNames = getLocalStorage(LOCALSTORAGE_WALLETS);
  var walletsObj = (walletsNames !== undefined && walletsNames !== null) ? JSON.parse(walletsNames) : [];
  if (walletsObj !== [] && walletsObj.length > 0) {
    for (var i = 0; i < walletsObj.length; i++) {
      if (walletsObj[i].walletName === name) {
        callback('该用户名已被使用', null);
        return;
      }
    }
  }
  this.walletName = name;
  addNewWallet(this, null);
  return this;
};

/*************************************  私有接口  ****************************************/

// 创建钱包
function exportKeyByMnemonic(mnemonic, password) {
  if (bip39.validateMnemonic(mnemonic)) {
    const hash = bitcoin.crypto.sha256(Buffer.from(mnemonic));
    var keyPair = bitcoin.ECPair.fromPrivateKey(hash, option);
    const wif = keyPair.privateKey;
    const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: net});

    console.log('keyPair========', keyPair);
    console.log('keyPair\'s private=========', wif.toString('hex'));
    console.log('keyPair\'s 16thprivate=========', keyPair.__d.toString('hex'));
    console.log('keyPair\'s WifPrivate=========', keyPair.toWIF());
    console.log('address=========', address);

    var encMnem = encrypt(password, mnemonic);
    saveLocalStorage('mnemonic:' + address, encMnem);

    // 保存加密私钥
    var keystore = encryptPrivate(keyPair.toWIF(), password);
    // var keystore = createKeyStore(password,keyPair.toWIF());
    saveLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + address, keystore);

    return {private: keyPair.toWIF(), address: address, keystore: keystore};
  }
  return {err: 'error'};
}

function getWalletByAddress(address) {
  var walletsStr = getLocalStorage(LOCALSTORAGE_WALLETS);
  var walletsObj = (walletsStr !== undefined && walletsStr !== null) ? JSON.parse(walletsStr) : [];
  if (walletsObj !== [] && walletsObj.length > 0) {
    for (var i = 0; i < walletsObj.length; i++) {
      if (walletsObj[i].address === address) {
        return walletsObj[i];
      }
    }
  }
  return null;
}

function addNewWallet(wallet, keystore) {
  var walletJson = wallet.toJson();
  saveLocalStorage(LOCALSTORAGE_CURR_WALLET, JSON.stringify(walletJson));
  // 为用户增加钱包信息
  var walletsStr = getLocalStorage(LOCALSTORAGE_WALLETS);
  var walletsObj = (walletsStr !== undefined && walletsStr != null) ? JSON.parse(walletsStr) : [];
  var wallets = [];
  if (walletsObj != [] && walletsObj.length > 0) {
    var flag = true;
    for (var i = 0; i < walletsObj.length; i++) {
      if (walletsObj[i].address !== wallet.getAddress()) {
        wallets.push(walletsObj[i]);
      } else {
        wallets.push({
          address: wallet.getAddress(),
          walletName: wallet.getWalletName() !== undefined ? wallet.getWalletName() : walletsObj[i].walletName,
          pwdPrompt: wallet.getPwdPrompt() !== undefined ? wallet.getPwdPrompt() : walletsObj[i].pwdPrompt,
        });
        flag = false;
      }
    }
    if (flag) {
      wallets.push(walletJson);
    }
  } else {
    wallets.push(walletJson);
  }
  saveLocalStorage(LOCALSTORAGE_WALLETS, JSON.stringify(wallets));

  if (keystore !== undefined && keystore !== null) {
    saveKeystore(wallet.address, keystore);
  }

}

function encrypt(password, text) {
  return ezcrypto.Crypto.MARC4.encrypt(text, password);
}

function decrypt(password, text) {
  return ezcrypto.Crypto.MARC4.decrypt(text, password);
}

// bip38 加密私钥
function encryptPrivate(wifString, password) {
  return ezcrypto.Crypto.MARC4.encrypt(wifString, password);
}
function decryptPrivate(encryptedKey, password) {
  return ezcrypto.Crypto.MARC4.decrypt(encryptedKey, password);
}

function saveLocalStorage(key, value) {
  window.localStorage.setItem(key, value);
}

function getLocalStorage(key) {
  return window.localStorage.getItem(key);
}

function delLocalStorage(key) {
  return window.localStorage.removeItem(key);
}

/********************************* BTC 交互接口 *********************************************/
// 新查询余额 btc
BtcWallet.prototype.getBalanceNew = function(address, confirmations, callback) {
  var balance;
  ServerApi.getBtcBalanceNew(address, confirmations, function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    console.log('response========', response);
    // balance = response.data[address].final_balance;
    saveLocalStorage('balance_btc', balance);
    callback(null, balance);
  });
};
// 新查询余额 usdt
BtcWallet.prototype.getUsdtBalance = function(address,callback) {

  ServerApi.getUsdtBalance(address,function (res) {
    let _data = res.data;
    if (_data.status_code === 200) {
      callback(_data);
    }
  })


};

// 查询余额---正式环境 (跨域)  8080
BtcWallet.prototype.getBalance = function(address, callback) {
  var balance;
  ServerApi.getBtcBalance(address, function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    console.log('response=========', response);
    console.log('balance=========', response.data[address].final_balance);   // 0
    balance = response.data[address].final_balance;
    saveLocalStorage('balance_btc', balance);
    callback(null, balance);
  });
};

// 查询utxo---正式环境
BtcWallet.prototype.getUtxoMainnet = function(address) {
  ServerApi.getBtcUnspent(address, function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    console.log('response=========', response.data.unspent_outputs);
  });
};

// 获取确认块数
BtcWallet.prototype.getLastBlock = function(callback) {
  ServerApi.getLastBlock(function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    console.log('response=========', response.data.height);
    callback(null, response.data.height);
  });
};

/**
 * 旷工费计算
 * @param address: 地址
 * @param gasFee: 旷工费
 * @param value: 转账金额
 * @param callback(err)：err:错误信息
 */
BtcWallet.prototype.calBtcGasFee = function(type,address, gasFee, value, callback) {

  ServerApi.getBtcUnspent(address /*"1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY"*/, function(err, response) {
    if (err) {
      callback(err, null);
      return;
    }
    console.log('response===', response.data.unspent_outputs);

    var unspent = response.data.unspent_outputs;
    console.log('unspent===', unspent);
    if (unspent.length <= 0) {
      console.log('无可用的 unspent');
      callback('无可用的 unspent', null);
      return;
    }

    // 转账金额格式化
    var transferAccounts = type === 'BTC' ? new Decimal(value).mul(new Decimal(100000000)).toNumber() : 7000; // default 7000

    // temp money
    var tempMoney = transferAccounts;

    var totalMoney = 0;

    console.log('转账金额:==',transferAccounts);

    var inputNum = 0;
    var outputNum = 0;

    unspent.forEach((value) => {totalMoney += value.value;});

    for (var i = 0; i < unspent.length; i++) {
      if (unspent[i].value < tempMoney) {
        tempMoney -= unspent[i].value;
        inputNum++;
      } else {
        inputNum++;
        outputNum += 2;
        console.log('inputNum,outputNum=====',inputNum,outputNum);
        // 旷工费：148 * 输入数量 + 34 * 输出数量 + 10
        gasFee = gasFee * (148 * inputNum + 34 * outputNum + 10);
        console.log('旷工费', gasFee);
        break;
      }
    }
    console.log('totalMoney===', totalMoney);

    /*
    *  两种情况:
    *  1.btc 旷工费 + 转账金额 > 总金额  则余额不足
    *  2.usdt 旷工费 > 总金额 则余额不足   35为基准 最小旷工费为7910  所以总金额小于7000, 则余额不足
    * */
    if (type === 'BTC') {
      if (totalMoney < (transferAccounts + gasFee)) {
        gasFee = -1;
      }
    }else if(type === 'USDT') {
      if (totalMoney < transferAccounts || totalMoney < gasFee) {
        gasFee = -1;
      }
    }else {
      gasFee = -1;
    }

    callback(null, gasFee);
  });
};

/**
 * 交易广播
 * @param password: 密码
 * @param transtionAddress: 转账地址
 * @param value: 转账金额
 * @param fee：旷工费
 * @param callback(err)：err:错误信息
 */
BtcWallet.prototype.transtionCopy = function(password, transactionObjBtc, callback) {
  try {
    if (!checkTransactionObj(transactionObjBtc)) {
      callback('args error', null);
      return;
    }
    var transtionAddress = transactionObjBtc.to;
    var value = transactionObjBtc.value;
    var gasFee = transactionObjBtc.gasFee;
    var self = this;

    console.log(JSON.stringify(transactionObjBtc) + '---------------');

    value = new Decimal(value).mul(new Decimal(100000000)).toNumber();
    console.log('转账金额', value);


    this.getPrivateKey(password, self.address, function(err, wifPrivate) {

      if (err) {
        callback(err, null);
        return;
      }

      var alice1 = bitcoin.ECPair.fromWIF(wifPrivate, net);
      const p2pkh = bitcoin.payments.p2pkh({pubkey: alice1.publicKey, network: net});

      console.log('alice1=========', alice1);
      // 获取 utxo
      ServerApi.getBtcUnspent(p2pkh.address /*"1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY"*/, function(err, response) {
        if (err) {
          callback(err, null);
          return;
        }
        console.log('response===', response.data.unspent_outputs);

        var unspent = response.data.unspent_outputs;
        console.log('unspent===', unspent);
        if (unspent.length <= 0) {
          console.log('无可用的 unspent');
          callback('无可用的 unspent', null);
          return;
        }

        var txvb = new bitcoin.TransactionBuilder(net);
        txvb.setVersion(1);

        // utxo for 找零 签名
        var money = value;
        var totalMoney = 0;

        // var inputNum = 0;
        // var outputNum = 0;

        for (var i = 0; i < unspent.length; i++) {
          if (unspent[i].value < money) {
            txvb.addInput(unspent[i].tx_hash_big_endian, unspent[i].tx_output_n
              , null, p2pkh.output);
            money -= unspent[i].value;
            totalMoney += unspent[i].value;
            console.log('value===', money);
            // inputNum++;
          } else {
            totalMoney += unspent[i].value;
            console.log('totalMoney===', totalMoney);
            txvb.addInput(unspent[i].tx_hash_big_endian, unspent[i].tx_output_n
              , null, p2pkh.output);
            // txvb.addInput(unspent[i].tx_hash, unspent[i].tx_output_n)
            txvb.addOutput(transtionAddress, value);
            // inputNum++;
            // outputNum += 2;

            // 旷工费：148 * 输入数量 + 34 * 输出数量 + 10
            // gasFee = gasFee * 148 * inputNum + 34 * outputNum + 10;
            // console.log('旷工费', gasFee);

            // 找零
            txvb.addOutput(p2pkh.address, totalMoney - value - gasFee);

            for (var j = 0; j <= i; j++) {
              txvb.sign(j, alice1);
            }
            var sign = txvb.build().toHex();
            console.log('sign===', sign);

            ServerApi.sendTrans(sign, (err, response) => {
              if (err) {
                callback(err, null);
                return;
              }
            });
            console.log('success');
            break;
          }
        }
        callback(null, 'success');
      });
    });
  } catch (e) {
    console.log('error' + e);
  }
};


BtcWallet.prototype.transtionUsdt = function (password, transactionObjBtc, callback) {
  /*
  * this.transactionObjBtc = {
                    to: this.receiveAddress, // 转账地址
                    value: this.transferAccounts, // 金额
                    gasFee: this.absentFees, // 旷工费
                    comment: this.remarks, // 备注
                    // gasLimit: this.gasLimits,
                    // gasPrice: this.gasPrices,
                    // symbol:this.symbols ,
                    // contract_address: this.contracts,
                    // decimals: this.decimalss
                  };
  * */
  if (!checkTransactionObj(transactionObjBtc)) {
    callback('args error', null);
    return;
  }
  var transtionAddress = transactionObjBtc.to;
  var value = transactionObjBtc.value;
  var gasFee = transactionObjBtc.gasFee;
  var self = this;

  this.getPrivateKey(password, self.address, function(err, wifPrivate) {

    if (err) {
      callback(err, null);
      return;
    }

    // TODO:
    usdtTransactionSend(wifPrivate,transactionObjBtc,function (res) {
      callback(null,res);
    })

  });

}

function saveKeystore(address, keystore) {
  var keystoreStr = (typeof keystore === 'string') ? keystore : JSON.stringify(keystore);
  saveLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + address, keystoreStr);
}

function getKeystore(address) {
  var keystore = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + address);
  return keystore;
}

function checkTransactionObj(transactionObj) {
  return transactionObj != null && Validator.isValidAdderssBtc(transactionObj.to);
}

export default {
  BtcWallet,
};
