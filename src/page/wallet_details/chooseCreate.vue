<template>
    <div style="height: 100%;">
        <!--头部-->
        <!--<v-nav>创建钱包</v-nav>-->
        <div class="top_nav">
            <div class="back_icon" @click="back"></div>
            <p v-if="emptyWallet !== 'wallet'">创建钱包</p>
            <p v-else>创建{{currencyType}}钱包</p>
        </div>

        <div class="content_color">

            <!--选择体系-->
            <div class="chooseSystem" v-show="emptyWallet !== 'wallet'">
                <p class="c_tx">钱包生态体系</p>
                <ul id="lis">
                    <li @click="tabSelect(CURRENCYTYPE.ETH)" :class="{'selected': currencyType === CURRENCYTYPE.ETH}">ETH
                    </li>
                    <li @click="tabSelect(CURRENCYTYPE.BTC)" :class="{'selected': currencyType === CURRENCYTYPE.BTC}">BTC
                    </li>
                </ul>
            </div>

            <!--<router-view></router-view>-->

            <!--表单-->
            <div style="padding:0 0.45rem;">
                <form>
                    <input type="text" readonly class="noShow">
                    <input type="password" readonly class="noShow">
                    <div>
                        <input type="text" placeholder="钱包名称" id="username" v-model.trim="username" @focus="focus1"
                               @blur="blur1" autocomplete="off">
                    </div>
                    <h2 class="passRe" :class="[{'visibi':userRe},{'error-color':errorColor}]">{{errorText}}</h2>
                    <div>
                        <input autocomplete="off" type="password" placeholder="密码" @focus="focus2" @blur="blur2"
                               v-model.trim="password">
                    </div>
                    <h2 class="passRe" :class="[{'visibi':passRe},{'error-color':errorColor1}]">
                        8-16位字符，建议混合使用大小写字母、数字和常用字符</h2>
                    <div>
                        <input autocomplete="off" type="password" placeholder="重复密码" v-model.trim="conPassword">
                    </div>


                    <div class="divz clear">
                        <div class="dh float" id="bg" @click="yisi=!yisi" :class="yisi?'bg':'bg1'"></div>
                        <span class="float">我已经仔细阅读并同意了</span>
                        <div>
                            <span @click="cacheWalletData" class="float" style="color:rgba(107,121,156,1); text-decoration: underline;margin-left: 0.1rem">服务及隐私条款</span>
                        </div>
                    </div>
                </form>
            </div>

            <button id="btn" type="button" :class="qr?'bt':'bt1'" @click="estimate()" :disabled="isDisabled">确认</button>

            <!--<p class="import" @click="importW">导入{{currencyType}}钱包</p>-->

            <p v-if="emptyWallet !== 'wallet'" class="import" @click="importW_other">导入钱包</p>
            <p  class="import" @click="importW" v-else>导入{{currencyType}}钱包</p>

            <div class="btn_div"></div>


        </div>

      <regulations v-show="showRe" @showRegulation="showReg"></regulations>
    </div>
</template>

