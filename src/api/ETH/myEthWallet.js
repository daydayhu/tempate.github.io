// import Vue from 'vue';
import bip39 from 'bip39';
import keythereum from 'keythereum';
// import '../common/keythereum.min';
// import Web3 from 'web3';
import crypto from 'crypto';
import Tx from 'ethereumjs-tx';
import {Validator} from '../common/validator';
import {Web3Node} from './Web3Node';
import {ServerApi} from './serverApi';
import {EthUnits} from './ethUnits';
import Decimal from 'decimal.js';
import Vconsole from 'Vconsole';
import Mnemonic from 'bitcore-mnemonic';
import hdkey from 'ethereumjs-wallet/hdkey';
import ethUtil from 'ethereumjs-util';
import ezcrypto from 'ezcrypto';
import $tool from '../common/util.js'

var INVALID_PASSWORD = '私钥错误';
var INVALID_MNEMONIC = '助记词错误';
// var INVALID_PASSWORD = "invalid password";
var INVALID_ADDRESS = 'invalid address';
var INVALID_PRIVATE_KEY = '无效的私钥';
// var INVALID_MNEMONIC = "invalid mnemonic";

// var INVALID_KEYSTORE = "keystore 与密码不匹配";
var INVALID_KEYSTORE = '密码错误';
var INVALID_TRANSACTION_INFO = 'invalid transaction info';
var NODE_URL = 'https://api.game.interrcs.com/eth/';
var GIFT_CONTRACT_ADDRESS = '0xD0C81a4a66Eb47D8FBdEEAB6CA576c875F8D2adb'.toLocaleUpperCase();

var GAS_LIMIT_MIN = 60000;
var GAS_LIMIT_MAX = 600000;
var GAS_PRICE = 0.000000003;

var LOCALSTORAGE_KEYSTORE_PREFIX = 'keystore:';
var LOCALSTORAGE_CURR_WALLET = 'currWallet';
var LOCALSTORAGE_WALLETS = 'eth_wallets';
var LOCALSTORAGE_HISTORY_ID_PREFIX = 'history:id';
var LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX = 'confirming';
var PAGE_SIZE = 20;

var LOCALSTORAGE_BACKUP_ZJC = 'eth_zjc';

// const console = new Vconsole();


var Wallet = function(address, name, pwdPrompt) {
  this.address = address;
  this.walletName = name;
  this.pwdPrompt = pwdPrompt;
  this.cnyBalance = 0;
  this.usdBalance = 0;
};

/*******************************************   钱包基础 交互接口   ***********************************************************/

Wallet.getCurrWallet = function() {
  var walletStr = getLocalStorage(LOCALSTORAGE_CURR_WALLET);
  if (walletStr !== null && walletStr !== undefined) {
    var walletObj = JSON.parse(walletStr);
    return new Wallet(walletObj.address, walletObj.walletName, walletObj.pwdPrompt);
  }
  return null;
};

/**
 * 查询当前的所有钱包列表
 * @ return [{
		address: '0x111aaaa2222',
		walletName: 'name',
		pwdPrompt: 'pwdPrompt',
		keystore: 'keystore'
 	}]
 */
Wallet.getWallets = function() {
  var wallets = getLocalStorage('eth_wallets');
  return wallets !== null ? JSON.parse(wallets) : undefined;
};

/**
 * 生成钱包
 * @param password {string} 用户输入的密码
 * @device {device_id:xxx, client_type:1, push_token:xxxx}
 * @callback function(err, wallet)
 */
Wallet.generate = function(password, walletName, pwdPrompt, callback, device) {
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

    // 生成密钥
    var randomBytes = crypto.randomBytes(16);
    // var arr = new Uint8Array([114, 79, 219, 62, 162, 162, 230, 244, 26, 9, 27, 65, 39, 120, 171, 171]);
    // console.log('arr========================================',arr);
    console.log('randomBytes===============================',randomBytes);
    //  12 word phrase
    var words = randomBytes.toString('hex');
    console.log('words : ', words);
    var mnemonic = bip39.entropyToMnemonic(words);

    console.log('--------BIP39---------');
    console.log('BIP39 : ', mnemonic);
    console.log('--------ETH---------');

    if (!bip39.validateMnemonic(mnemonic)) {
      callback('create failed', null);
    }

    var key = exportKeyByMnemonic(mnemonic, password);

    var wallet = new Wallet(key.address, walletName, pwdPrompt);
    callback(null, wallet);

    // 生成keystore
    var dk = getSaltIv();
    console.log('dk=======================================',dk);
    console.log(dk.salt);
    console.log(dk.iv)
    var keystore = createKeyStore(password, key.private, dk.salt, dk.iv);
    addNewWallet(wallet, keystore);

    // 向服务端注册
    sendRegiste(key.address, device);

  } catch (err) {
    console.error(err);
    callback('创建钱包失败', null);
  }

};

