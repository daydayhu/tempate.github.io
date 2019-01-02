import Web3 from 'web3';
import Tx from 'ethereumjs-tx';
import Decimal from 'decimal.js';
import Erc20Contract from 'erc20-contract-js';
import { EthUnits } from './ethUnits';
import axios from 'axios';
//import Promise from 'promise-polyfill';

const ERC20Abi = require('./tokenABI');
const GIFTTOKENABI = require('./SphABI');

const NODEURL = process.env.NODE_ENV === 'development' ? 'http://10.10.212.187:8646' :  document.URL.startsWith('http')
    ? '/node'
    : process.env.NODE_URL;
const network = process.env.BTC_NET;
var GIFT_CONTRACT_ADDRESS = "0xD0C81a4a66Eb47D8FBdEEAB6CA576c875F8D2adb".toLocaleUpperCase();

var Web3Node = function(){
	this.web3 = null;
}

var GASLIMIT = 210000;

Web3Node.getWeb3 = function() {
	if(!this.web3) {
		// this.web3 = new Web3(new Web3.providers.HttpProvider("http://117.107.139.42:8087/node"));
		this.web3 = new Web3(new Web3.providers.HttpProvider(NODEURL));
	}
	return this.web3;
}

Web3Node.sendTransferGift = function(address, privateKey, to, value, integral, gasPrice, gasLimit, contractAddress, decimals,
	callback, receipCallback, confirmationCallback) {
	var web3 = Web3Node.getWeb3();
	privateKey = new Buffer(privateKey, 'hex');

	var data = '';
	var tranValue = value;
	if(contractAddress !== null) {
		var myContract = new web3.eth.Contract(GIFTTOKENABI, contractAddress);
		data = myContract.methods.transferSP(to, EthUnits.getValueOfDecimalsToWei(value, decimals), integral).encodeABI();
		to = contractAddress;
		tranValue = '0';
	}

	doSendTransaction(web3, address, gasPrice, gasLimit, to, tranValue, decimals, data, privateKey, 
		callback, receipCallback, confirmationCallback);
}

Web3Node.sendEthTransaction = function(address, privateKey, to, value, gasPrice, gasLimit, contractAddress, decimals,
	callback, receipCallback, confirmationCallback){
	var web3 = Web3Node.getWeb3();
	privateKey = new Buffer(privateKey, 'hex');

	var data = '';
	var tranValue = value;
	if(contractAddress !== null) {
		getTokenAbi(contractAddress, abi => {
			if(abi == null) {
				callback("invalid token", null);
			} else {
				var myContract = new web3.eth.Contract(abi, contractAddress);
				var amount = EthUnits.getValueOfDecimalsToWei(value, decimals);
				data = myContract.methods.transfer(to, amount).encodeABI();
				console.log("data:" + data);
				to = contractAddress;
				tranValue = '0';
				doSendTransaction(web3, address, gasPrice, gasLimit, to, tranValue, decimals, data, privateKey, 
				callback, receipCallback, confirmationCallback);
			}
		});
	} else {
		doSendTransaction(web3, address, gasPrice, gasLimit, to, tranValue, decimals, data, privateKey, 
			callback, receipCallback, confirmationCallback);
	}	
}

Web3Node.getEthBalance = function(address, callback) {
	var web3 = Web3Node.getWeb3();
	web3.eth.getBalance(address).then(function(balance) {
		console.log('balance:' + balance);
		if(balance !== undefined) {
			var b = EthUnits.getValueOfDecimalsFromWei(balance, 18)
			b = new Decimal(b).toFixed(4);
			callback(b);
		}
	});
} 

Web3Node.getErc20Balance = function(address, contractAddress, callback) {
	var web3 = Web3Node.getWeb3();
	getTokenAbi(contractAddress, abi => {
		if(abi == null) {
			callback(0);
		} else {
			var contract = new Erc20Contract(web3, contractAddress, abi);
			contract.decimals().call().then(decimals =>{
				contract.balanceOf(address).call().then(balance => {
					console.log("balance:" + balance);
					if(callback) {
						var b = new Decimal(balance).div(Math.pow(10,decimals)).toFixed(4);
						callback(b);
					}
				});
			});
		}
	});
}

Web3Node.getGiftIntegral = function(address, contractAddress, callback) {
	var web3 = Web3Node.getWeb3();
	// var contract = new Erc20Contract(web3, contractAddress, GIFTTOKENABI);
	var contract = new web3.eth.Contract(GIFTTOKENABI, contractAddress);
	contract.methods.integralOf(address).call().then(integral => {
		console.log("integral:" + integral);
		if(callback) {
			callback(integral);
		}
	});
}

