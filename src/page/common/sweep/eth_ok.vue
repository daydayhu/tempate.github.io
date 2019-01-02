<template>
    <div style="height: 100%;">

        <!--<Box :id="gaoYuanId">-->
            <!--<span slot="title" class="titles">请输入密码</span>-->
            <!--<div slot="content">-->
                <!--<Bconten slot="content" :transactionObjBtc="transactionObjBtc" :transactionObj="transactionObj"-->
                         <!--v-if="transactionObjBtc||transactionObj"></Bconten>-->
            <!--</div>-->
        <!--</Box>-->

        <div class="top_nav">
            <div class="back_icon" @click="back"></div>
            <p style="width: 100%; text-align: center">{{symbol}} 转账</p>
        </div>
        <!--头部结束-->
        <div class="content_color">
            <div class="box">
                <div class="box_list">
                    <div>订单信息</div>
                    <div class="box_r">转账</div>
                </div>
                <div class="box_list">
                    <div>付款地址</div>
                    <div>{{currentWallet && currentWallet.address}}</div>
                </div>
                <div class="box_list">
                    <div>收款地址</div>
                    <div>{{receiveAddress}}</div>
                </div>
                <div class="box_list">
                    <div>金额</div>
                    <div style="text-align:right;">{{parseFloat(transferAccounts) | toNonExponential }} {{symbol || currencyType}}</div>
                </div>
                <div class="box_list">
                    <div>矿工费</div>
                    <div>
                        <!--<div>{{absentFees}} {{currencyType === 'ETH' ? currencyType : 'sat/b'}}</div>-->
                        <div v-if="currencyType === 'ETH'">{{absentFees}} ETH</div>
                        <div v-else-if="currencyType === 'BTC'">{{absentFees | feeFormat }} BTC</div>
                        <div v-show="currencyType === 'ETH'">≈Gas(25246.8)*Gas Price (3.00 gwei)</div>
                    </div>
                </div>
            </div>
            <!-- 按钮 -->
            <button @click="privateShow = true">确认</button>
            <prompt :promptType="3" v-show='privateShow' @maskcallback="privateFun" @confirmcb="privatecb"></prompt>
        </div>
    </div>