/**
 * 通过助记词导入钱包
 * @param password {string} 用户密码
 * @param mnemonic {string} 助记词
 * @callback function(err, wallet)
 */
Wallet.importMnemonic = function(password, mnemonic, callback, device) {
  console.log('mnemonic:' + mnemonic);
  if (!Validator.isValidMnemonic(mnemonic)) {
    if (callback) {
      callback(INVALID_MNEMONIC, null);
    }
    return;
  }
  var key = exportKeyByMnemonic(mnemonic, password);
  var name = $tool.$getRanNum();
  console.log('privatekey:' + key.private);

  var dk = getSaltIv();

  var keystore = createKeyStore(password, key.private, dk.salt, dk.iv);
  var publicKey = key.address;

  // var publicKey = keythereum.privateKeyToAddress(privateKey);
  console.log('publicKey:' + publicKey);

  var wallet = getWalletByAddress(publicKey);
  if (wallet === null) {
    wallet = new Wallet(publicKey, 'ETH_' + name, '');
  } else {
    wallet = new Wallet(publicKey, wallet.walletName, wallet.pwdPrompt);
  }
  addNewWallet(wallet, keystore);
  if (callback) {
    callback(null, wallet);
  }

  // 向平台注册新用户
  sendRegiste(publicKey, device);
};
/**
 * 通过私钥导入钱包
 * @param password {string} 用户密码
 * @param privateKey {string} 私钥
 * @callback function(err, wallet)
 */
Wallet.importPrivateKey = function(password, privateKey, callback, device) {
  try {
    console.log('privatekey:' + privateKey);
    if (!Validator.isValidPrivKey(privateKey.length)) {
      if (callback) {
        callback(INVALID_PRIVATE_KEY, null);
      }
      return;
    }


    var name = $tool.$getRanNum();
    var dk = getSaltIv();

    var keystore = createKeyStore(password, privateKey, dk.salt, dk.iv);

    var publicKey = keythereum.privateKeyToAddress(privateKey);
    console.log('publicKey:' + publicKey);

    var wallet = getWalletByAddress(publicKey);
    if (wallet === null) {
      wallet = new Wallet(publicKey, 'ETH_' + name, '');
    } else {
      wallet = new Wallet(publicKey, wallet.walletName, wallet.pwdPrompt);
    }
    addNewWallet(wallet, keystore);

    if (callback) {
      callback(null, wallet);
    }

    // 向平台注册新用户
    sendRegiste(publicKey, device);
  } catch (err) {
    console.error('导入私钥失败' + err);
    callback('导入私钥失败', null);
  }
};
/**
 * 通过keystore导入钱包
 * @param password {string} 用户密码
 * @param input {string | object} keystore
 * @return address {string} 钱包地址
 */
Wallet.importFromKeyStore = function(password, input, callback, device) {
  try {
    var name = $tool.$getRanNum();
    var keystore = (typeof input === 'object') ? input : JSON.parse(input);
    var privateKey = keythereum.recover(password, keystore);
    var publicKey = keythereum.privateKeyToAddress(privateKey);
    // var wallet = new Wallet(publicKey);
    var wallet = getWalletByAddress(publicKey);
    if (wallet === null) {
      wallet = new Wallet(publicKey, 'ETH_' + name, '');
    } else {
      wallet = new Wallet(publicKey, wallet.walletName, wallet.pwdPrompt);
    }
    addNewWallet(wallet, keystore);
    if (callback) {
      callback(null, wallet);
    }

    // 向平台注册新用户
    sendRegiste(publicKey, device);
  } catch (err) {
    if (callback) {
      callback(INVALID_KEYSTORE, null);
    }
  }
};
/**
 * 从一个钱包的JSON字符串生成钱包对像
 * @param wallet 钱包的json字符串
 * @return wallet {} 对像
 */
