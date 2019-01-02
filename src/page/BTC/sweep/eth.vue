<template>
    <div style="height: 100%;">

        <!--  <div class="top_nav">
              <div class="back_icon"></div>
              <p style="width: 100%; text-align: center">BTC 转账</p>
          </div>-->
        <v-nav>{{symbol}} 转账
            <div class="scanning" @click="scanning" v-if="isApp"></div>
        </v-nav>

        <!--头部结束-->
        <div class="content_color">
            <div class="forms">
                <div>
                    <input type="text" placeholder="收款方地址" v-model.trim="receiveAddress">
                </div>
                <div style="color: #FF6363;">{{addressErr}}</div>
                <div style="position: relative;">
                    <!--onkeyup="this.value=this.value.replace(/[^0-9\.]/g,'')"-->
                    <input type="number" placeholder="转账金额" v-model.trim="transferAccounts" oninput="if(value.length>14)value=value.slice(0,14)" @blur="transNumErr" @focus="transNum" onpaste="return false;">
                    <div class="p_zhje">账户金额：<span>{{this.balances | numFormat(symbol)}} {{symbol}}</span></div>
                  <div style="color: #FF6363; margin:0">{{numErr}}</div>
                </div>

                <!--<div>-->
                    <!--<p class="float">&nbsp;旷工费用</p>-->
                    <!--<p class="fees floatr" @click="isShowFree">{{parseFloat(absentFees)}} sat/b <i class="down"></i></p>-->
                <!--</div>-->

              <p>&nbsp;旷工费用</p>
              <div style="border: none!important; position: relative; margin:0">
                <!--<input type="range" name="range_speed" id="range_speed" value="40" @input="changeFee()" min="0" max="100" step="1"/>-->


                <mt-range
                        v-model="rangeValue"
                        :min="0"
                        :max="100"
                        :step="1"
                        :bar-height="5">
                        <!--@input="changeFee()"-->
                </mt-range>
                </div>
              <p><em>慢</em><em>{{absentFees}}sat/b</em><em>快</em></p>

            </div>
            <button id="btn" data-toggle="modal" data-target="#aboutModal" @click="estimate" :class="qr?'btn1':'btn2'"
                    :disabled="isDisabled">下一步
            </button>
            <div class="btn_div"></div>
            <div class="changPromote" v-show="isShow">
                <p @click="changeFee(0)" :class="{'selected':isSelected1}">常规：35 sat/b</p>
                <p @click="changeFee(1)" :class="{'selected':isSelected2}">优先：45 sat/b</p>
                <input type="number" id="fee" v-model.number="fee_number" placeholder="自定义手续费（sat/b）" @blur="fun()"
                       min='1' step='1' @input="fee_numberChange($event)" @keydown="preventNumber($event)"
                       style="color:rgba(0,0,0,1);line-height:42px;">
                <p class="warning" v-show="warning">{{texts}}</p>
            </div>
        </div>


        <!--设置覆盖图层-->
        <div class="layer" v-show="isShow" @click="closeLayer"></div>
    </div>
