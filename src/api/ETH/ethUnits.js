import Web3 from 'web3';
var EthUnits = function() {};
EthUnits.unitMaps = {
	'0': 'noether',
	'1': 'wei',
	'3': 'kwei',
	'6': 'mwei',
	'9': 'gwei',
	'12':'microetherv',
	'15':'milliether',
	'18':'ether',
	'21':'kether',
	'24':'gether',
	'27':'tether'
};
EthUnits.getValueOfDecimalsFromWei = function(number, decimals) {
	return new Decimal(number).div(Math.pow(10,decimals)).toNumber();
	// var unit = this.unitMaps[decimals];
	// return Web3.utils.fromWei(number, unit);
}

EthUnits.getValueOfDecimalsToWei = function(number, decimals) {
	// var unit = this.unitMaps[decimals];
	// return Web3.utils.toWei(number, unit);
	return new Decimal(number).mul(Math.pow(10,decimals)).toNumber();
}
export {
	EthUnits
}