Wallet.importFromWallet = function(wallet) {
  var walletObj = (typeof wallet == 'object') ? wallet : JSON.parse(wallet);
  console.log(walletObj);
  var newWallet = new Wallet(walletObj.address, walletObj.walletName, walletObj.pwdPrompt);
  console.log(newWallet);
  addNewWallet(newWallet);
  return newWallet;
};


Wallet.prototype.delete = function() {
  try {
    var address = this.address;
    var wallets = Wallet.getWallets();
    var curWallet = Wallet.getCurrWallet();
    var wallet_system = localStorage.getItem('wallet_system').toLocaleLowerCase();

    if (wallets != null && wallets.length > 0) {
      var ws = [];
      for (var i = 0; i < wallets.length; i++) {
        if (wallets[i].address != address) {
          ws.push(wallets[i]);
        }
      }
      if (address == curWallet.getAddress()) {
        // 修改当前钱包
        delLocalStorage(LOCALSTORAGE_CURR_WALLET);
        delLocalStorage(wallet_system + '_zjc' + address);
        delLocalStorage('keystore:' + address);
        delLocalStorage('mnemonic:' + address);
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

Wallet.prototype.toJson = function() {
  return {
    address: this.address,
    walletName: this.walletName,
    pwdPrompt: this.pwdPrompt,
    cnyBalance: this.cnyBalance,
    usdBalance: this.usdBalance
    // keystore: (typeof this.keystore === 'string') ? this.keystore : JSON.stringify(this.keystore)
  };
};

/**
 * 导出keyStore
 * @param address {string} 用户钱包地址
 * @return keystore {string} keystore 字符串
 */
Wallet.prototype.getKeystore = function(password, callback) {
  try {
    var keystore = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + this.address);
    var k = (typeof keystore === 'string') ? keystore : JSON.stringify(keystore);
    var privateKey = keythereum.recover(password, JSON.parse(k));

    // return k;
    callback(null, k);
  } catch (err) {
    console.error('密码错误' + err);
    if (callback)
      callback('密码错误', null);
  }
};
Wallet.prototype.getAddress = function() {
  return this.address;
};
Wallet.prototype.getWalletName = function() {
  return this.walletName;
};
Wallet.prototype.getPwdPrompt = function() {
  return this.pwdPrompt;
};
Wallet.prototype.setWalletName = function(name, callback) {
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
/**
 * 修改密码
 * @param oldPassword: 旧密码
 * @param newPassword: 新密码
 * @param callback(err, wallet)：err:错误信息， wallet:新钱包对像
 */
Wallet.prototype.setPassword = function(oldPassword, newPassword, callback) {
  var keystore = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + this.address);
  var keystoreObj = (keystore !== null && typeof keystore === 'object') ? keystore : JSON.parse(keystore);
  let privateKey;
  try {
    privateKey = keythereum.recover(oldPassword, keystoreObj);
  } catch (err) {
    console.log(err);
    callback(INVALID_PASSWORD, null);
    return null;
  }
  var dk = getSaltIv();
  var newKeystore = createKeyStore(newPassword, privateKey, dk.salt, dk.iv);
  saveKeystore(this.address, newKeystore);

  var encMnem = getLocalStorage('mnemonic:' + this.address);
  console.log(encMnem);
  var mnem = decrypt(oldPassword, encMnem);
  console.log(mnem);
  var newMnem = encrypt(newPassword, mnem);
  console.log(newMnem);
  saveLocalStorage('mnemonic:' + this.address.toString('hex'), newMnem);

  callback(null, this);
};
/**
 * 备份助记词
 * @param password {string} 用户密码
 * @param address {string} 用户钱包地址
 * @param callback(err, mnemonic): err:错误信息 Mnemonic:助记词
 */
Wallet.prototype.genMnemonic = function(password, address, callback) {
  var encMnem = getLocalStorage('mnemonic:' + address);

  try {
    var mnem = decrypt(password, encMnem);
    return mnem;
  } catch (e) {
    return false;

  }
  callback(null, mnem);
};
/**
 * @param correctMne 正确的注记词
 * @param validationMne 待验证的助记词
 * @return true: 验证成功 false: 验证失败
 */

Wallet.prototype.validationMnemonic = function(correctMne, validationMne) {
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
 * @param password {string} 用户密码
 * @param address {string} 用户钱包地址
 * @return privateKey {string} 私钥
 */
Wallet.prototype.exportPrivateKey = function(password, address, callback) {
  // var keystore = this.getKeystore(address);
  var keystore = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + address);
  console.log('keystore:' + keystore);
  var keystoreObj = (typeof keystore === 'object') ? keystore : JSON.parse(keystore);
  try {
    var privateKey = keythereum.recover(password, keystoreObj);
    callback(null, privateKey.toString('hex'));
    // return privateKey.toString('hex');
  } catch (err) {
    console.error('密码错误' + err);
    callback('密码错误', null);
    // return "密码错误";
  }
};



Wallet.prototype.updateWallets = function () {
  console.log('当前ETH cny this_balance',this.cnyBalance);
  console.log('当前ETH usd this_balance',this.usdBalance);


  addNewWallet(this,null);
};

/*******************************************   与私有服务 交互接口   ***********************************************************/

/**
 * 注册接口
 */
function sendRegiste(address, device) {
  // 向平台注册新用户
  // return;
  if (device == null || device == undefined || device == '') {
    device = {
      client_type: 1,
      device_id: 'ss',
      push_token: '',
    };
  }
  var data = {
    address: address,
    client_type: device.client_type,
    device_id: device.device_id,
    push_token: device.push_token !== undefined ? device.push_token : '',
  };
  ServerApi.register(data, function(respones) {
    if (respones !== null && respones !== undefined) {
      console.log('response:' + JSON.parse(response));
    }
  });
}

/**
 * 查询钱包中所拥有的资产信息
 * @callback function(err, data) 格式如下：
 data: [{
		'symbol':'ETH',
		'balance':'100',
		'contract_address':'0xqqq',
		'decimals':18
 	}]
 */

Wallet.prototype.getTokens = function(callback) {
  // 1.从服务端获取地址所持有TOKEN信息。 2。循环查询此地址上每个TOKEN所拥有的币数。 3.返回用户token列表
  var self = this;
  ServerApi.getHoldTokens(this.address, function(err, response) {
    var tokens = [];
    var sortTokens = [];
    if (err != null) {
      callback(err, null);
      return;
    }
    if (response != null) {
      response.unshift({
        'symbol': 'ETH',
        'contract_address': null,
        'decimals': 18,
      });
    } else {
      response = [
        {
          'symbol': 'ETH',
          'contract_address': null,
          'decimals': 18,
        }];
    }
    let count = 0;

    if (response !== null && response.length > 0) {
      var _num = 0;
      let _obj = {};
      for (let i = 0; i < response.length; i++) {
        self.getBalance({
          symbol: response[i].symbol,
          contract_address: response[i].contract_address,
          decimals: response[i].decimals,
        }, function(token) {
          count++;

          _obj[response[i].symbol] = {
            'symbol': token.symbol,
            'balance': token.balance,
            'contract_address': token.contract_address,
            'decimals': token.decimals,
            'integral': token.integral,
          };

          tokens.push({
            'symbol': token.symbol,
            'balance': token.balance,
            'contract_address': token.contract_address,
            'decimals': token.decimals,
            'integral': token.integral,
          });
          _num++;
          if (_num === response.length) {
            if (callback) {
              response.forEach((value) => {
                sortTokens.push(_obj[value.symbol]);
              });
              callback(null, sortTokens);
              // callback(null, tokens);
            }
          }
        });
      }
    }
  });
};
/*
*  新增资产
 * @param conAddress 合约地址
 * @param callback (err, result) 格式如下：
* */
Wallet.prototype.addHoldToken = function(conAddress, callback) {
  ServerApi.addToken(this.address, conAddress, function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    callback(null, response);
  });
};
/*
*  移除资产
 * @param conAddress 合约地址
*/
Wallet.prototype.removeHoldToken = function(conAddress, callback) {
  ServerApi.removeToken(this.address, conAddress, function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    callback(null, response);
  });
};
Wallet.prototype.getAllTokens = function(obj, callback) {
  ServerApi.getAllTokens(obj.page, obj.size, function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    callback(null, response);
  });
};
Wallet.prototype.searchAsset = function(asset, callback) {
  ServerApi.searchAsset(asset, function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    callback(null, response);
  });
};
/**
 * 查询指定合约的交易记录
 * @param id 分页查询，当前列表最后一条记录的ID
 * @param contactAddress 合约地址，为null则查询eth交易记录
 * @param symbol TOKEN名称，在getTokens的应答中已给
 * @param decimals TOKEN小数位数，在getTokens的应答中已给
 * @param callback (err, result) 格式如下：
 [
 {
   id: long // 记录ＩＤ。
     address : string // 钱包地址
 type : int  // 转帐类型 1:send 2:receive
 value: string // 交易数量
 txid: string  // 交易ＩＤ
 fee : string  // 矿工费
 black_number : long  // 区块高度
from: string  // 发送者钱包地址
to : string // 接收者钱包地址
state: int // 0:失败， 1:成功， 2:进行中 3:打包中
confirmed_count: int //已确认块数
confirm_max: int //总确认块数
 create_time : long //交易时间
 }
 ]
 */
