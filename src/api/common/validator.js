
import ethUtil from 'ethereumjs-util';
import bip39 from 'bip39';
import bitcoin from 'bitcoinjs-lib';

const net = process.env.BTC_NET === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

var Validator = function() {};

Validator.isValidAdderss = function(address) {
	if (address.substring(0, 2) !== "0x") return false;
    else if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) return false;
    else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) return true;
    else
        return address == ethUtil.toChecksumAddress(address);
}
// BTC
Validator.isValidAdderssBtc = function(address) {
  try{
    if (bitcoin.address.toOutputScript(address, net)) return true;
  }catch (e) {
    return false;
  }
  // if (bitcoin.address.toOutputScript(address, bitcoin.networks.testnet)) return true;
  // else return false;
}
Validator.isValidTxHash = function(txHash) {
    return txHash.substring(0, 2) == "0x" && txHash.length == 66 && this.isValidHex(txHash);
}
Validator.isValidHex = function(str) {
	if (str == "") return true;
    str = str.substring(0, 2) == '0x' ? str.substring(2).toUpperCase() : str.toUpperCase();
    var re = /^[0-9A-F]+$/g;
    return re.test(str);
}
Validator.isValidPrivKey = function(privkeyLen) {
    return privkeyLen == 64 || privkeyLen == 66 || privkeyLen == 128 || privkeyLen == 132;
}
Validator.isValidMnemonic = function(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
}
Validator.isPasswordLenValid = function(pass, len) {
    if (pass === 'undefined' || pass == null) return false;
    return pass.length > len;
}
export {
	Validator
}