</template>
<script>
  import $ from 'jquery';
  import Bconten from '../../../components/common/modals/bconten.vue';
  import Box from '../../../components/common/modals/box.vue';
  import prompt from '../../../components/prompt/index.vue';

  export default {
    components: {
      Bconten,
      Box,
      prompt,
    },
    data() {
      return {
        gaoYuanId: 'aboutModal',
        currentWallet: null,
        currencyType: '',
        receiveAddress: '', // 转账地址
        transferAccounts: 0, // 转账金额
        absentFees: '', // 旷工费
        remarks: '', // 备注
        symbol: '',
        // 以下etc 所有
        gasPrices: '',
        gasLimits: '',
        decimals: '',
        contract_address: '',

        transactionObj: null,
        transactionObjBtc: null,

        as: false,
        onceETH: true,
        onceBTC: true,

        //  密码输入
        privateShow: false,

      };
    },
    methods: {
      // drawBarChart() {
      //   $('.btn_divs').show().delay(500).fadeOut();
      // },
      
      Lshow() {
        this.$indicator.open();
      },
      Lhide() {
        this.$nextTick(() => { this.$indicator.close(); });
      },
      privateFun() {
        this.privateShow = false;
      },
      privatecb(val) {
        this.$indicator.open();
        if (val == '') {
          this.$Tool.$Toast('请输入密码');
          this.$nextTick(() => { this.$indicator.close(); });
        } else {
          var flag = localStorage.getItem('wallet_system');
          switch (flag) {
            case 'ETH':
              this.eth_estimate(val);
              break;
            case 'BTC':
              this.btc_estimate(val);
              break;
          }
        }
      },
      eth_estimate(val) {
        if (this.onceETH) {
          this.onceETH = false;
          var _this = this;
          setTimeout(function() {
            var wallet = _this.common.Wallet.getCurrWallet();

            wallet.sendTransaction(val, _this.transactionObj, (err, data) => {
              if (err == 'args error') {
                _this.Lhide();
                _this.$Tool.$Toast('地址不合法');
                _this.onceETH = true;
              } else if (err == '密码错误') {
                _this.$Tool.$Toast('密码错误');
                _this.Lhide();
                _this.onceETH = true;
              } else if (err && err.message == 'Returned error: replacement transaction underpriced') {
                _this.$Tool.$Toast('手续费过低');
                _this.Lhide();
                _this.onceETH = true;
              } else if (err != null) {
                _this.$Tool.$Toast('转账失败');
                _this.Lhide();
                _this.onceETH = true;
              } else {
                _this.Lhide();
                _this.$Tool.$Toast('提交成功');
                setTimeout(() => {
                  // 路由退后两级
                  history.go(-2);
                }, 1000);
              }
            });
          }, 1000);
        }

      },
      btc_estimate(val) {
        if (this.onceBTC) {
          this.onceBTC = false;
          var _this = this;
          setTimeout(function() {
            var wallet = _this.btcCommon.BtcWallet.getCurrWallet();
            console.log('_this.transactionObjBtc', _this.transactionObjBtc);
            //需要判断是usdt/btc
            console.log('当前symbol:______', _this.transactionObjBtc.symbol);
            if (_this.transactionObjBtc.symbol === 'BTC') {
              wallet.transtionCopy(val, _this.transactionObjBtc, (err, data) => {
                if (err == 'args error') {
                  _this.Lhide();
                  _this.$Tool.$Toast('地址不合法');
                  _this.onceBTC = true;
                } else if (err == '密码错误') {
                  _this.Lhide();
                  _this.$Tool.$Toast('密码错误');
                  _this.onceBTC = true;
                } else if (err != null) {
                  _this.Lhide();
                  _this.$Tool.$Toast('转账失败');
                  _this.onceBTC = true;
                } else {
                  console.log('btc转账提交成功:___________________________________', data);
                  _this.Lhide();
                  _this.$Tool.$Toast('提交成功');
                  setTimeout(function() {
                    history.go(-2);
                  }, 1000);
                }
              });
            } else if (_this.transactionObjBtc.symbol === 'USDT') {
              //TODO: usdt转账 待
              wallet.transtionUsdt(val, _this.transactionObjBtc, (err, data) => {
                if (err == 'args error') {
                  _this.Lhide();
                  _this.$Tool.$Toast('地址不合法');
                  _this.onceBTC = true;
                } else if (err == '密码错误') {
                  _this.Lhide();
                  _this.$Tool.$Toast('密码错误');
                  _this.onceBTC = true;
                } else if (err != null) {
                  _this.Lhide();
                  _this.$Tool.$Toast('转账失败');
                  _this.onceBTC = true;
                } else {
                  console.log('usdt转账提交成功:___________________________________', data);
                  _this.Lhide();
                  _this.$Tool.$Toast('提交成功');
                  setTimeout(function() {
                    history.go(-2);
                  }, 1000);
                }

              });
            } else {
              alert('当前类型不存在');
              history.go(-2);
            }

          }, 1000);
        }

      },
      back() {
        history.back();
      },
      getCurrentWallet() {
        this.currentWallet = null;
        this.symbol = this.$route.query.symbol;
        switch (this.currencyType) {
          case 'ETH':
            if (this.common.Wallet.getCurrWallet()) {
              this.currentWallet = this.common.Wallet.getCurrWallet();
              // TODO: 获取备份状态
              this.zjc = localStorage.getItem('eth_zjc' + this.currentWallet.address);

              this.gasPrices = this.$route.query.gasPrices;
              this.gasLimits = this.$route.query.gasLimits;
              this.decimals = this.$route.query.decimals;
              this.contract_address = this.$route.query.contract_address;
              // this.transactionObj={
              //     to: this.text,  // 转账地址
              //     value: this.number, // 金额
              //     gasLimit: this.gasLimits, //
              //     gasPrice: this.gasPrices, //
              //     comment: this.comments, //
              //     symbol: this.symbols , // ETH
              //     contract_address: this.contracts, //
              //     decimals: this.decimalss //
              // };

              this.transactionObj = {
                to: this.receiveAddress,  // 转账地址
                value: this.transferAccounts, // 金额
                fee: this.absentFees,
                from: this.currentWallet.address,
                gasLimit: this.gasLimits, //
                gasPrice: this.gasPrices, //
                comment: this.remarks,
                symbol: this.symbol,
                contract_address: this.contract_address,
                decimals: this.decimals,
              };

              console.log('ETH this.transactionObj', this.transactionObj);
            }
            break;
          case 'BTC':
            if (this.btcCommon.BtcWallet.getCurrWallet()) {
              this.currentWallet = this.btcCommon.BtcWallet.getCurrWallet();
              // TODO: 获取备份状态
              this.zjc = localStorage.getItem('btc_zjc' + this.currentWallet.address);
              // TODO: 构建transactionObjBtc
              this.transactionObjBtc = {
                to: this.receiveAddress, // 转账地址
                value: this.transferAccounts, // 金额
                gasFee: this.absentFees, // 旷工费
                comment: this.remarks, // 备注
                symbol: this.symbol,
                // gasLimit: this.gasLimits,
                // gasPrice: this.gasPrices,
                // symbol:this.symbols ,
                // contract_address: this.contracts,
                // decimals: this.decimalss
              };
              console.log('BTC this.transactionObjBtc', this.transactionObjBtc);
            }
            break;
          default:
            break;
        }
        return this.currentWallet;
      },
    },
    mounted() {
      // TODO: 判断是否存在当前钱包 没有则跳转到登入页面
      this.removemodals();

      //TODO: 获取当前currencyType
      this.currencyType = this.$route.query.type ? this.$route.query.type : localStorage.getItem('wallet_system')
          ? localStorage.getItem('wallet_system')
          : 'ETH';

      this.receiveAddress = this.$route.query.receiveAddress;
      this.transferAccounts = this.$route.query.transferAccounts;
      this.remarks = this.$route.query.remarks;
      this.absentFees = this.$route.query.absentFees;

      // TODO: 获取当前钱包/金额
      this.getCurrentWallet();
      console.log(this.currentWallet.address, '当前地址');

      // localStorage.setItem("fees_l", this.fees);//备注
    },
    computed: {
      removemodals() {
        return this.$store.state.removemodals;
      },
      a() {
        return this.$store.state.a;
      },
      text() {
        return this.$store.state.text;
      },
      number() {
        return this.$store.state.number;
      },
      fees() {
        return this.$store.state.fees;
      },
      symbols() {
        return this.$store.state.symbols;
      },
    },
  };