Wallet.prototype.getTransactionHistory = function(id, contactAddress, symbol, decimals, callback) {
  // TODO 向服务端发启查询交易记录的请求。2,查询本地未完成交易记录，添加到列表的开头返回给用户
  var self = this;
  ServerApi.getHistory(this.address, contactAddress, id, PAGE_SIZE, function(err, response) {
    if (err != null) {
      callback(err, null);
      return;
    }
    var historys = [];
    // 获取本地存储的未完成交易列表
    var confirmingList = [];
    if (id == 0) {
      var confirms = getLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + symbol + ':' + self.address);
      if (confirms !== null && confirms !== [] && confirms.length > 0) {
        confirmingList = JSON.parse(confirms);
        // historys = confirmingList;
      }
    }
    var confirmList = confirmingList;

    if (response != null && response.transcations != null && response.transcations.length > 0) {
      for (var i = 0; i < response.transcations.length; i++) {
        var v = EthUnits.getValueOfDecimalsFromWei(response.transcations[i].value, decimals);
        // response.transcations[i].value = new Decimal(v).toFixed(4);
        response.transcations[i].value = v;
        historys.push(response.transcations[i]);
        if (id == 0 && confirmingList.length > 0) {
          // 过滤掉已打包的数据。
          for (var j = 0; j < confirmingList.length; j++) {
            if (response.transcations[i].txid == confirmingList[j].txid) {
              confirmList.splice(j, 1);
            }
          }
        }
      }
    }

    if (id == 0) {
      if (confirmList.length > 0) {
        historys = confirmList.concat(historys);
        saveLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + symbol + ':' + self.address,
            JSON.stringify(confirmList));
        console.log('histor+  +++ callback ---------------------------', historys);
      } else {
        delLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + symbol + ':' + self.address);
      }
    }
    if (callback) {
      console.log('historys callback ---------------------------', historys);
      callback(null, historys);
    }
  });
};
/**
 * 查询当前钱包的消息
 * @param id 分页查询，当前列表最后一条记录的ID
 * @param callback(err, data) 格式如下：
 [{
		msg_type: 1:send 2:receive
		txid: '0x11111',
		symbot: 'ETH',
		value: '3000'
 	}]
 */
