var DEFAULT_DB_name = 'systemNoticeDB';
var DEFAULT_DB_version = 1;

var CreateDB = function (dbName,version) {
  this.name = dbName || DEFAULT_DB_name;
  this.version = version || DEFAULT_DB_version;
  this.db = null;
  this.defaultTable = {name:'SystemNotice',keyPath:'id',status:'readwrite'};
  this._dataSet = {};
  // TODO:表数组
};

CreateDB.prototype.openDB = function (table,callback) {
  var request = window.indexedDB.open(this.name,this.version);
  var table = table || this.defaultTable;  // 制定表
  request.onsuccess = (e) => {
    console.log('open Success!');
    this.db = e.target.result;
    this.readAll(table,callback);
  };

  request.onupgradeneeded = (e) =>{
    this.db = e.target.result;
    var objectStore;
    // btc
    if(!this.db.objectStoreNames.contains('SystemNotice')){
      objectStore = this.db.createObjectStore('SystemNotice', { keyPath: 'id', autoIncrement: true});
      // 定义存储对象的数据项
      objectStore.createIndex('id', 'id', {
        unique: true
      });
      objectStore.createIndex('type', 'type');
      objectStore.createIndex('assetType', 'assetType');
      objectStore.createIndex('value', 'value');
      objectStore.createIndex('txid', 'txid');
      objectStore.createIndex('time', 'time');
      objectStore.createIndex('readStatus', 'readStatus');

      // objectStore.createIndex('address', 'address');

    }
    // eth
    // if(!this.db.objectStoreNames.contains('ethSystemNotice')){
    //   objectStore = this.db.createObjectStore('ethSystemNotice', { keyPath: 'id', autoIncrement: true});
    //   // 定义存储对象的数据项
    //   objectStore.createIndex('id', 'id', {
    //     unique: true
    //   });
    //   objectStore.createIndex('type', 'type');
    //   objectStore.createIndex('address', 'address');
    //   objectStore.createIndex('assetType', 'assetType');
    //   objectStore.createIndex('value', 'value');
    //   objectStore.createIndex('txid', 'txid');
    //   objectStore.createIndex('time', 'time');
    // }

    console.log('DB version changed to '+this.version);
  };

  request.onerror = (e) => {
    console.log('open Error!');
  };
  return request;
};

CreateDB.prototype.add = function (data,table,success,error) {
  var that = this;
  var table = table || that.defaultTable; // 当前表
  // console.log('当前数据库',that.db);
  that._dataSet[data.id] = JSON.parse(JSON.stringify(data));
  console.log('当前data_____',data,that._dataSet);

  // 添加之前 先判断有无当前主键id，有则进行更新，无则添加
  this.read(data.id,table,function (resData,id) {
      console.log('当前id获取数据成功_'+id,that._dataSet); // 数据为空则添加
      if(!resData) {
        // 进行添加
        var transaction = that.db.transaction([table.name], table.status);
        var objectStore = transaction.objectStore(table.name);
        var request = objectStore.add(that._dataSet[id]);

        request.onsuccess = (event) => {
          console.log('数据写入成功');
          // TODO: 写入成功删除_dataSet中数据
          delete that._dataSet[id];
          if(success) success(event);
        };

        request.onerror = (event) => {
          console.log('数据写入失败',that._dataSet[id]);
          if(error) error(event);
        }

      }else {
        // TODO:进行更新
        delete that._dataSet[id];
        console.log('进行数据更新————待',that._dataSet[id]); // 待
      }

  },function (err) {
      console.log('获取当前id数据失败:'+event);
  });

};

CreateDB.prototype.read = function (id,table,success,error) {
  var table = table || this.defaultTable;
  var transaction = this.db.transaction([table.name]);
  var objectStore = transaction.objectStore(table.name);
  if(id) {
    var request = objectStore.get(id); // objectStore.get()方法用于读取数据，参数是主键的值。
  }else {
    console.log('没有id无法查找');
    return false;
  }

  request.onerror = (event) => {
    if (error) error();
  };

  request.onsuccess = (event) => {
    if (success) {
      success(request.result,id);
    }
  };
};

CreateDB.prototype.readAll = function (table,callback) {
  var table = table || this.defaultTable;
  var objectStore = this.db.transaction(table.name).objectStore(table.name);
  var dataSet = [];

  objectStore.openCursor().onsuccess = (event) => {
    var cursor = event.target.result;
    if (cursor) {
      console.log('所有数据', cursor.value);
      dataSet.unshift(cursor.value);
      cursor.continue();
    } else {
      if (callback) callback(dataSet);
    }
  }
};

CreateDB.prototype.update = function(id,data,table,callback) {
  var table = table || this.defaultTable;
  var data = data;
  // 主键为id
  if (id) {
    data.id = id;
  }else {
    console.log('没有id无法查找');
    return false;
  }

  var request = this.db.transaction([table.name], table.status)
  .objectStore(table.name)
  .put(data);

  request.onsuccess = (event) => {
    console.log('数据更新成功');
    if (callback) callback(event)
  };

  request.onerror = (err) => {
    console.log('数据更新失败');
    if (callback) callback(err)
  }
};

CreateDB.prototype.remove = function (id) {
  var table = this.table;
  var request = this.db.transaction([table.name], table.status)
  .objectStore(table.name)
  .delete(id);

  request.onsuccess = (event) => {
    console.log('数据删除成功');
  };

  request.onerror = (event) => {
    console.log('数据删除成功');
  }
};


CreateDB.prototype.indexGetData = function (callback,obj,key,table) {
  var table = table || this.defaultTable;
  var request = this.db.transaction([table.name], table.status);
  var store = request.objectStore(table.name);
  var key = key || 'id';
  var index = store.index(key);
  var req = index.openCursor();
  var lastId = 1;
  var txid =  (obj && obj.txid) ? obj.txid : '';

  // 判断txid的重复性 重复的不给予添加

  req.onsuccess = function (evt) {
    var cursor = evt.target.result;
    if(cursor){
      console.log('key', cursor.value);
      console.log('key txid', txid);
      lastId = cursor.value.id ? cursor.value.id + 1 : lastId;
      if (cursor.value.txid !== txid) {
        cursor.continue(); //移动到下一项
      }else {
        lastId = -1;
        console.log('最后的id',lastId);
        if (callback) callback(lastId);
      }
    }else {
      console.log('最后的id',lastId);
      if (callback) callback(lastId);
    }
  };
  req.onerror = function (evt) {
    console.error("openCursor error:", evt.target.errorCode || evt.target.error);
  };
}

export default CreateDB