<script>
  import $ from 'jquery';
  import $RN from '../../api/common/regExpVal';
  import regulations from '../../components/common/regulation';

  export default {
    name: 'chooseCreate',
    data() {
      return {
        yisi: false,
        passRe: true,
        visibi: true,
        errorText: '',
        CURRENCYTYPE: {
          BTC: 'BTC',
          ETH: 'ETH',
        },
        currencyType: '',

        // 表单
        username: '',
        password: '',
        conPassword: '',
        userRe: true,
        errorColor: false,
        errorColor1: false,

        text: '',
        as: true,
        loadText: 'loading',
        zjc: false,

        isDisabled: true,
        next: true,

        showRe: false,

        emptyWallet: '',
      };
    },
    methods: {
      init() {
        this.getCurrencyType();
        this.getTempCache();
        console.log('currencyType:', this.currencyType);
      },
      getTempCache() {
        if (localStorage.getItem('tempWalletData')) {
          var _tempWalletData = JSON.parse(localStorage.getItem('tempWalletData'));
          this.username = _tempWalletData.username;
          this.password = _tempWalletData.password;
          this.conPassword = _tempWalletData.conPassword;
        }
      },
      getCurrencyType() {
        //TODO: 展示当前currencyType
        this.currencyType = localStorage.getItem('wallet_system') ? localStorage.getItem('wallet_system') : 'ETH';
      },
      back() {
        this.cleanTempCache();
        history.back();
      },
      showReg(val){
        this.showRe = val;
      },
      cacheWalletData() {
        console.log(this.username, this.password, this.conPassword);
        var _tempWalletData = {
          username: this.username,
          password: this.password,
          conPassword: this.conPassword,
        };

        localStorage.setItem('tempWalletData',JSON.stringify(_tempWalletData));

        this.showRe = true;
      },

      cleanTempCache() {
        if (localStorage.getItem('tempWalletData')) {
          localStorage.removeItem('tempWalletData');
        }
      },
      tabSelect(type) {
        this.currencyType = type;
        // localStorage.setItem('wallet_system', this.currencyType);
      },

      importW() {
        this.cleanTempCache();
        this.$router.push({
          path: '/import',
          query: {
            type: this.currencyType,
            wallet: 'wallet'
          },
        });
      },

      importW_other() {
        this.cleanTempCache();
        this.$router.push({
          path: '/import',
          query: {
            type: this.currencyType,
          },
        });
      },

      // 表单
      focus1() {
        this.userRe = true;
        this.errorColor = false;
      },
      focus2() {
        this.passRe = false;
        this.errorColor1 = false;
      },
      blur1() {
        this.userRe = true;
        if ($RN.username.test(this.username)) {
          var wallets;
          if (this.currencyType === 'ETH') {
            wallets = JSON.parse(localStorage.getItem('eth_wallets'));
          } else if (this.currencyType === 'BTC') {
            wallets = JSON.parse(localStorage.getItem('btc_wallets'));
          }
          if (wallets) {
            for (var i = 0; i < wallets.length; i++) {
              if (wallets[i].walletName === this.username) {
                this.$nextTick(()=>{             this.$indicator.close();           });
                this.userRe = false;
                this.errorColor = true;
                this.errorText = '用户名已存在';
                this.next = true;
                return false;
              }
            }
          } else {
            this.userRe = true;
            this.errorColor = false;
          }
        } else {
          this.errorText = '1-30位字符，支持数字、大小写字母和常用字符';
          this.userRe = false;
          this.errorColor = true;
        }
      },
      blur2() {
        this.passRe = true;
        this.errorColor1 = false;
        if ($RN.password.test(this.password)) {
          this.passRe = true;
          this.errorColor1 = false;
        } else {
          this.passRe = false;
          this.errorColor1 = true;
        }
      },
      drawBarChart() {
        $('.btn_div').show().delay(500).fadeOut();
      },

      estimate() {
        if (this.next) {
          this.$indicator.open();
          this.next = false;
          //TODo: 校验用户名
          var wallets;
          if (this.currencyType === 'ETH') {
            wallets = JSON.parse(localStorage.getItem('eth_wallets'));
          } else if (this.currencyType === 'BTC') {
            wallets = JSON.parse(localStorage.getItem('btc_wallets'));
          }
          if (wallets) {
            for (var i = 0; i < wallets.length; i++) {
              if (wallets[i].walletName === this.username) {
                this.$nextTick(()=>{             this.$indicator.close();           });
                this.errorColor = true;
                this.errorText = '用户名已存在';
                this.next = true;
                return false;
              }
            }
          }
          // 校验密码
          if (this.password !== this.conPassword) {
            this.$nextTick(()=>{             this.$indicator.close();           });
            this.drawBarChart();
            $('.btn_div').html('密码不一致');
            this.next = true;
            return false;
          }

          if (this.currencyType === this.CURRENCYTYPE.ETH) {
            this.cleanTempCache();
            this.eth_create();

          } else if (this.currencyType === this.CURRENCYTYPE.BTC) {
            this.cleanTempCache();
            this.btc_create();
          }

        }
      },

      //TODO: 此处逻辑待确认

      eth_create() {
        console.log('create eth wallet');
        var _this = this;
        setTimeout(function() {
          _this.common.Wallet.getCurrWallet();
          _this.$store.commit('username', _this.username);//抛出钱包名
          _this.common.Wallet.generate(_this.password, _this.username, _this.text, (err, wallet) => {
            if (err) {
              setTimeout(() => {_this.$indicator.close();}, 0);
              _this.drawBarChart();
              $('.btn_div').html(err);
              _this.next = true;
            } else {
              setTimeout(() => {_this.$indicator.close();}, 0);
              localStorage.setItem('wallet_system', _this.currencyType);
              _this.$store.commit('address', wallet.address);//抛出钱包地址
              localStorage.setItem('eth_zjc' + wallet.address, '1');

              setTimeout(function() {
                _this.$router.push({
                  path: '/backWarn',
                  query: {
                    type: _this.currencyType,
                  },
                });
              }, 1000);

            }
            setTimeout(() => {_this.$indicator.close();}, 0);
          }, 0);

        }, 1000);
      },

      //TODO: 此处逻辑待确认

      btc_create() {
        console.log('create btc wallet');
        var _this = this;
        setTimeout(function() {
          _this.btcCommon.BtcWallet.getCurrWallet();
          _this.$store.commit('username', _this.username);//抛出钱包名
          _this.btcCommon.BtcWallet.genAddress(_this.password, _this.username, _this.text, (err, wallet) => {
            if (err) {
              setTimeout(() => {_this.$indicator.close();}, 0);
              _this.drawBarChart();
              $('.btn_div').html(err);
              _this.next = true;
            } else {
              setTimeout(() => {_this.$indicator.close();}, 0);
              localStorage.setItem('wallet_system', _this.currencyType);
              _this.$store.commit('address', wallet.address);//抛出钱包地址
              localStorage.setItem('btc_zjc' + wallet.address, '1');

              setTimeout(function() {
                _this.$router.push({
                  path: '/backWarn',
                  query: {
                    type: _this.currencyType,
                  },
                });
              }, 500);

            }
          }, 1000);
        });
      },
      drawBarChart() {
        $ ('.btn_div').show().delay (500).fadeOut ();
      },
    },
    computed: {
      // 确认按钮
      qr: function() {
        if (this.userRe && this.passRe && this.yisi && this.username !== '' && this.password !== '' && this.conPassword !==
            '') {
          this.isDisabled = false;
          return true;
        } else {
          this.isDisabled = true;
          return false;
        }
      },
      changeLogin() {
        return this.$store.state.changeLogin;
      },
      removemodals() {
        return this.$store.state.removemodals;
      },
      a() {
        return this.$store.state.a;
      },
      isLoading() {
        return this.$store.state.isLoading;
      },
      back_zjc() {
        return this.$store.state.back_zjc;
      },

    },
    mounted() {

      this.init();
      this.$store.commit('a', this.as);
      this.$store.commit('back_zjc', this.zjc);
      this.emptyWallet = this.$route.query.wallet;
    },
    beforeRouteLeave(to, from, next) {
      from.meta.keepAlive = false;
      next();
    },
    components:{
      regulations,
    },
  };