Web3Node.getGasPrice = function(callback) {
	// var web3 = Web3Node.getWeb3();
	// web3.eth.getGasPrice().then(function(price) {
	// 	callback(EthUnits.getValueOfDecimalsFromWei(price, 18));
	// 	// return EthUnits.getValueOfDecimalsFromWei(price);
	// })

	var options = {
	    method: 'get',
	    // url: 'https://api.etherscan.io/api?module=proxy\&action=eth_gasPrice\&apikey=YourApiKeyToken',
	    url: 'https://api.blockcypher.com/v1/eth/main'
	};

	// axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
	axios(options).then(function (response) {
		console.log("response:" + JSON.stringify(response.data));
		var gas = "0.00000001";
		// 判断是16进制字符串
		// var prefix = response.data.result.slice(0,2);
		var value = response.data.medium_gas_price;
	    if (value != undefined && value > 10000000000) {
	     	// self.$Toast('接口报错');
	     	gas = EthUnits.getValueOfDecimalsFromWei(value.toString(), 18);
	    }
	    if (callback) {
	      	callback(gas);
			// console.log(data);
	    }
	}).catch(function (error) {
	    console.log(error);
	});
}

function doSendTransaction(web3, address, gasPrice, gasLimit, to, tranValue, decimals, data, privateKey,
	callback, receipCallback, confirmationCallback) {
	web3.eth.getTransactionCount(address).then(function(count) {
		console.log('count:' + count);
		// var nonce = count + 1;
    // TODO:需要本地存储 count
    let transNonce = Number(count);
    if (localStorage.getItem('transNonce') || localStorage.getItem('transNonce') === 0) {
      if (localStorage.getItem('transNonce') >= transNonce) {
        transNonce = localStorage.getItem('transNonce') + 1;
      }
      localStorage.setItem('transNonce', transNonce);
    }else {
      localStorage.setItem('transNonce', transNonce);
    }

		var rawTx = {
	  		'nonce': web3.utils.toHex(transNonce),
	  		'gasPrice': web3.utils.toHex(EthUnits.getValueOfDecimalsToWei(gasPrice, '18')),
	  		'gasLimit': web3.utils.toHex(gasLimit),
	  		'to': to,
	  		'value': tranValue > 0 ? web3.utils.toHex(EthUnits.getValueOfDecimalsToWei(tranValue, decimals)) : '0x00', //EthUnits.getValueOfDecimalsToWei(value, '18'),
	  		'data': data
		}

		console.log("tx: " + JSON.stringify(rawTx));
		
		var tx = new Tx(rawTx);
		tx.sign(new Buffer(privateKey));

		var serializedTx = tx.serialize();

		web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
		.on('transactionHash', function(hash){
			console.log("hash:" + hash);
			web3.eth.getTransaction(hash).then(console.log);
			// transactionObj[txid] = hash;
			callback(null, hash);
		}) 
		.on('receipt', function(receipt){
			if (callback != null || callback != undefined){
				console.log(receipt);
				receipCallback(receipt);
			}
		})
		.on('confirmation', function(confNumber, receipt){
			console.log('confNumber:' + confNumber);
			console.log(receipt);
			confirmationCallback(confNumber, receipt);
		})
		.on('error', function(error){
			if (callback != null || callback != undefined){
				console.log('web3Error-----------:',error);
				callback(error, null);
			}
		});
	});
}

function getTokenAbi(contractAddress, callback) {
	// var abi = (contractAddress.toLocaleUpperCase() == GIFT_CONTRACT_ADDRESS) ? GIFTTOKENABI : ERC20Abi;
	// callback(abi, null);
	if(network == 'testnet'){
		var abi = (contractAddress.toLocaleUpperCase() == GIFT_CONTRACT_ADDRESS) ? GIFTTOKENABI : ERC20Abi;
		callback(abi, null);
		return;
	}

	var options = {
	    method: 'get',
	    url: 'https://api.etherscan.io/api?module=contract&action=getabi&address=' + contractAddress + '&apikey=H3JGAZHGV5TGNAB87Q9AXHHC8S19DJ3UYJ'
	};
	axios(options).then(function (response) {
		console.log("response:" + JSON.stringify(response.data));
		if(response.data.message == 'OK'){
			var abi = response.data.result;
			callback(JSON.parse(abi), null);
		} else {
			callback(null, "unkonw token contractAddress");
		} 
	}).catch(function (error) {
	    console.log(error);
	    callback(null, error);
	});
}

function checkPassword(password) {
	if(password == undefined || password === '') {
		throw new TypeError()
	}
	return true;
}
function checkTransactionObj(transactionObj){
	return true;
}
export {
	Web3Node
}
