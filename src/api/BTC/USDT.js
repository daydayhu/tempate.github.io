import axios from 'axios';
import qs from 'qs';

const AJAXURL = process.env.NODE_ENV === 'development' ? '/api' : document.URL.startsWith('http')
    ? ''
    : process.env.API_ROOT;
class USDT {
  sendHttp(url, type = 'post', data, callback) {
    let options = {
      method: type,
    };
    if (type === 'get') {
      data = JSON.stringify(data) === '{}' ? '' : '?' + qs.stringify(data);
      Object.assign(options, {
        url: AJAXURL + url + data,
      });
    } else if (type === 'post') {
      Object.assign(options, {
        url: AJAXURL + url,
        data: qs.stringify(data),
      });
    }
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    axios(options).then((response) => {
      callback(response);
    }).catch(function(error) {
      console.log(error);
    });
  }

  getAddrV2(data, callback) {

    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    axios.post(AJAXURL+'/apiomni/v2/address/addr/', data).then((response) => {
      callback(response);
    }).catch(function(error) {
      console.log(error);
    });

    // axios.post('http://10.10.212.187:8087/usdt/getBalanceTestnet',data).then((response) => {
    //   callback(response);
    // }).catch(function(error) {
    //   console.log(error);
    // });

  }

}

const $USDT = new USDT();

export {
  $USDT,
};
