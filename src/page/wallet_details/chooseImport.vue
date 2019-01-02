<template>
    <div style="height: 100%;">
        <!--<v-nav>导入钱包</v-nav>-->
        <div class="top_nav">
            <div class="back_icon" @click="back"></div>
            <p v-if="emptyWallet !== 'wallet'">导入钱包</p>
            <p v-else>导入{{sys}}钱包</p>
        </div>

        <div class="content_color">
          <div class="content_padding">
            <ul>
                <li @click="tabSelect(CURRENCYTYPE.mnemonic)" :class="{'selected': currencyType === CURRENCYTYPE.mnemonic}">
                    助记词
                </li>
                <li @click="tabSelect(CURRENCYTYPE.keystore)" :class="{'selected': currencyType === CURRENCYTYPE.keystore}">
                    Keystore
                </li>
                <li @click="tabSelect(CURRENCYTYPE.privateKey)"
                    :class="{'selected': currencyType === CURRENCYTYPE.privateKey}">私钥
                </li>
            </ul>

            <div style="padding-bottom: 1rem">
                <input type="text" readonly class="noShow"/>
                <input type="password" readonly class="noShow"/>
                <textarea class="sr" name="a" id="substance" :placeholder="placObj[currencyType]" v-model.trim="substanceObj[currencyType]"></textarea>

                <div class="bd" @click="promptShow =true" v-show="emptyWallet !== 'wallet'">
                  <span class="down_icon"></span>
                  <input type="text" readonly placeholder="钱包生态体系" v-model.trim="selectType"></div>
                <div class="bd">
                    <input type="password" :placeholder="currencyType === CURRENCYTYPE.keystore ? '输入密码':'设置密码'" v-model.trim="password1" @focus="focus1" @blur="blur1">
                </div>
                <p :class="[{'visibi':passRe},{'error-color':errorColor1}]" class="passRe">8-16位字符，建议混合使用大小写字母、数字和常用字符</p>
                <div class="bd" v-show="currencyType !== 'keystore'">
                    <input type="password" placeholder="重复密码" v-model.trim="password2">
                </div>
                <div class="divz clear">
                    <div class="dh float" @click="show=!show" :class="show?'bg':'bg1'"></div>
                    <span class="float" style="color:rgba(107,121,156,1);">我已经仔细阅读并同意了</span>
                    <div @click="reg">
                        <span class="float" style="color:rgba(107,121,156,1); text-decoration: underline;margin-left: 0.1rem">服务及隐私条款</span>
                    </div>
                </div>
                <button id="btn" @click="judge" :class="showBt ?'bt':'bt1'" :disabled="isDisabled">开始导入</button>
                <div class="btn_div"></div>

            </div>
        </div>
    </div>
      <regulations v-show="showRe" @showRegulation="showReg"></regulations>
        <prompt :promptType="1" :selectList="[
          {
            name: 'ETH',
            checked: selectType=='ETH',
          }, {
            name: 'BTC',
            checked: selectType=='BTC',
          }]" v-show="promptShow" @maskcallback="selectPromptClose"
                @selectcb="changeType"></prompt>

    </div>
</template>