</script>

<style scoped>
    .noShow{
        position: fixed;
        top: -999px;
    }
    .chooseSystem {
        margin-left: 0.45rem;
        margin-top: 0.42rem;
    }

    .c_tx {
        font-size: 0.30rem;
        font-weight: 500;
        color: rgba(216, 216, 216, 1);
        line-height: 0.42rem;
    }

    ul {
        margin-top: 0.39rem;
        width: 6.57rem;
        height: 0.65rem;

    }

    ul > li {
        font-size: 0.28rem;
        font-weight: 500;
        color: rgba(97, 110, 145, 1);
        line-height: 0.65rem;
        width: 50%;
        text-align: center;
        float: left;
        border: 0.02rem solid rgba(95, 108, 142, 1);
    }

    ul > li:first-child {
        border-top-left-radius: 0.33rem;
        border-bottom-left-radius: 0.33rem;
    }

    ul > li:last-child {
        border-top-right-radius: 0.33rem;
        border-bottom-right-radius: 0.33rem;
    }

    ul > li.selected {
        background-color: #616E91;
        color: #ffffff;
    }

    /*表单*/
    form div {
        height: 1rem;
        width: 6.57rem;
        border-bottom: 0.02rem solid rgba(68, 78, 105, 1);
        margin-top: 0.39rem;
    }

    form div input {
        border: none;
        height: 0.95rem;
        width: 100%;
        background-color: #2C3754;
        font-size: 0.3rem;
        font-weight: 500;
        /*color: rgba(97, 110, 145, 1);*/
        color:rgba(195,208,243,1);
        line-height: 0.42rem;
        padding: 0;
    }


    form div input::-webkit-input-placeholder { /* Chrome/Opera/Safari */
      color: rgba(97, 110, 145, 1);
    }
    form div input::-moz-placeholder { /* Firefox 19+ */
      color: rgba(97, 110, 145, 1);
    }
    form div input:-ms-input-placeholder { /* IE 10+ */
      color: rgba(97, 110, 145, 1);
    }
    form div input:-moz-placeholder { /* Firefox 18- */
      color: rgba(97, 110, 145, 1);
    }

    .divz div {
        border: none;
    }

    .dh {
        width: 0.44rem;
        height: 0.44rem;
        margin-top: 0.6rem;
    }

    .bg {
        border: 0px;
        background: url("../../assets/common/img/icon_xuanze_pre@3x.png") no-repeat;
        background-size: cover;
    }

    .bg1 {
        border: 1px solid #6B799C !important;
        border-radius: 50%;
    }

    .divz {
        width: 100%;
        text-align: center;
        border: none;
        font-size: 0.26rem;
        color: rgba(107, 121, 156, 1);
        margin-bottom: 0.89rem;
    }

    span {
        font-size: 0.26rem;
        margin: 0.64rem 0 0 0.25rem;
    }

    .bt {
        width: 5.9rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%);
        border-radius: 0.6rem;
        margin: 0 0.8rem;
        font-size: 0.4rem;
        font-family: PingFang-SC-Bold;
        color: rgba(255, 255, 255, 1);
        border: none;
    }

    .bt1 {
        width: 5.90rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%);
        border-radius: 0.60rem;
        font-size: 0.40rem;
        font-weight: bold;
        color: rgba(255, 255, 255, 0.4);
        line-height: 1rem;
        border: none;
        margin: 0 0.8rem;
    }

    .btn_div {
        display: none;
        position: absolute;
        top: 70%;
        width: 3.8rem !important;
        height: 0.96rem;
        background: rgb(0, 0, 0);
        border-radius: 0.48rem;
        opacity: 0.8138;
        left: 28%;
        color: white;
        text-align: center;
        line-height: 0.96rem;
        z-index: 999;
    }

    .import {
        font-size: 0.31rem;
        font-family: PingFangSC-Semibold;
        font-weight: 600;
        color: rgba(107, 121, 156, 1);
        line-height: 45px;
        margin-top: 0.32rem;
        text-align: center;
    }

    /*异常提醒*/
    .passRe {
        font-size: 0.20rem;
        color: rgba(216, 216, 216, 1);
        line-height: 0.4rem;
        text-align: left;
        width: 6.67rem;
        margin-top: 0.10rem;
        margin-left: auto;
        margin-right: auto;
    }

    .visibi {
        /*visibility: hidden;*/
        display: none;
    }

    .error-color {
        color: #FF6363;
    }

    .btn_div {
        display: none;
        position: absolute;
        top: 70%;
        width: 3.8rem !important;
        height: 0.96rem;
        background: rgb(0, 0, 0);
        border-radius: 0.48rem;
        opacity: 0.8138;
        left: 28%;
        color: white;
        text-align: center;
        line-height: 0.96rem;
    }

    .btn_div {
        width: 3.66rem;
        height: 0.96rem;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 0.48rem;
        display: none;
        position: absolute;
        top: 6.12rem;
        left: 50%;
        margin-left: -1.83rem;
        font-size: 0.30rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 1);
        line-height: 0.96rem;
    }

</style>