Wallet.prototype.getNewMessage = function(id, callback) {
  ServerApi.getNewMessage(this.address, id, PAGE_SIZE, function(err, data) {
    if (err != null) {
      callback(err, null);
      return;
    }
    for (var i = 0; i < data.length; i++) {
      data[i].value = new Decimal(data[i].value).toFixed(4);
    }
    callback(null, data);
  });
};
/**
 * 查询新交易的已确认块数
 * @param txids: [交易ＩＤ]
 * @param callback(err, result):
 err: 异常信息
 result: {
		state: 0:失败， 1:成功，2:进行中 3:打包中
		confirmed_count: 确认块数
		confirm_max: 总确认块数
		txid: 交易ＩＤ
 	}
 */
Wallet.prototype.getConfirmCount = function(txids, callback) {
  var args = [];
  console.log(txids);
  if (txids != null && txids.length > 0) {
    for (var i = 0; i < txids.length; i++) {
      args.push({
        address: this.address,
        txid: txids[i],
      });
    }
  }
  console.log(args);
  ServerApi.getConfirmCount(args, function(err, data) {
    if (err != null) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
};
/*******************************************   ETH NODE 交互接口   ***********************************************************/

/**
 * 查询矿工手续费接口。页面可滑动改完值
 * @param percentage:
    {
         gas_price: 价格
       percentage: 百分比 传小数 如 10％ 传0.1
    }
 * @result
 {
  gas_limit_min: GAS_LIMIT_MIN,
  gas_limit_max: GAS_LIMIT_MAX,
  gas_price: price
}
 */
Wallet.prototype.getGasInfo = function(percentageObj, callback) {
  var percentage = percentageObj.percentage;
  if (percentageObj.gas_price != undefined && percentageObj.gas_price != null) {
    if (percentage == null && percentage == undefined) {
      percentage = 10;
    }
    percentage = new Decimal(percentage).div(new Decimal(100));
    var limitMax = new Decimal(GAS_LIMIT_MAX);
    var limitMin = new Decimal(GAS_LIMIT_MIN);
    var pirceUse = percentage.mul(limitMax).add(limitMin);
    var fee = new Decimal(percentageObj.gas_price).mul(pirceUse).toFixed(6);
     callback(null, {
      gas_limit: pirceUse.toNumber(),
      gas_price: percentageObj.gas_price,
      fee: fee,
    });
  } else {
    Web3Node.getGasPrice(function(price) {
      console.log('curr price :' + price);
      if (percentage == null && percentage == undefined) {
        percentage = 10;
      }
      percentage = new Decimal(percentage).div(new Decimal(100));
      var limitMax = new Decimal(GAS_LIMIT_MAX);
      var limitMin = new Decimal(GAS_LIMIT_MIN);
      var pirceUse = percentage.mul(limitMax).add(limitMin);
      var fee = new Decimal(price).mul(pirceUse).toFixed(6);
      console.log(fee);
      callback(null, {
        gas_limit: pirceUse.toNumber(),
        gas_price: price,
        fee: fee,
      });
    });
  }
};

/**
 * 查询指定token的持用量
 * @param token {
 *		symbol: string,
 *		contract_address: string
 		decimals: int
 *	}
 * @return {
		symbol: string,
 *		contract_address: string
 		decimals: int
 		value: value
 }
 */
Wallet.prototype.getBalance = function(token, callback) {
  // TODO 向ＥＴＨ节点请求查询钱包TOKEN持有量
  var balance = 0;
  var self = this;
  if (token.contract_address !== null) {
    Web3Node.getErc20Balance(this.address, token.contract_address, function(balance) {
      token['balance'] = balance;
      if (token.contract_address.toLocaleUpperCase() == GIFT_CONTRACT_ADDRESS) {
        Web3Node.getGiftIntegral(self.address, token.contract_address, function(integral) {
          token['integral'] = integral;
          callback(token);
        });
      } else {
        callback(token);
      }
    });
  } else {
    Web3Node.getEthBalance(this.address, function(balance) {
      token['balance'] = balance;
      callback(token);
    });
  }
  // return 1000.00;
};

Wallet.prototype.sendTransferGift = function(password, transactionObj, callback) {
  if (!checkTransactionObj(transactionObj)) {
    callback('args error', null);
    return;
  }
  var self = this;

  this.exportPrivateKey(password, this.address, function(err, privateKey) {
    if (err) {
      callback('密码错误', null);
      return;
    }
    Web3Node.sendTransferGift(self.address, privateKey, transactionObj.to,
        transactionObj.value, transactionObj.integral, transactionObj.gasPrice, transactionObj.gasLimit,
        transactionObj.contract_address, transactionObj.decimals, function(err, txid) {
          // TODO 存储本地，新交易
          var tran = {
            type: 1,
            value: new Decimal(transactionObj.value).toFixed(4),
            txid: txid,
            transaction_type: 1,
            to: transactionObj.to,
            state: 3,
            confirmed_count: 0,
            confirm_max: 24,
            create_time: new Date().toLocaleDateString(),
          };

          var confirmingList = getLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + transactionObj.symbol + ':' +
              self.address);
          if (confirmingList !== null && confirmingList !== [] && confirmingList.length > 0) {
            confirmingList = JSON.parse(confirmingList);
            confirmingList.push(tran);
          } else {
            confirmingList = [tran];
          }
          saveLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + transactionObj.symbol + ':' + self.address,
              JSON.stringify(confirmingList));
          callback(null, txid);
        }, function(receipt) {
          // TODO 更新本地新交易，这时已打好包，进行区块确认
          console.log(receipt);
          var confirmingList = getLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + transactionObj.symbol + ':' +
              self.address);
          if (confirmingList !== null && confirmingList !== []) {
            confirmingList = JSON.parse(confirmingList);
            for (var i = 0; i < confirmingList.length; i++) {
              if (confirmingList[i].txid == receipt.transactionHash) {
                confirmingList[i].black_number = receipt.blockNumber;
              }
            }
            saveLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + transactionObj.symbol + ':' + self.address,
                JSON.stringify(confirmingList));
          }

        }, function(confNumber, receipt) {
          // TODO 确认块数
          console.log(confNumber);
          console.log(receipt);
          var confirmingList = getLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + transactionObj.symbol + ':' +
              self.address);
          if (confirmingList !== null && confirmingList !== []) {
            confirmingList = JSON.parse(confirmingList);
            var newConfirms = [];
            for (var i = 0; i < confirmingList.length; i++) {
              if (confirmingList[i].txid == receipt.transactionHash) {
                confirmingList[i].state = 2;
                confirmingList[i].confirmed_count = confNumber;
                if (confNumber < confirmingList[i].confirm_max) {
                  newConfirms.push[confirmingList[i]];
                }
              }
            }
            saveLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + transactionObj.symbol + ':' + self.address,
                JSON.stringify(newConfirms));
          }
        });
  });
};

