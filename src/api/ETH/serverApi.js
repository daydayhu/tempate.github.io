import Vue from 'vue';
import axios from 'axios';
import qs from 'qs';

const AJAXURL = process.env.NODE_ENV === 'development' ? '/api' :  document.URL.startsWith('http')
    ? ''
    : process.env.API_ROOT;

var ServerApi = function() {};
Vue.prototype.$ethServerApi = ServerApi;

ServerApi.register = function(data, callback) {
  // TODO 用户创建钱包的注册请求
  sendHttp('/wallet/register', 'post', data, function(response) {
    console.log('register:===response:' + JSON.stringify(response));
    callback(response.data);
  });
};

ServerApi.getHistory = function(address, contractAddress, id, size, callback) {
  // TODO 获取用户的地址对应的历史交易记录
  var data = {
    address: address,
    id: id,
    size: size !== undefined ? size : 10,
  };
  if (contractAddress !== null && contractAddress !== undefined) {
    data['contractAddress'] = contractAddress;
  }
  // sendHttp('/wallet/history', 'get', data, function(response) {
  //   // console.log('history:===response:' + JSON.stringify(response));
  //   if (response.status_code != 200) {
  //     callback(response.message, null);
  //   } else {
  //     callback(null, response.data);
  //   }
  // });
  cacheSendHttp('/wallet/history', 'get', data, function(response) {
    // console.log('history:===response:' + JSON.stringify(response));
    if (response.status_code != 200) {
      callback(response.message, null);
    } else {
      callback(null, response.data);
    }
  });
};
/**
 * @param args: {
		item:[{
			txid:
			address:
		}]
 	}
 */
ServerApi.getConfirmCount = function(args, callback) {
  // TODO 查询某次交易对应的块的确认数
  var data = {
    items: args,
  };
  sendHttp('/wallet/confirmCount', 'post', data, function(response) {
    console.log('confirmcount:===response:' + JSON.stringify(response));
    if (response.status_code != 200) {
      callback(response.message, null);
    } else {
      callback(null, response.data);
    }
  });
};

ServerApi.getHoldTokens = function(address, callback) {
  // TODO 查询用户持有的TOKEN列表
  var data = {
    address: address,
  };
  sendHttp('/wallet/holdTokens', 'get', data, function(response) {
    console.log('holdTokens:===response:' + JSON.stringify(response));
    if (response.status_code != 200) {
      callback(response.message, null);
    } else {
      callback(null, response.data);
    }
  });

  // cacheSendHttp('/wallet/holdTokens', 'get', data, function(response) {
  //   console.log('holdTokens:===response:' + JSON.stringify(response));
  //   if (response.status_code != 200) {
  //     callback(response.message, null);
  //   } else {
  //     callback(null, response.data);
  //   }
  // });

};

ServerApi.getAllTokens = function(page, size, callback) {
  // TODO 查询ETH tokens
  var data = {
    page: page,
    size: size !== undefined ? size : 10,
  };
  sendHttp('/wallet/assetList', 'get', data, function(response) {
    console.log('allTokens:===response:' + JSON.stringify(response));
    if (response.status_code != 200) {
      callback(response.message, null);
    } else {
      callback(null, response.data);
    }
  });
};

ServerApi.addToken = function(address, contractAddress, callback) {
  var data = {
    address: address,
    contractAddress: contractAddress,
  };
  sendHttp('/wallet/addHoldToken', 'get', data, function(response) {
    console.log('addholdTokens:===response:' + JSON.stringify(response));
    if (response.status_code != 200) {
      callback(response.message, null);
    } else {
      callback(null, response.data);
    }
  });
};
ServerApi.removeToken = function(address, contractAddress, callback) {
  var data = {
    address: address,
    contractAddress: contractAddress,
  };
  sendHttp('/wallet/removeHoldToken', 'get', data, function(response) {
    console.log('removeholdTokens:===response:' + JSON.stringify(response));
    if (response.status_code != 200) {
      callback(response.message, null);
    } else {
      callback(null, response.data);
    }
  });
};

ServerApi.getNewEthMessage = function(address, success, error) {
  var data = {
    address: address,
  };
  sendHttp('/wallet/newMessageV2', 'get', data, function(response) {
    console.log('newMessage:===response:' + JSON.stringify(response));
    if (success) success(response);
  }, function(err) {
    if (error) error(err);
  });
};

