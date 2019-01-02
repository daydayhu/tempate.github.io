//FILE:compile.js
const fs = require ('fs');
const solc = require ('solc');
const input = fs.readFileSync('SharePowerToken.sol');
const output = solc.compile(input.toString(), 1);
for (var contractName in output.contracts){
 console.log(contractName + ': ' + output.contracts[contractName].bytecode)
}
const abi = output.contracts[':SharePowerToken'].interface;
console.log(abi);