/**
 * @param password
 * @param transactionObj
    {
     to: string,
     value: number,
     gasLimit: number,
     gasPrice: number,
     comment: string,
     symbol: string,
     contract_address: string, // 为ETH交易时此值填写 null
     decimals: int // ETH 默认18
    }
 *
 * @param callback
 */
Wallet.prototype.sendTransaction = function(password, transactionObj, callback) {
  // TODO 跟据contactAddress的值判断是ETH交易还是token交易，分别进行不同的处理，2.收到应答存储本地待确认交易列表
  if (!checkTransactionObj(transactionObj)) {
    callback('args error', null);
    return;
  }
  var self = this;

  // var contractAddress = transactionObj.contract_address.length <= 0 ? null : transactionObj.contract_address;
  this.exportPrivateKey(password, this.address, function(err, privateKey) {
    if (err) {
      callback(err, null);
      return;
    }
    Web3Node.sendEthTransaction(self.address, privateKey, transactionObj.to,
        transactionObj.value, transactionObj.gasPrice, transactionObj.gasLimit,
        transactionObj.contract_address, transactionObj.decimals, function(err, txid) {
          if (err) {
            console.error('转帐失败' + err);
            callback(err, null);
            return;
          }
          // TODO 存储本地，新交易
          var tran = {
            symbol: transactionObj.symbol,
            type: 1,
            value: new Decimal(transactionObj.value).toFixed(4),
            txid: txid,
            transaction_type: 1,
            to: transactionObj.to,
            fee: transactionObj.fee,
            from: transactionObj.from,
            state: 3,
            confirmed_count: 0,
            confirm_max: 24,
            create_time: new Date().Format('yyyy-MM-dd hh:mm:ss'),
          };

          var confirmingList = getLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + transactionObj.symbol + ':' +
              self.address);
          if (confirmingList !== null && confirmingList !== [] && confirmingList.length > 0) {
            confirmingList = JSON.parse(confirmingList);
            confirmingList.unshift(tran);
          } else {
            confirmingList = [tran];
          }
          saveLocalStorage(LOCALSTORAGE_LOCAL_CONFIRMING_PREFIX + transactionObj.symbol + ':' + self.address,
              JSON.stringify(confirmingList));
          callback(null, txid);
        }, function(receipt) {
          // TODO 更新本地新交易，这时已打好包，进行区块确认
          console.log(receipt);

        }, function(confNumber, receipt) {
          // TODO 确认块数
          console.log(confNumber);
          console.log(receipt);
        });
  });

};

