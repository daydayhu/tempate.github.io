// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import Vuex from 'vuex';
import VueQriously from 'vue-qriously';
import MintUI from 'mint-ui';
import common from './api/ETH/myEthWallet';
import passW from './api/ETH/passwordValidator';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './assets/common/js/app.js';
import 'mint-ui/lib/style.css';
import btcCommon from './api/BTC/myBtcWallet';
import Decimal from 'decimal.js';

// import VConsole from 'vconsole';
// var vConsole = new VConsole();

require('es6-promise').polyfill();
import './filter/filter';

import './assets/common/css/common.css';

import $util from './api/common/util';

Vue.prototype.$Tool = $util;
global.Decimal = Decimal;
Vue.use(Vuex);
Vue.use(VueQriously);
Vue.use(MintUI);
Vue.config.devtools = true;
Vue.config.productionTip = false;
Vue.prototype.common = common;
Vue.prototype.btcCommon = btcCommon;
console.log(common);
Vue.prototype.passW = passW;
console.log(passW);

require('babel-polyfill');
//全局返回功能
Vue.component('v-nav', {
  template: `<h2 class="top_nav" style="font-weight: bold">
                <span class="back_icon" @click="back"></span>
                <slot></slot>
            </h2>`,
  methods: {
    back() {
      history.back();
    },
  },
});

global.$Store = {
  state: {
    apiCacheMap: {},
    getApiCache(key) {
      console.log('apiCacheMap------', this.apiCacheMap);
      return this.apiCacheMap[key];
    },
    setApiCache(key, data) {
      if (this.apiCacheMap[key]) {
        this.apiCacheMap[key] = null;
      }
      return this.apiCacheMap[key] = data;
    },
  },
};

// ETH
const store = new Vuex.Store({
  state: {
    a: '',// 自定义模态框显示隐藏
    eth_s: '',
    fetchLoading: false,// 请求数据时加载状态loading
    username: '',//钱包名
    password: '',//密码
    address: '',
    addsa: '',//私钥
    keystore: '',
    backups: '',
    symbols: '',
    balances: '',
    balances_s: '',
    contracts: '',
    decimalss: '',
    token: '',
    text: '',
    number: '',
    fees: '',
    gasPrices: '',
    gasLimits: '',
    comments: '',//备注
    txid: '',
    b_number: '',
    times: '',
    balance_s: '',
    froms: '',
    back_zjc: '',
    btcfees: 35,
    gasFee: '',
    removemodals() {
      // 删除script后面所有的div;
      $('script').next('div').remove();
      //判断是否有本地钱包，没有跳转到登录页面

      if (!this.common.Wallet.getCurrWallet() && !this.btcCommon.BtcWallet.getCurrWallet()) {
        this.$router.push({path: '/login'});
      }
    },

    // isLogin(){
    //   localStorage.setItem('isLogin', texts);//备注
    // },
  },
  mutations: {
    froms(state, price) {
      state.froms = price;
    },
    balance_s(state, price) {
      state.balance_s = price;
    },
    balances_s(state, price) {
      state.balances_s = price;
    },
    txid(state, price) {
      state.txid = price;
    },
    b_number(state, price) {
      state.b_number = price;
    },
    times(state, price) {
      state.times = price;
    },
    a(state, price) {
      state.a = price;
    },
    username(state, price) {
      state.username = price;
    },
    address(state, price) {
      state.address = price;
    },
    addsa(state, price) {
      state.addsa = price;
    },
    keystore(state, price) {
      state.keystore = price;
      console.log(state.keystore);
    },
    backups(state, price) {
      state.backups = price;
    },
    password(state, price) {
      state.password = price;
      console.log(state.password);
    },
    removemodals(state, price) {
      state.removemodals = price;
    },
    symbols(state, price) {
      state.symbols = price;
    },
    balances(state, price) {
      state.balances = price;
    },
    contracts(state, price) {
      state.contracts = price;
    },
    decimalss(state, price) {
      state.decimalss = price;
      // console.log(state.decimalss)
    },
    token(state, price) {
      state.token = price;
    },
    text(state, price) {//转账地址
      state.text = price;
      console.log(state.text);
    },
    number(state, price) {//转账金额
      state.number = price;
    },
    fees(state, price) {
      state.fees = price;
    },
    gasLimits(state, price) {
      state.gasLimits = price;
    },
    gasPrices(state, price) {
      state.gasPrices = price;
    },
    comments(state, price) {
      state.comments = price;
    },
    eth_s(state, price) {
      state.eth_s = price;
    },
    back_zjc(state, price) {
      state.back_zjc = price;
    },
    btcfees(state, price) {
      state.btcfees = price;
    },
    gasFee(state, price) {
      state.gasFee = price;
    },
  },
});

(function() {
  !document.URL.startsWith('http') ? document.addEventListener('deviceready', deviceready, false) : deviceready();

  function deviceready() {
    new Vue({
      el: '#app',
      router,
      store,
      components: {App},
      template: '<App/>',
    });
  }
})();
