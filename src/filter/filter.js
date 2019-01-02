import Vue from 'vue';
import {EthUnits} from '../api/ETH/ethUnits';
import Decimal from 'decimal.js';

Vue.filter('dateFormat', function(value) {
  var time = new Date(value * 1000);
  var y = time.getFullYear();
  var m = time.getMonth() + 1;
  var d = time.getDate();
  var h = time.getHours();
  var mm = time.getMinutes();
  var s = time.getSeconds();

  function add0(m) {
    return m < 10 ? '0' + m : m;
  }

  return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
});

Vue.filter('numFormat', function(value, type) {
  let _value = 0;
  switch (type) {
    case 'ETH':
      _value = Number(parseFloat(value).toFixed(5).slice(0, -1));
      break;
    case 'BTC':
    case 'USDT':
      value = new Decimal(value).div(new Decimal(100000000)).toNumber();
      _value = Number(parseFloat(value).toFixed(9).slice(0, -1));
      let m = _value.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
      _value = _value.toFixed(Math.max(0, (m[1] || '').length - m[2]));
      break;
    case 'usdt':
      _value = Number(parseFloat(value).toFixed(3).slice(0, -1));
      break;
    default:
      _value = Number(parseFloat(value).toFixed(5).slice(0, -1));
      break;
  }
  return _value;
});

Vue.filter('rateFormat', function(value, type) {
  if (value != '' && value != undefined) {
    switch (type) {
      case 'ETH':
        break;
      case 'BTC':
      case 'USDT':
        value = new Decimal(value).div(new Decimal(100000000)).toNumber();
        break;
      default:
        break;
    }
  }else {
    value = 0;
  }

  return Number(parseFloat(value).toFixed(3).slice(0, -1));
});

Vue.filter('feeFormat', function(value) {
  return new Decimal(value).div(new Decimal(100000000)).toString();
});

Vue.filter('ETH_fee', function(value) {
  return EthUnits.getValueOfDecimalsFromWei(value, 18);
});
// 科学计算显示
Vue.filter('toNonExponential', function(value) {
  let m = value.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  return value.toFixed(Math.max(0, (m[1] || '').length - m[2]));
});

// ETH 交易记录 金额
Vue.filter('ETH_transFee',function (value) {
  return new Decimal(value).toFixed(4);
});

// ETH 交易详情页 金额
Vue.filter('ETH_recordFee',function (value) {
  value = new Decimal(value).toFixed(4).toString();
  console.log(value);

  if((/[0]\.[0]{4}/).test(value)){
    return new Decimal(value).toFixed(4)+"...";
  }else {
    return new Decimal(value).toFixed(4);
  }

});


Vue.directive('focus', {
  // 当绑定元素插入到 DOM 中。

  inserted: function (el) {
    // 聚焦元素
    setTimeout(()=>{
      el.focus()
    },20)
  },
  //也可以用update,update就是当页面有操作的时候就触发，比如点击按钮，输入框输入都算。
  //有一个要注意的就是，就是你页面有几个input,比如一个input绑定了v-focus,一个没有绑定。你在没绑定v-focus的input输入时，绑定了v-focus的input就是自动获取焦点，这是个bug.
  //update: function (el) {
  //el.focus()
  //}
});
