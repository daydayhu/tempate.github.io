<template>
    <div style="height: 100%;">
        <div class="top_nav">
            <div class="back_icon" @click="back"></div>
            <p style="width: 100%;text-align: center">{{symbol}} 转账</p>
            <div class="scanning" @click="scanning" v-if="isApp"></div>
        </div>

        <!--头部结束-->
        <div class="content_color">
            <div class="forms">
                <div>
                    <input type="text" placeholder="收款方地址" v-model.trim="receiveAddress">
                </div>
                <div style="color: #FF6363;">{{addressErr}}</div>
                <div style="position: relative;">
                    <!--onkeyup="this.value=this.value.replace(/[^0-9\.]/g,'')"-->

                    <input type="number" placeholder="转账金额" v-model.trim="transferAccounts" oninput="if(value.length>14)value=value.slice(0,14)" onpaste="return false;">
                    <div class="p_zhje">账户金额：<span>{{this.balances | numFormat('ETH')}} {{symbol}}</span></div>
                </div>

                <p>&nbsp;旷工费用</p>
                <div style="border: none!important;margin:0" v-model="data">
                    <!--<input type="range" name="range_speed" id="range_speed" value="30" @input="aaaa()"/>-->
                    <mt-range
                            v-model="rangeValue"
                            :min="0"
                            :max="100"
                            :step="1"
                            :bar-height="5"
                    >

                    </mt-range>
                </div>
                <p><em>慢</em><em>{{absentFees}}ETH</em><em>快</em></p>
            </div>
            <button id="btn" data-toggle="modal" data-target="#aboutModal" @click="estimate" :class="qr?'btn1':'btn2'"
                    :disabled="isDisabled">下一步
            </button>
            <div class="btn_div"></div>
        </div>
    </div>