</template>
<script>
  import $ from 'jquery';
  import {Validator} from '../../../api/common/validator';
  import Decimal from 'decimal.js';

  export default {
    data() {
      return {
        currentWallet: null,
        currencyType: '',
        symbol: '',
        gaoYuanId: 'aboutModal',
        as: false,
        tag: false,
        mins: '',
        maxs: '',
        steps: '',
        rangeValue: 30,
        balance_L: '',
        transactionObj: {},
        balances: 0,
        fee_number: '',
        receiveAddress: '',
        transferAccounts: '',
        absentFees: '35',
        remarks: '',
        warning: false,
        isShow: false,
        // btcfees: '',
        isSelected1: true,
        isSelected2: false,
        isApp: false,

        showText: false,
        texts: '',
        index: 1,
        addressErr: '',
        numErr:'',
        // focusIndex: 1,
      };
    },

    methods: {
      Lshow() {
        this.$indicator.open();
      },
      Lhide() {
        this.$nextTick(() => { this.$indicator.close(); });
      },
      transNumErr(){

        if (this.symbol ==='BTC' && parseFloat(this.transferAccounts) < 0.00003){
            this.numErr = "转账金额过低";
        }else if(this.symbol ==='USDT' && parseFloat(this.transferAccounts) < 0.01){
          this.numErr = "转账金额过低";
        }
      },
      transNum(){
        this.numErr = "";
      },
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
                console.log(JSON.stringify(error) + '扫一扫失败');
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
          that.receiveAddress = '';
          that.isApp = false;
        }

      },
      fee_numberChange() {
        if (this.fee_number <= 0) {
          this.fee_number = '';
        } else if (this.fee_number < 35) {
          this.warning = true;
          this.texts = '不建议低手续费';
        } else if (this.fee_number > 45) {
          this.warning = true;
          this.texts = '不需要高手续费';
        } else {
          this.warning = false;
        }
      },
      preventNumber(ev) {
        let keyCode = ev.keyCode;
        if ((keyCode < 48 || keyCode > 57) && keyCode !== 8) {
          ev.returnValue = false;
          return false;
        }
      },
      isShowFree() {
        this.isShow = true;
        this.texts = '';
        if (!this.isSelected1 && !this.isSelected2) {
          this.fee_number = this.absentFees;
        }
      },
      closeLayer() {
        this.isShow = false;
      },
      drawBarChart() {
        $('.btn_div').show().delay(500).fadeOut();
      },
      estimate() {
        this.addressErr = '';
        if (!Validator.isValidAdderssBtc(this.receiveAddress)) {
          // this.$nextTick(()=>{             this.$indicator.close();           });
          this.addressErr = '收款地址有误，请输入正确的BTC地址！';
        } else if (this.receiveAddress === this.currentWallet.address) {
          // this.$nextTick(()=>{             this.$indicator.close();           });
          this.drawBarChart();
          $('.btn_div').html('地址不可与自己一致');
        } else if (this.symbol === 'BTC' && parseFloat(this.transferAccounts) < 0.00003){
          this.numErr = "转账金额过低";
        }else if (this.symbol === 'USDT' && parseFloat(this.transferAccounts) < 0.01){
          this.numErr = "转账金额过低";
        }else if (parseFloat(this.balances) <= 0) {
          // this.$nextTick(()=>{             this.$indicator.close();           });
          this.drawBarChart();
          $('.btn_div').html('余额不足');
        }else {
          var wallet = this.btcCommon.BtcWallet.getCurrWallet();
          var _this = this;
          _this.addressErr = '';
          _this.$indicator.open();
          wallet.calBtcGasFee(_this.symbol,wallet.address, this.absentFees, this.transferAccounts, function(err, response) {
            var fees = response;
            if (fees === -1) {
              // _this.$nextTick(()=>{this.$indicator.close();});
              _this.Lhide();
              _this.drawBarChart();
              $('.btn_div').html('余额不足');
              return;
            } else {
              // _this.$nextTick(()=>{this.$indicator.close();});
              _this.Lhide();
              _this.$router.push({
                path: '/eth_ok',
                query: {
                  type: 'BTC',
                  symbol:_this.symbol,
                  receiveAddress: _this.receiveAddress,
                  transferAccounts: _this.transferAccounts,
                  remarks: _this.remarks,
                  absentFees: fees,
                  // absentFees: _this.absentFees,
                },
              });
            }
          });
        }

      },

      // changeFee(idx) {
      //   var fees;
      //   if (idx === 0) {
      //     fees = 35;
      //     this.absentFees = 35;
      //     this.warning = false;
      //     this.fee_number = '';
      //     this.isShow = false;
      //     this.isSelected1 = true;
      //     this.isSelected2 = false;
      //   }
      //   else if (idx === 1) {
      //     fees = 45;
      //     this.absentFees = 45;
      //     this.warning = false;
      //     this.fee_number = '';
      //     this.isShow = false;
      //     this.isSelected2 = true;
      //     this.isSelected1 = false;
      //   }
      //   // fees
      // },
      fun() {
        if (this.fee_number == '') {        // 输入为空，默认上次选择的
          this.isShow = false;

          // this.fee_number = this.absentFees;
          this.fee_numberChange();
        } else {
          this.isShow = false;
          this.isSelected2 = false;
          this.isSelected1 = false;
          this.absentFees = this.fee_number;
        }

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

      this.symbol = this.$route.query.symbol;
      // TODO: 作用待定
      this.$store.commit('a', this.as);
      // this.aaaa();

      // TODO: 获取当前钱包/金额
      this.balances = this.$route.query.balance;
      this.getCurrentWallet();
      console.log(this.currentWallet.address, '当前地址');

     // // 旷工费
     //  this.absentFees = this.rangeValue / 100 * 50 + 15;
    },
    watch:{
      rangeValue(){
        this.absentFees = this.rangeValue / 100 * 50 + 15;
      }
    },
    computed: {
      removemodals() {
        return this.$store.state.removemodals;
      },
      a() {
        return this.$store.state.a;
      },
      contracts() {
        return this.$store.state.contracts;
      },
      decimalss() {
        return this.$store.state.decimalss;
      },
      comments() {
        return this.$store.state.comments;
      },

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

    .layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        /*background-color: #5bc0de;*/
        z-index: 100;
    }

    .forms {
        font-size: 0.3rem;
        margin-top: 0.3rem;
    }

    .forms div {
        font-size: 0.3rem;
        margin: 0 0.3rem;
    }

    .forms p {
      margin: 0.53rem 0.3rem 0 0.3rem;
      height: 1rem;
      font-weight: 500;
      color: rgba(238, 238, 238, 1);
      line-height: 0.42rem;
    }

    .forms p.fees {
        text-align: right;
        white-space: nowrap;
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

    .changPromote p.warning {
        font-weight: 500;
        color: rgba(255, 99, 99, 1);
        line-height: 0.30rem;
        margin-top: 0.25rem;
    }

    button {
        border: none;
        margin: 0.8rem;
        fonst-size: 0.4rem;
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


    .changPromote {
        position: absolute;
        width: 6.79rem;
        height: 4.50rem;
        background: rgba(255, 255, 255, 1);
        border-radius: 0.14rem;
        bottom: 0.5rem;
        left: 0.34rem;
        z-index: 101;
    }

    .changPromote p {
        font-size: 0.32rem;
        font-weight: 500;
        color: rgba(25, 27, 31, 1);
        margin-top: 0.32rem;
        margin-left: 0.48rem;
        line-height: 0.8rem;
    }

    .changPromote input {
        width: 6.30rem;
        height: 0.85rem;
        background: rgba(240, 240, 240, 1);
        border-radius: 0.14rem;
        border: 0.01rem solid rgba(227, 227, 227, 1);
        margin-left: 0.25rem;
        margin-top: 0.42rem;
    }

    .selected {
        background: url("../../../assets/common/img/icon_xuanze_pre@2x.png") no-repeat 5rem center;
        background-size: 0.45rem 0.45rem;
    }

    .down {
        width: 0.3rem;
        height: 0.3rem;
        display: inline-block;
        vertical-align: middle;
        background: url("../../../assets/common/img/icon_xuanze_xia@2x.png") no-repeat center right;
        background-size: 0.3rem 0.3rem;
    }


</style>