</script>
<style scoped>
    #aboutModal {
        opacity: 1 !important;
    }

    .box {
        width: 6.56rem;
        margin: 0.15rem auto 0 auto;
        font-family: PingFang-SC-Medium;
    }

    .box_r {
        text-align: right;
    }

    .box > .box_list {
        width: 100%;
        height: 1.12rem;
        font-size: 0.3rem;
        border-bottom: 0.02rem solid rgba(107, 121, 156, 1);
        display: flex;
        align-items: center;
    }

    .box > .box_list > div:nth-of-type(1) {
        width: 1.3rem;
        margin-right: 0.74rem;
        color: rgba(101, 115, 149, 1);
    }

    .box > .box_list > div:nth-of-type(2) {
        width: 4.86rem;
        color: rgba(233, 233, 234, 1);
    }

    .box_list:nth-of-type(5) > div:nth-of-type(2) > div:nth-of-type(1) {
        text-align: right;
    }

    .box_list:nth-of-type(5) > div:nth-of-type(2) > div:nth-of-type(2) {
        text-align: right;
        color: #6B799C;
        font-size: 0.24rem;
    }

    button {
        border: none;
        color: white;
        margin: 0.8rem;
        font-size: 0.4rem;
        width: 5.9rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1), rgba(47, 124, 243, 1));
        border-radius: 0.6rem;
    }

</style>
