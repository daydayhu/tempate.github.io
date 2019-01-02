<template>
    <div>
        <!--弹框开始-->
        <div class="modals">
            <div>
                <input id="ipnut" ref="input1" type="password" placeholder="请输入密码" style="font-size: .3rem;">
            </div>
            <!--<button id="btn" @click="estimate">确认</button>-->
            <button type="button" id='cancel' class="close float" data-dismiss="modal" aria-label="Close" aria-hidden="true"
                    style="opacity: 1; font-weight: 500; text-shadow: none;">取消
            </button>
            <button id="btn" @click="estimate" style="margin-left: 0.12rem; opacity: 1; font-weight: 500">确认</button>
        </div>
        <!--弹框结束-->
        <div class="btn_divs btn_divs_s"></div>

    </div>
</template>

<script>
  import $ from 'jquery';

  export default {
    data() {
      return {
        pass: '',
        as: false,
        onceETH: true,
        onceBTC:true
      };
    },
    methods: {
      drawBarChart() {
        $('.btn_divs').show().delay(500).fadeOut();
      },
      estimate() {

        this.$refs.input1.blur();
        this.pass = $('input[type="password"]')[0].value;
        if (this.pass == '') {
          this.Lhide();
          this.drawBarChart();
          $('.btn_divs').html('请输入密码');
          return;
        }
        var flag = localStorage.getItem('wallet_system');

        switch (flag) {
          case 'ETH':
            this.eth_estimate();
            break;
          case 'BTC':
            this.btc_estimate();
            break;
        }
        this.Lshow();
      },
      eth_estimate() {
        if (!this.onceETH) {
          return;
        }
        this.onceETH = false;
        var _this = this;
        setTimeout(function() {
          var wallet = _this.common.Wallet.getCurrWallet();

          wallet.sendTransaction(_this.pass, _this.transactionObj, (err, data) => {
            if (err == 'args error') {
              _this.Lhide();
              _this.drawBarChart();
              $('.btn_divs').html('转账地址不合格');
              _this.onceETH =true;
            } else if (err == '密码错误') {
              _this.Lhide();
              _this.drawBarChart();
              $('.btn_divs').html(err);
              _this.onceETH =true;
            } else if (err != null) {
              _this.Lhide();
              _this.drawBarChart();
              $('.btn_divs_s').html('转账失败');
              _this.onceETH =true;
            } else {
              _this.Lhide();
              _this.drawBarChart();
              $('.btn_divs').html('提交成功');

              setTimeout(()=> {
                // TODO: 取消层影响
                $('#cancel').trigger('click');
                // 路由退后两级
                history.go(-2);
              }, 1000);
            }
          });
        }, 1000);
      },
      btc_estimate() {
        if(!this.onceBTC){
          return;
        }
        this.onceBTC = false;
        var _this = this;
        setTimeout(function() {
          var wallet = _this.btcCommon.BtcWallet.getCurrWallet();
          console.log('_this.transactionObjBtc', _this.transactionObjBtc);

          //需要判断是usdt/btc
          console.log('当前symbol:______', _this.transactionObjBtc.symbol);

          if(_this.transactionObjBtc.symbol === "BTC") {
            wallet.transtionCopy(_this.pass, _this.transactionObjBtc, (err, data) => {
              if (err == 'args error') {
                _this.Lhide();
                _this.drawBarChart();
                $('.btn_divs').html('转账地址不合格');
                _this.onceBTC = true;
              } else if (err == '密码错误') {
                _this.Lhide();
                _this.drawBarChart();
                $('.btn_divs').html(err);
                _this.onceBTC = true;
              } else if (err != null) {
                _this.Lhide();
                _this.drawBarChart();
                $('.btn_divs_s').html('转账失败');
                _this.onceBTC = true;
              } else {
                console.log('btc转账提交成功:___________________________________',data);
                _this.Lhide();
                _this.drawBarChart();
                $('.btn_divs').html('提交成功');
                setTimeout(function() {
                  // TODO: 取消层影响
                  $('#cancel').trigger('click');
                  history.go(-2);
                }, 1000);
              }
            });
          }else if (_this.transactionObjBtc.symbol === "USDT") {
            //TODO: usdt转账 待
            wallet.transtionUsdt(_this.pass, _this.transactionObjBtc, (err,data) => {
              if (err == 'args error') {
                _this.Lhide();
                _this.drawBarChart();
                $('.btn_divs').html('转账地址不合格');
                _this.onceBTC = true;
              } else if (err == '密码错误') {
                _this.Lhide();
                _this.drawBarChart();
                $('.btn_divs').html(err);
                _this.onceBTC = true;
              } else if (err != null) {
                _this.Lhide();
                _this.drawBarChart();
                $('.btn_divs_s').html('转账失败');
                _this.onceBTC = true;
              }else {
                console.log('usdt转账提交成功:___________________________________',data);
                _this.Lhide();
                _this.drawBarChart();
                $('.btn_divs').html('提交成功');
                setTimeout(function() {
                  // TODO: 取消层影响
                  $('#cancel').trigger('click');
                  history.go(-2);
                }, 1000);
              }

            })
          }else {
            alert('当前类型不存在');
            history.go(-2);
          }


        }, 1000);
      },
      Lshow() {
        this.$indicator.open();
      },
      Lhide() {
        this.$nextTick(()=>{             this.$indicator.close();           });
      },
    },
    mounted() {
      this.removemodals();
      this.$store.commit('a', this.as);
      this.Lhide();
    },
    props: {
      transactionObj: {
        type: Object,
        default: function(val) {
          return {};
        },
      },
      transactionObjBtc: {
        type: Object,
        default: function(val) {
          return {};
        },
      },
      symbol: {
        type: String,
      }
    },
    computed: {
      a() {
        return this.$store.state.a;
      },
      removemodals() {
        return this.$store.state.removemodals;
      },

      symbols() {
        return this.$store.state.symbols;
      },
      contracts() {
        return this.$store.state.contracts;
      },
      decimalss() {
        return this.$store.state.decimalss;
      },
      gasPrices() {
        return this.$store.state.gasPrices;
      },
      gasLimits() {
        return this.$store.state.gasLimits;
      },
      text() {
        return this.$store.state.text;
      },
      number() {
        return this.$store.state.number;
      },
      comments() {
        return this.$store.state.comments;
      },
      // btc 旷工费
      gasFee() {
        return this.$store.state.gasFee;
      },
    },
  };
