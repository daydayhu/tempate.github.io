// 数据表ＡＰＩ

var WalletDb = function(){}
WalletDb.init = function(){
	// 创建数据库
	this._db = openDatabase('wallet', '1.0', 10 * 1024 * 1024);
	this._db.transaction(function(tx){
		// 创建数据表
		tx.executeSql('CREATE TABLE IF NOT EXISTS confirming (address, symbol,type,state,confirmed_count,value,txid,fee,from, to,black_number)');
	});
}

WalletDb.openDatabase = function() {
	this._db = openDatabase('wallet', '1.0', 10 * 1024 * 1024);
}

WalletDb.createTable = function(database) {
	var createHistory = 'create table if not exists history (id bigint primary key, address varchar(64) key, symbol varchar(16) primary key, type int, state int, confirmed_count int, value varchar(64), txid varchar(128), fee varchar(64), from varchar(64), to varchar(64), black_number bigint)';
	database.transaction(function (ctx, result) {
		ctx.executeSql(createConfirming, [], function(ctx, result){
			console.log("create confirming success");
		}, function(tx, error) {
			console.error("create confirming failed:" + error);
		});
	});

	var createUserWallet = 'create table if not exists userWallet (address varchar(64) primary key, wallet_name varchar(32), pwd_prompt varchar(32))';
	database.transaction(function (ctx, result) {
		ctx.executeSql(createConfirming, [], function(ctx, result){
			console.log("create confirming success");
		}, function(tx, error) {
			console.error("create confirming failed:" + error);
		});
	});
}