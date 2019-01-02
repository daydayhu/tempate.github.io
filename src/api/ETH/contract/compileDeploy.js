//FILE:compileDeploy.js
console.log('Setting up ...');
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const web3 = new Web3(new Web3.providers.HttpProvider("http://10.10.212.187:8646"));
console.log('Reading Contract...');
const input = fs.readFileSync('SharePowerToken.sol');
console.log('Compiling Contract...');
const output = solc.compile(input.toString(),1);
const bytecode = output.contracts[':SharePowerToken'].bytecode;
const abi = output.contracts[':SharePowerToken'].interface;
console.log(bytecode);

//Contract Object
var account = '0x1df62f291b2e969fb0849d99d9ce41e2f137006e';
console.log("account:" + account);
const helloWorldContract = new web3.eth.Contract(JSON.parse(abi), {data: '0x' + bytecode});

web3.eth.getTransactionCount(account).then(function(count) {
	var rawTx = {
		nonce: web3.utils.toHex(count),
	    from: '0x1df62f291b2e969fb0849d99d9ce41e2f137006e',
	    gasLimit: web3.utils.toHex(4000000),
	    gasPrice: web3.utils.toHex('20000000000'),
	    data: helloWorldContract.deploy().encodeABI()
	}

	var tx = new Tx(rawTx);
	tx.sign(Buffer.from('b0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773', 'hex'));

	var serializedTx = tx.serialize();

	web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
	.on('transactionHash', function(transactionHash){
	    console.log("deploy transaction hash: ", transactionHash)
	})
	.on('receipt', function(receipt){
	    console.log("deploy receipt: ", receipt)
	})
	.on('confirmation', function(confirmationNum, receipt){
	    console.log("got confirmations number: ", confirmationNum)
	})
});


// var tx = sign(helloWorldContract, {
// 	'nonce': web3.utils.toHex(count),
//     from: '0x1df62f291b2e969fb0849d99d9ce41e2f137006e',
//     gasLimit: web3.utils.toHex(4000000),
//     gasPrice: web3.utils.toHex('20000000000')
// }, 'b0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773');
// console.log(tx);
// // helloWorldContract.deploy().send({
// //     from: '0x1df62f291b2e969fb0849d99d9ce41e2f137006e',
// //     gasLimit: web3.utils.toHex(4000000),
// //     gasPrice: web3.utils.toHex('20000000000')
// // })
// web3.eth.sendSignedTransaction(tx)
// .on('transactionHash', function(transactionHash){
//     console.log("deploy transaction hash: ", transactionHash)
// })
// .on('receipt', function(receipt){
//     console.log("deploy receipt: ", receipt)
// })
// .on('confirmation', function(confirmationNum, receipt){
//     console.log("got confirmations number: ", confirmationNum)
// })
// // .then(async function(myContactInstance){
// //     util.log("deployed successfully.")
// //     util.log("now the addr %o balance is %o", account, await web3.eth.getBalance(account))

// //     // testContact(myContactInstance)
// // })
// .catch(err => {
//     console.log("Error: failed to deploy, detail:", err)
// })


// function sign(myContract, rawTx, privateKey){
// 	// var rawTx = {
// 	//   		'nonce': web3.utils.toHex(count),
// 	//   		'gasPrice': web3.utils.toHex(EthUnits.getValueOfDecimalsToWei(gasPrice, '18')),
// 	//   		'gasLimit': web3.utils.toHex(gasLimit),
// 	//   		'to': to,
// 	//   		'value': tranValue > 0 ? web3.utils.toHex(EthUnits.getValueOfDecimalsToWei(tranValue, decimals)) : '0x00', //EthUnits.getValueOfDecimalsToWei(value, '18'),
// 	//   		'data': data
// 	// 	}

// 	// privateKey = new Buffer(privateKey, 'hex');
// 	web3.eth.getTransactionCount(address).then(function(count) {

// 	});

// 	data = myContract.deploy().encodeABI();
// 	rawTx.data = data;

// 	console.log("tx: " + JSON.stringify(rawTx));

// 	var tx = new Tx(rawTx);
// 	console.log(JSON.stringify(Buffer.from(privateKey, 'hex')));
// 	tx.sign(Buffer.from(privateKey, 'hex'));

// 	var serializedTx = tx.serialize();

// 	return '0x' + serializedTx.toString('hex')
// }



// console.log("Deploying the contract");

// const helloWorldContractInstance = helloWorldContract.new({
//     data: '0x' + bytecode,
//     from: account,
//     gas: 1000000
// }, (err, res) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     console.log(res.transactionHash);
//     // If we have an address property, the contract was deployed
//     if (res.address) {
//         console.log('Contract address: ' + res.address);
//     }
// });