</script>

<style scoped>
    /*弹框开始*/
    .modals div {
        color: rgba(0, 0, 0, 1);
    }

    .modals div:nth-child(1) {
        font-size: 0.3rem;
        line-height: 0.42rem;
    }

    /*input{  width: 5rem;  height: 1rem;  background:rgba(240,240,240,1);  border: none;  margin-left: -0.3rem;  }*/
    /*.modals button{  width:4.8rem;  height:0.8rem;  background:rgba(48,125,243,1);  border-radius:0.5rem;  margin: 0.4rem 0.3rem;  border: none;  font-size:0.36rem;  color:rgba(255,255,255,1);  }*/
    input {
        width: 6.30rem;
        height: 0.85rem;
        background: rgba(240, 240, 240, 1);
        border-radius: 0.14rem;
        border: 0.01rem solid rgba(227, 227, 227, 1);
        color: rgba(155, 155, 155, 1);
        font-size: 30px;
        line-height: 0.85rem;
    }

    .modals button {
        width: 3rem;
        height: 0.80rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%);
        border-radius: 0.50rem;
        font-size: 0.36rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 1);
        line-height: 0.8rem;
        border: none;
        margin-top: 0.43rem;
    }

    .buttons {
        position: absolute;
        z-index: 100000;
        left: 50%;
        top: 72%;
        transform: translate(-50%, -50%);
        background: none;
        border: none;
    }

    /*弹框结束*/
    .btn_divs {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4rem;
        height: 0.96rem;
        background: rgb(0, 0, 0);
        border-radius: 0.48rem;
        color: white;
        text-align: center;
        line-height: 0.96rem;
        opacity: 1;
        /*transform: translate(-50%,0);*/
        /*-ms-transform: translate(-50%,0);*/
        /*-webkit-transform: translate(-50%,0);*/
        /*-o-transform: translate(-50%,0);*/
        /*-moz-transform: translate(-50%,0);*/
        margin-left: -2rem;
        margin-top: -5rem;
    }

    .btn_divs_s {
        /*width: 4rem !important;*/
        /*left: 16% !important;*/
    }
</style>