<script>
  import $ from 'jquery';
  import $RN from '../../api/common/regExpVal';
  import prompt from '../../components/prompt';
  import regulations from  '../../components/common/regulation'

  export default {
    name: 'chooseImport',
    data() {
      return {
        index: 0,
        CURRENCYTYPE: {
          mnemonic: 'mnemonic',
          keystore: 'keystore',
          privateKey: 'privateKey'
        },
        currencyType: 'mnemonic',

        show: false,
        substanceObj: {
          mnemonic:'',
          keystore:'',
          privateKey:''
        },
        password1: '',
        password2: '',
        as: true,
        passRe: true,
        errorColor1: false,
        isDisabled: true,

        placObj:{
          mnemonic:'助记词，以空格为单词间的区分',
          keystore:'输入Keystore文件内容至输入框',
          privateKey:'请输入明文私钥'
        },
        promptShow: false,
        selectType: 'ETH',
        showRe: false,
        sys: '',

        emptyWallet: '',
      };
    },
    methods: {
      selectPromptClose() {
        this.promptShow = false;
      },
      changeType(item) {
        this.selectType = item.name;
        this.promptShow = false;
      },
      tabSelect(type) {
        this.currencyType = type;
        if (type === this.CURRENCYTYPE.mnemonic) {
          this.index = 0;
        } else if (type === this.CURRENCYTYPE.privateKey) {
          this.index = 2;
        } else {
          this.index = 1;
        }
      },

      back() {
        history.back();
      },
      showReg(val){
        this.showRe = val;
      },
      reg(){
        this.showRe = true;
      },
      judge() {
        var _this = this;

        _this.$indicator.open();
        setTimeout(() => {
            var sys = _this.selectType;
            // var sys = this.sys;
            localStorage.setItem('wallet_system', sys);
            if (sys === 'ETH') {
              switch (_this.currencyType) {
                case 'mnemonic':
                  if (_this.password1 !== _this.password2) {
                    setTimeout(() => {_this.$indicator.close();}, 0);
                    this.$Tool.$Toast('密码不一致');
                    return;
                  }
                  _this.common.Wallet.importMnemonic(_this.password1, _this.substanceObj[_this.currencyType], (err, wallet) => {
                    if (err) {
                      setTimeout(() => {_this.$indicator.close();}, 0);
                      _this.Lhide();
                      $('.btn_div').html(err).show().delay(500).fadeOut();
                    } else {
                      setTimeout(() => {_this.$indicator.close();}, 0);
                      // _this.$store.commit('address', wallet.address);

                      localStorage.setItem('eth_zjc' + wallet.address, '4');
                      _this.$router.push({
                        path: '/index',
                        query: {
                          type: 'ETH',
                        },
                      });

                    }
                  }, null);
                  break;
                case 'privateKey':
                  if (_this.password1 !== _this.password2) {
                    setTimeout(() => {_this.$indicator.close();}, 0);
                    this.$Tool.$Toast('密码不一致');
                    return;
                  }
                  _this.common.Wallet.importPrivateKey(_this.password1, _this.substanceObj[_this.currencyType], (err, wallet) => {
//                   console.log(wallet)
                    if (err) {
                      setTimeout(() => {_this.$indicator.close();}, 0);
                      _this.Lhide();
                      $('.btn_div').html(err).show().delay(500).fadeOut();
                    } else {
                      setTimeout(() => {_this.$indicator.close();}, 0);
                      // _this.$store.commit('address', wallet.address);

                      localStorage.setItem('eth_zjc' + wallet.address, '2');
                      localStorage.setItem('isCanBackUp:' + wallet.address, 'no');
                      _this.$router.push({
                        path: 'index',
                        query: {
                          type: 'ETH',
                        },
                      });

                    }
                  }, null);
                  break;
                case 'keystore':
                  _this.common.Wallet.importFromKeyStore(_this.password1, _this.substanceObj[_this.currencyType], (err, wallet) => {
                    if (err) {
                      setTimeout(() => {_this.$indicator.close();}, 0);
                      _this.Lhide();
                      $('.btn_div').html(err).show().delay(500).fadeOut();
                    } else {
                      localStorage.setItem('eth_zjc' + wallet.address, '3');
                      localStorage.setItem('isCanBackUp:' + wallet.address, 'no');
                      _this.$router.push({
                        path: 'index',
                        query: {
                          type: 'ETH',
                        },
                      });

                    }
                  }, null);
              }
            } else if (sys === 'BTC') {
              switch (this.currencyType) {
                case 'mnemonic':
                  if (_this.password1 !== _this.password2) {
                    setTimeout(() => {_this.$indicator.close();}, 0);
                    this.$Tool.$Toast('密码不一致');
                    return;
                  }
                  _this.btcCommon.BtcWallet.importByMnemonic(_this.password1, _this.substanceObj[_this.currencyType], (err, wallet) => {
                    if (err) {
                      setTimeout(() => {_this.$indicator.close();}, 0);
                      _this.Lhide();
                      $('.btn_div').html(err).show().delay(500).fadeOut();
                    } else {
                      localStorage.setItem('btc_zjc' + wallet.address, '4');
                      _this.$router.push({
                        path: 'index',
                        query: {
                          type: 'BTC',
                        },
                      });

                    }
                  }, null);
                  break;
                case 'privateKey':
                  if (_this.password1 !== _this.password2) {
                    setTimeout(() => {_this.$indicator.close();}, 0);
                    this.$Tool.$Toast('密码不一致');
                    return;
                  }
                  _this.btcCommon.BtcWallet.importByPrivate(_this.password1, _this.substanceObj[_this.currencyType], (err, wallet) => {
//                    console.log(wallet)
                    if (err) {
                      setTimeout(() => {_this.$indicator.close();}, 0);
                      _this.Lhide();
                      $('.btn_div').html(err).show().delay(500).fadeOut();
                    } else {
                      localStorage.setItem('btc_zjc' + wallet.address, '2');

                      localStorage.setItem('isCanBackUp:' + wallet.address, 'no');
                      _this.$router.push({
                        path: 'index',
                        query: {
                          type: 'BTC',
                        },
                      });

                    }
                  }, null);
                  break;
                case 'keystore':
                  _this.btcCommon.BtcWallet.importFromKeyStore(_this.password1, _this.substanceObj[_this.currencyType], (err, wallet) => {
                    if (err) {
                      setTimeout(() => {_this.$indicator.close();}, 0);
                      _this.Lhide();
                      $('.btn_div').html(err).show().delay(500).fadeOut();
                    } else {
                      localStorage.setItem('isCanBackUp:' + wallet.address, 'no');
                      localStorage.setItem('btc_zjc' + wallet.address, '3');
                      _this.$router.push({
                        path: 'index',
                        query: {
                          type: 'BTC',
                        },
                      });

                    }
                  }, null);
              }
            }
        }, 1000);

      },
      focus1() {
        this.passRe = false;
        this.errorColor1 = false;
      },
      blur1() {
        if ($RN.password.test(this.password1)) {
          this.passRe = true;
          this.errorColor1 = false;
        } else {
          this.passRe = false;
          this.errorColor1 = true;
        }
      },
      showa() {
        $('.btn_div').show().delay(500).fadeOut();
      },
      Lshow() {
        this.$indicator.open();
      },
      Lhide() {
        this.$nextTick(()=>{             this.$indicator.close();           });
      },
    },
    watch: {},
    mounted() {

      this.selectType = this.$route.query.type || 'ETH';

      this.sys = this.$route.query.type;
      this.emptyWallet = this.$route.query.wallet;
    },
    computed: {
      removemodals() {
        return this.$store.state.removemodals;
      },
      password() {
        return this.$store.state.password;
      },
      a() {
        return this.$store.state.a;
      },
      showBt() {
        let flag = false;
        switch (this.currencyType) {
          case 'keystore':
            if (this.substanceObj[this.currencyType] !== '' && this.password1 !== '' && this.show) {
              this.isDisabled = false;
              flag = true;
            } else {
              this.isDisabled = true;
              flag = false;
            }
            break;
          case 'privateKey':
          case 'mnemonic':
            if (this.substanceObj[this.currencyType] !== '' && this.password1 !== '' && this.password2 !== '' && this.show) {
              this.isDisabled = false;
              flag = true;
            } else {
              this.isDisabled = true;
              flag = false;
            }
            break;
          default:
            break;
        }
        return flag;
      },
    },
    components: {
      prompt,
      regulations,
    },
  };