/******************************************  私有接口   *************************************************/
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
  // 为用户新增钱包信息
  var walletsStr = getLocalStorage(LOCALSTORAGE_WALLETS);
  var walletsObj = (walletsStr !== undefined && walletsStr !== null) ? JSON.parse(walletsStr) : [];
  var wallets = [];
  if (walletsObj !== [] && walletsObj.length > 0) {
    var flag = true;
    for (var i = 0; i < walletsObj.length; i++) {
      if (walletsObj[i].address !== wallet.getAddress()) {
        wallets.push(walletsObj[i]);
      } else {
        wallets.push({
          address: wallet.getAddress(),
          walletName: wallet.getWalletName() !== undefined ? wallet.getWalletName() : walletsObj[i].walletName,
          pwdPrompt: wallet.getPwdPrompt() !== undefined ? wallet.getPwdPrompt() : walletsObj[i].pwdPrompt,
          cnyBalance: wallet.cnyBalance,
          usdBalance: wallet.usdBalance
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
  // walletsObj.push(walletJson);
  if (keystore !== undefined && keystore !== null) {
    saveKeystore(wallet.address, keystore);
  }
}

function createKeyStore(password, privateKey, salt, iv) {

  var options = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: {
      c: 4096,
      dklen: 32,
      prf: 'hmac-sha256',
    },
  };
  var keyObject = keythereum.dump(password, privateKey, salt, iv, options);
  // var keystore = JSON.stringify(keyObject);
  return keyObject;
}

function exportKeyByMnemonic(mnemonic, password) {
  if (bip39.validateMnemonic(mnemonic)) {
    var seed = bip39.mnemonicToSeed(mnemonic);
    var walletEth = hdkey.fromMasterSeed(seed);
    const acct = walletEth.derivePath(`m/44'/60'/0'/0/0`);
    const privateKey = acct.getWallet().getPrivateKey();
    const publicKey = ethUtil.privateToPublic(privateKey);
    var ethaddress = ethUtil.publicToAddress(publicKey);

    console.log('--------ETH---------');
    console.log('ETH Address :', '0x' + ethaddress.toString('hex'));
    console.log('ETH Private : ', '0x' + privateKey.toString('hex'));

    // 保存助记词
    // var dk = getSaltIv();
    var encMnem = encrypt(password, mnemonic);
    saveLocalStorage('mnemonic:0x' + ethaddress.toString('hex'), encMnem);

    return {private: privateKey.toString('hex'), address: '0x' + ethaddress.toString('hex')};
  }
  return {err: 'error'};

}

function encrypt(password, text) {
  var Crypto2 = ezcrypto.Crypto;
  var crypted = Crypto2.MARC4.encrypt(text, password);
  return crypted;
}

function decrypt(password, text) {
  var Crypto2 = ezcrypto.Crypto;
  var crypted = Crypto2.MARC4.decrypt(text, password);
  return crypted;
}

function getSaltIv() {
  return {
    salt: crypto.randomBytes(32),
    iv: crypto.randomBytes(16),
  };
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

function saveKeystore(address, keystore) {
  var keystoreStr = (typeof keystore === 'string') ? keystore : JSON.stringify(keystore);
  saveLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + address, keystoreStr);
}

function getKeystore(address) {
  var keystore = getLocalStorage(LOCALSTORAGE_KEYSTORE_PREFIX + address);
  return keystore;
}

function checkPassword(password) {
  if (password == undefined || password === '') {
    throw new TypeError();
  }
  return true;
}

function checkTransactionObj(transactionObj) {
  return transactionObj != null && Validator.isValidAdderss(transactionObj.to);
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt) { //author: meizz
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    'S': this.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
};

// 转账

// var data = {"name": "bob", "extended_public_key": "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8" };
// $.post('https://api.blockcypher.com/v1/btc/main/wallets/hd?token=USERTOKEN', JSON.stringify(data))
//   .then(function(d) {console.log(d)});

export default {
  Wallet,
};