</template>
<script>
  import $ from 'jquery';
  import {Validator} from '../../../api/common/validator';

  export default {
    data() {
      return {
        currentWallet: null,
        currencyType: '',
        gaoYuanId: 'aboutModal',
        as: false,
        tag: false,
        mins: '',
        maxs: '',
        steps: '',
        data: '',
        balance_L: '',
        transactionObj: {},
        balances: '',
        addressErr:'',
        symbol: '',
        receiveAddress: '',
        transferAccounts: '',
        remarks: '',
        absentFees: '',
        gasPrices: '',
        gasLimits: '',
        decimals: '',
        contract_address: '',
        isApp: false,

        isDisabled: true,
        rangeValue:30
      };
    },
    methods: {
      browserType() {
        let u = global.navigator.userAgent;
        return {
          trident: u.indexOf('Trident') > -1, //IE内核
          presto: u.indexOf('Presto') > -1, //Opera内核
          webKit: u.indexOf('AppleWebKit') > -1, //苹果/谷歌内核
          gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1, //火狐内核
          // ||!!u.match(/AppleWebKit/)&&u.indexOf('QIHU')&&u.indexOf('Chrome')<0
          mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
          ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //iOS终端
          android: /Android/i.test(u), //Android终端或者UC浏览器
          iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
          iPad: u.indexOf('iPad') > -1, //是否iPad
          webApp: u.indexOf('Safari') === -1, //是否Web应该程序，没有头部与底部

        };
      },
      scanning() {
        var that = this;
        try {
          cordova.plugins.barcodeScanner.scan(
              (result) => {
                console.log(('We got a barcode\n' +
                    'Result: ' + result.text + '\n' +
                    'Format: ' + result.format + '\n' +
                    'Cancelled: ' + result.cancelled));

                that.receiveAddress = result.text;
              },
              (error) => {
                console.log(JSON.stringify(error) +'扫一扫失败') ;
                that.$Tool.$Toast('用户拒绝访问权限');
              },
              {
                preferFrontCamera: false,  // iOS and Android 设置前置摄像头
                showFlipCameraButton: false, // iOS and Android 显示旋转摄像头按钮
                showTorchButton: false, // iOS and Android 显示打开闪光灯按钮
                torchOn: false, // Android, 默认打开手电筒
                saveHistory: true, // Android, save scan history (default false)
                prompt: '', // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: 'QR_CODE,PDF_417', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'portrait', // Android only (portrait|landscape), default unset so it rotates with the device 显示方向
                disableAnimations: false, // iOS 是否禁止动画
                disableSuccessBeep: true, // iOS and Android  禁止成功后提示声音 “滴”
              },
          );
        } catch (e) {
          that.$Tool.$Toast('暂时无法使用');
          that.isApp = false;
          that.receiveAddress = '';
        }

      },
      drawBarChart() {
        $('.btn_div').show().delay(500).fadeOut();
      },
      estimate() {
        this.addressErr ='';

        if (this.receiveAddress == '') {
          this.drawBarChart();
          $('.btn_div').html('请输入转账地址');
          return;
        } else if (this.receiveAddress == this.currentWallet.address) {
          this.drawBarChart();
          $('.btn_div').html('地址不可与自己一致');
          return;
        } else if (!Validator.isValidAdderss(this.receiveAddress)) {
          this.$nextTick(()=>{             this.$indicator.close();           });
          this.addressErr='收款地址有误，请输入正确的ETH地址！';
        } else if (this.transferAccounts == '') {
          this.drawBarChart();
          $('.btn_div').html('请输入金额');
          this.$store.commit('a', false);
          return;
        } else if (this.symbols == 'ETH' && parseFloat(this.balances) < this.transferAccounts) {
          this.drawBarChart();
          $('.btn_div').html('金额不足');
          return;
        } else if (this.symbols != 'ETH' && parseFloat(this.balances) < this.transferAccounts) {
          this.drawBarChart();
          $('.btn_div').html('金额不足');
          return;
        } else if (this.transferAccounts < 0) {
          this.drawBarChart();
          $('.btn_div').html('转账金额必须大于0');
          return;
        } else {
          this.addressErr ='';
          if (parseFloat(this.absentFees) + parseFloat(this.transferAccounts) > parseFloat(this.balances)) {
            this.drawBarChart();
            $('.btn_div').html('余额不足');
            return;
          } else {
            this.$store.commit('a', true);
            this.$store.commit('text', this.receiveAddress);
            this.$store.commit('number', this.transferAccounts);
            this.$store.commit('comments', this.remarks);
            localStorage.setItem('comments_l', this.remarks);//备注
            this.$router.push({
              path: '/eth_ok',
              query: {
                type: 'ETH',
                symbol: this.symbol,
                receiveAddress: this.receiveAddress,
                transferAccounts: this.transferAccounts,
                remarks: this.remarks,
                absentFees: this.absentFees,
                gasPrices: this.gasPrices,
                gasLimits: this.gasLimits,
                decimals: this.decimals,
                contract_address: this.contract_address,
              },
            });
          }
        }
      },
      aaaa() {

        // TODO: 滑块滑动会触发

        var wallet = this.common.Wallet.getCurrWallet();
        wallet.getGasInfo(this.transactionObj, (err, result) => {
          this.transactionObj = {
            gas_price: result.gas_price,
            percentage: this.rangeValue,
          };
          this.data = result;
          this.gasPrices = result.gas_price;
          this.gasLimits = result.gas_limit;
          this.absentFees = result.fee;
        });
      },
      getCurrentWallet() {
        this.currentWallet = null;
        switch (this.currencyType) {
          case 'ETH':
            if (this.common.Wallet.getCurrWallet()) {
              this.currentWallet = this.common.Wallet.getCurrWallet();
              // TODO: 获取备份状态
              this.zjc = localStorage.getItem('eth_zjc' + this.currentWallet.address);
            }
            break;
          case 'BTC':
            if (this.btcCommon.BtcWallet.getCurrWallet()) {
              this.currentWallet = this.btcCommon.BtcWallet.getCurrWallet();
              // TODO: 获取备份状态
              this.zjc = localStorage.getItem('btc_zjc' + this.currentWallet.address);
            }
            break;
          default:
            break;
        }
        return this.currentWallet;
      },
      back() {
        history.back();
      },
    },
    mounted() {
      let that = this;
      try {
        cordova;
        that.isApp = true;
      } catch (e) {
        that.isApp = false;
      }
      //TODO: 判断是否存在当前钱包 没有则跳转到登入页面
      this.removemodals();

      //TODO: 获取当前currencyType
      this.currencyType = this.$route.query.type ? this.$route.query.type : localStorage.getItem('wallet_system')
          ? localStorage.getItem('wallet_system')
          : 'ETH';

      // TODO: 获取当前钱包/金额
      this.balances = this.$route.query.balance;
      this.symbol = this.$route.query.symbol;
      this.decimals = this.$route.query.decimals;
      this.contract_address = this.$route.query.contract_address;
      this.getCurrentWallet();
      console.log(this.currentWallet.address, '当前地址');

      // TODO: 作用待定
      this.$store.commit('a', this.as);
      this.aaaa();

    },
    computed: {
      removemodals() {
        return this.$store.state.removemodals;
      },
      a() {
        return this.$store.state.a;
      },
//            symbols(){
//                return this.$store.state.symbols;
//            },
      contracts() {
        return this.$store.state.contracts;
      },
      decimalss() {
        return this.$store.state.decimalss;
      },
      comments() {
        return this.$store.state.comments;
      },
      fees() {
        console.log(this.$store.state.fees);
        return this.$store.state.fees;
      },
      // address() {
      //   return this.$store.state.address;
      // },
      eth_s() {
        return this.$store.state.eth_s;
      },
      qr() {
        if (this.receiveAddress != '' && this.transferAccounts != '') {
          this.isDisabled = false;
          return false;
        } else {
          this.isDisabled = true;
          return true;
        }
      },
    },
    watch:{
      rangeValue(){
        var wallet = this.common.Wallet.getCurrWallet();
        wallet.getGasInfo(this.transactionObj, (err, result) => {
          this.transactionObj = {
            gas_price: result.gas_price,
            percentage: this.rangeValue,
          };
          this.data = result;
          this.gasPrices = result.gas_price;
          this.gasLimits = result.gas_limit;
          this.absentFees = result.fee;
        });
      }
    }

  };