ServerApi.getNewMessage = function(address, id, size, callback) {
  // TODO 查询钱包地址对应的最新消息。
  var data = {
    address: address,
    id: id,
    size: size !== undefined ? size : 10,
  };
  sendHttp('/wallet/newMessage', 'get', data, function(response) {
    console.log('newMessage:===response:' + JSON.stringify(response));
    if (response.status_code != 200) {
      callback(response.message, null);
    } else {
      callback(null, response.data);
    }
  });
};

ServerApi.msgReaded = function(address, callback, error) {
  var data = {
    address: address,
  };
  sendHttp('/wallet/msgReaded', 'get', data, function(res) {
    console.log('newMessage:===response:' + JSON.stringify(res));
    if (callback) callback(res);
  }, function(err) {
    console.log('newMessage:===error:' + JSON.stringify(err));
    if (error) error(err);
  });
};


ServerApi.getTransactionByTxid = function(address,txid,callback,error) {

  if (address && txid) {
    sendHttp('/wallet/getTransaction/'+address+'/'+txid, 'get', '', function(res) {
      console.log('getTransaction:===response:' + JSON.stringify(res));
      if (callback) callback(res);
    }, function(err) {
      console.log('getTransaction:===error:' + JSON.stringify(err));
      if (error) error(err);
    });
  }

};

ServerApi.searchAsset = function(key, callback) {
  // 搜索ETH 代币
  var data = {
    key: key,
  };
  sendHttp('/wallet/queryAsset', 'get', data, function(response) {
    if (response.status_code != 200) {
      callback(response.message, null);
    } else {
      callback(null, response.data);
    }
  });
};

ServerApi.queryPrice = function (res,success,error) {
  console.log(res,"qiwuhiqhwieq---=-=-=---=-");
  var data = ['btc','eth','sph','soc','zsh','usdt'];
  cacheSendHttp('/wallet/queryPrice', 'post', res, function(response) {
    console.log('这里也是一次--------------');
    if (success) success(response);
  },function (err) {
    if (error) error(err);
  });
};

function sendHttp(url, type, data, callback, error) {
  // let self = this;
  console.log('url:' + url);
  console.log('data:' + JSON.stringify(data));
  let options = {};
  let n_type = type ? type : 'post';
  if (n_type === 'get') {
    data = JSON.stringify(data) === '{}' ? '' : '?' + qs.stringify(data);
    options = {
      method: n_type,
      url: AJAXURL + url + data,
    };
  } else if (n_type === 'post') {
    options = {
      method: n_type,
      url: AJAXURL + url,
      data: data,
    };
  }
  axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
  axios(options).then(function(response) {
    if (response.data.status_code !== 200) {
      // self.$Toast('接口报错');
      console.log('error:' + response.data.status_code);
    }
    if (callback) {
      callback(response.data);
      // console.log(data);
    }
  }).catch(function(err) {
    console.log(err);
    if (error) {error(err);}
  });
}

function cacheSendHttp(url, type, data, callback, error) {
  if (type) {
    // only cache GET 200 response, callback 2 times
    let qstring = JSON.stringify(data) === '{}' ? '' : '?' + qs.stringify(data);
    let getUrl = AJAXURL + url + qstring;
    let cacheKey = '_' + getUrl;
    let cacheData = $Store.state.getApiCache(cacheKey);
    let copy_rspData;
    console.log("当前获取数据", cacheKey, cacheData);
    if (cacheData) {
      copy_rspData = JSON.parse(JSON.stringify(cacheData));
    }
    if(copy_rspData && callback){
      callback(copy_rspData);
    }

    sendHttp(url, type, data, function (rspData) {
      console.log('当前存储数据-------------',rspData);
      $Store.state.setApiCache(cacheKey, rspData);
      console.log('apiCacheMap--------',$Store.state.apiCacheMap);
      let copy_rspData = JSON.parse(JSON.stringify(rspData));
      callback(copy_rspData);
    });

  }else{
    sendHttp(url, type, data, callback);
  }
}

export {
  ServerApi,
  sendHttp,
  cacheSendHttp
};