</script>

<style scoped>
    .content_padding {
        padding-left: 0.45rem;
    }

    ul {
        display: flex;
        justify-content: flex-start;
        font-size: 0.26rem;
        font-family: PingFang-SC-Medium;
        font-weight: 500;
        color: rgba(107, 121, 156, 1);
        line-height: 0.37rem;
        margin-top: 0.5rem;
    }

    ul li {
        color: rgba(107, 121, 156, 1);
        margin-right: 1.3rem;
    }

    .tab {
        display: flex;
        justify-content: flex-start;
        font-size: 0.26rem;
        font-family: PingFang-SC-Medium;
        font-weight: 500;
        color: rgba(107, 121, 156, 1);
        line-height: 0.37rem;
        margin-top: 0.5rem;
    }

    ul li.selected {
        color: rgba(255, 255, 255, 1);
        border-bottom: 0.06rem solid rgba(255, 255, 255, 1);
        padding-bottom: 0.05rem;
    }

    .tab a {
        margin-right: 1.3rem;
    }

    .tab span {
        color: rgba(107, 121, 156, 1);
        display: inline-block;
    }

    .hovers {
        color: rgba(255, 255, 255, 1) !important;
        border-bottom: 0.06rem solid rgba(255, 255, 255, 1);
        padding-bottom: 0.05rem;
    }

    .chovers {
        color: rgba(255, 255, 255, 1) !important;
        border-bottom: 0.06rem solid rgba(255, 255, 255, 1);
        padding-bottom: 0.05rem;
    }

    /*表单*/
    .bd {
        width: 6.57rem;
        border-bottom: 0.02rem solid rgba(107, 121, 156, 1);
        position: relative;
    }

    .bd input {
        margin-top: 0.2rem;
        border: none;
        width: 100%;
        line-height: 0.6rem;
        padding: 0.1rem;
        box-sizing: border-box;
        background-color: #2C3754;
        font-size: 0.3rem;
        font-weight: 500;
        /*color: rgba(107, 121, 156, 1);*/
        color:rgba(195,208,243,1);
        padding: 0;
    }

    .bd input::-webkit-input-placeholder { /* Chrome/Opera/Safari */
      color:rgba(107,121,156,1);
    }
    .bd input::-moz-placeholder { /* Firefox 19+ */
      color:rgba(107,121,156,1);
    }
    .bd input:-ms-input-placeholder { /* IE 10+ */
      color:rgba(107,121,156,1);
    }
    .bd input:-moz-placeholder { /* Firefox 18- */
      color:rgba(107,121,156,1);
    }

    .bd .down_icon {
      content: '';
      position: absolute;
      right: 0.1rem;
      top: -0.56rem;
      width: 0.24rem;
      height: 0.24rem;
      border-top: 2px solid;
      border-right: 2px solid;
      transform: rotateZ(135deg);
      border-color: rgba(195,208,243,1);
    }


    .dh {
        width: 0.44rem;
        height: 0.44rem;
        margin-top: 0.6rem;
    }

    .bg {
        background: url("../../assets/common/img/icon_xuanze_pre@3x.png") no-repeat;
        background-size: cover;
    }

    .bg1 {
        background: url("../../assets/common/img/icon_xuanze@3x.png") no-repeat;
        background-size: cover;
    }

    .divz {
        width: 100%;
        text-align: center;
        margin-bottom: 0.89rem;
    }

    span {
        font-size: 0.26rem;
        margin: 0.64rem 0 0 0.25rem;
    }

    .bt1 {
        width: 5.9rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%);
        border-radius: 0.6rem;
        margin-left: 0.3rem;
        display: block;
        font-size: 0.4rem;
        font-family: PingFang-SC-Bold;
        color: rgba(255, 255, 255, 0.4);
        border: none;
    }

    .bt {
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%);
        width: 5.9rem;
        height: 1rem;
        border-radius: 0.6rem;
        margin-left: 0.3rem;
        display: block;
        font-size: 0.4rem;
        font-family: PingFang-SC-Bold;
        color: rgba(255, 255, 255, 1);
        border: none;
    }

    .sr {
        width: 6.7rem;
        height: 3.14rem;
        background: rgba(250, 250, 250, 1);
        border-radius: 0.08rem;
        border: 0px solid rgba(239, 239, 239, 1);
        line-height: 0.4rem;
        margin-top: 0.47rem;
        padding: 0.21rem 0.30rem;
        color: rgba(164, 164, 164, 1);
        font-size: 0.28rem;
    }

    .pz {
        text-align: left !important;
        font-size: 0.23rem;
        font-family: PingFang-SC-Medium;
        color: rgba(164, 164, 164, 1);
        line-height: 0.4rem;
    }

    .pzs {
        text-align: left !important;
        font-size: 0.23rem !important;
        color: rgba(47, 124, 243, 1);
        margin-left: 0 !important;
        line-height: 0.8rem;
    }

    /*异常提醒*/
    .passRe {
        font-size: 0.20rem;
        color: rgba(216, 216, 216, 1);
        line-height: 0.4rem;
        text-align: left;
        width: 6.67rem;
        margin-top: 0.10rem;
        /*margin-left: auto;*/
        /*margin-right: auto;*/
    }

    .visibi {
        /*visibility: hidden;*/
        display: none;
    }

    .error-color {
        color: #FF6363;
    }
    .noShow{
        position: fixed;
        top: -999px;
    }
</style>