</script>
<style scoped>
    .scanning {
        position: absolute;
        top: 50%;
        margin-top: -0.18rem;
        right: 0.46rem;
        width: 0.4rem;
        height: 0.36rem;
        background: url("../../../assets/common/img/icon_caidan_saoyisao-1@2x.png") no-repeat;
        background-size: 100% 100%;
    }

    .forms {
        margin-top: 0.3rem;
        font-size: 0.3rem;
    }

    .forms div {
        font-size: 0.3rem;
        margin: 0 0.3rem;
    }

    .forms p {
        margin: 0.53rem 0.3rem 0 0.3rem;
        height: 1rem;
        line-height: 1.5rem;
        font-weight: 500;
        color: rgba(238, 238, 238, 1);
        line-height: 0.42rem;
    }

    input {
        width: 100%;
        height: 1.12rem;
        border: none;
        font-size: 0.3rem;
        background: #2C3754;
        color: rgba(195, 208, 243, 1);
        line-height: 0.42rem;
        border-bottom: 0.02rem solid rgba(107, 121, 156, 1);
        border-radius: 0;
        font-weight: 500;
    }

    input:-ms-input-placeholder {
        color: rgba(97, 110, 144, 1);
    }

    /* Internet Explorer 10+ */
    input::-webkit-input-placeholder {
        color: rgba(97, 110, 144, 1);
    }

    /* WebKit browsers */
    input::-moz-placeholder {
        color: rgba(97, 110, 144, 1);
    }

    /* Mozilla Firefox 4 to 18 */
    input:-moz-placeholder {
        color: rgba(97, 110, 144, 1);
    }

    p em {
        float: left;
        color: rgba(107, 121, 156, 1);
    }

    p em:nth-child(1) {
        width: 25%;
        text-align: left;
    }

    p em:nth-child(2) {
        width: 50%;
        text-align: center;
        font-size: 0.24rem;
    }

    p em:nth-child(3) {
        width: 25%;
        text-align: right;
    }

    button {
        border: none;
        margin: 0.8rem;
        font-size: 0.4rem;
        width: 5.9rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%);
        border-radius: 0.6rem;
    }

    .btn1 {
        color: rgba(255, 255, 255, 0.5);
    }

    .btn2 {
        color: rgba(255, 255, 255, 1);
    }

    .titles {
        width: 100%;
        font-size: 0.38rem;
        text-align: center;
        display: block;
    }

    .p_zhje {
        position: absolute;
        top: 0.3rem;
        right: 0.1rem;
        font-size: 0.30rem;
        font-weight: 500;
        color: rgba(107, 121, 156, 1) !important;
        line-height: 0.42rem;
    }

    input[type=range] {
        outline: none;
        background: -webkit-linear-gradient(#059CFA, #059CFA) no-repeat, #ddd;
        background-size: 30% 100%; /*设置左右宽度比例*/
        -webkit-appearance: none; /*去除默认样式*/
        margin-top: 0.5rem;
        background-color: #ebeff4;
        height: 4px;
        padding: 0;
        border: none;
        width: 100% !important;
    }

    /*拖动块的样式*/
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none; /*清除系统默认样式*/
        border-radius: 50%; /*外观设置为圆形*/
        cursor: default;
        top: 0;
        height: .65rem;
        width: .65rem;
        background: #209deb;
        border: none;
    }

</style>
