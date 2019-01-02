<template>
    <div style="background:rgba(246,246,247,1);">
        <!--头部开始-->

        <div class="top_nav">
            <div class="back_icon" @click="back"></div>
            <p>{{symbol}}</p>
        </div>
        <!--头部结束-->
        <div>
            <div class="divinp clear">
                <span>{{balance}}</span>
                <span>≈ {{priceRateMark[priceRateType]}} {{realBalance | rateFormat(symbol)}}</span>
            </div>
            <div class="div_sx">
                <mescroll-vue ref="mescroll" id="mescrollTran" :down="mescrollDown" :up="mescrollUp" @init="mescrollInit">
                    <ul class="tab_center" id="list_ui">
                        <li class="div_l" v-for="(item,index) in dataList"
                            v-on="zhuangtan(item)"
                            @click="sclick(item)" :key="index">
                            <div class="div_l1">
                                <span>{{item.to}}</span>
                                <span class="floatr"
                                      :class="item.type=='-'?'red':'b'"
                                >{{item.type}}{{parseFloat(item.value) | ETH_transFee}} {{symbol}}</span>
                            </div>
                            <div class="div_l2">
                                <p>
                                    <span>{{item.create_time.substr(0,10)}}</span>
                                    <span class="floatr">{{item.state}}</span>
                                </p>
                                <div class="progress gdt_div"
                                     v-bind:style="{ display:item.confirm_max }">
                                    <div class="progress-bar" role="progressbar"
                                         aria-valuenow="(item.confirmed_count)/(item.confirm_max)"
                                         aria-valuemin="0" aria-valuemax="100"
                                         v-bind:style="{ width: (item.confirmed_count)/(item.confirm_max)*100+ '%'}"></div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </mescroll-vue>
            </div>
        </div>


        <!--底部开始-->
        <div class="foot_div clear w">
            <div class="z_div float" @click="zhuanzhang">转账</div>
            <div class="s_div float" @click="shoukuai">收款</div>
        </div>
        <!--底部结束-->

        <div class="btn_div"></div>
    </div>
</template>
<script>
  import MescrollVue from 'mescroll.js/mescroll.vue';
  import {EthUnits} from '../../api/ETH/ethUnits';

  export default {
    data() {
      return {
        mescroll: null, // mescroll实例对象
        mescrollDown: {}, //下拉刷新的配置. (如果下拉刷新和上拉加载处理的逻辑是一样的,则mescrollDown可不用写了)
        mescrollUp: { // 上拉加载的配置.
          callback: this.upCallback, // 上拉回调,此处简写; 相当于 callback: function(page, mescroll) { }
          //以下是一些常用的配置,当然不写也可以的.
          page: {
            num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
            size: 20, //每页数据条数,默认20
          },
          noMoreSize: 5, //如果列表已无数据,可设置列表的总数量要大于5才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看
          toTop: {
            //回到顶部按钮
            src: null, //图片路径,默认null,支持网络图
            offset: 100, //列表滚动1000px才显示回到顶部按钮
          },
          empty: {
            //列表第一页无任何数据时,显示的空提示布局; 需配置warpId才显示
            warpId: 'mescrollTran', //父布局的id (1.3.5版本支持传入dom元素)
            icon: '', //图标,默认null,支持网络图
            tip: '暂无新记录', //提示
          },
        },
        dataList: [], // 列表数据
        pageNo: 0,
        currencyType: '', // 原 symbols
        currentWallet: null,
        symbol: '',
        balance: 0,
        realBalance: 0,
        decimals: '',
        contract_address: null,
        arr: [],
        zjc: '',

        priceRateType: 'cny', //cny 人民币(默认) usd 美元
        priceRateMark: {cny: '￥', usd: '$'},

      };
    },
    components: {
      MescrollVue,
    },
    methods: {
      mescrollInit(mescroll) {
        this.mescroll = mescroll;
      },
      upCallback(page, mescroll) {
        if (page.num === 1) {
          this.pageNo = 0;
        }
        this.currentWallet.getTransactionHistory(this.pageNo, this.contract_address, this.currencyType, this.decimals,
            (err, result) => {
              let list = [];
              for (var i = 0; i < result.length; i++) {
                this.pageNo += this.pageNo > result[i].id ? result[i].id : this.pageNo;
                if (result[i].state == 2 || result[i].state == 3) {
                  this.arr.push(result[i].txid);
                }
                this.pageNo = result[i].id;
                if (!result[i].symbol) {
                  list.push(result[i]);
                } else {
                  if (result[i].symbol == this.symbol) {
                    list.push(result[i]);
                  }
                }
              }
              // 如果是第一页需手动制空列表
              if (page.num === 1) {
                this.dataList = [];
              }
              // 把请求到的数据添加到列表
              this.dataList = this.dataList.concat(list);
              // 数据渲染成功后,隐藏下拉刷新的状态
              this.$nextTick(() => {
                mescroll.endSuccess(list.length);
              });
            });
      },
      sclick(item) {
        let type = 0;
        if (item.state == '成功' || item.confirm_max == 'none') {
          type = 1;
        }
        if (item.confirm_max != 'none') {
          item.fee = EthUnits.getValueOfDecimalsToWei(item.fee, 18);
        }
        this.$router.push({
          path: '/ETH/record', query: {
            value: item.value,
            comments: item.comments,
            txid: item.txid,
            create_time: item.create_time,
            to: item.to,
            from: item.from,
            black_number: item.black_number,
            address: item.address,
            fee: item.fee,
            type: type,
          },
        });

      },
      zhuangtan(item) {
        if (item.type == 1) {
          item.type = '-';
        }
        if (item.type == 2) {
          item.type = '+';
        }
        var wallet = this.common.Wallet.getCurrWallet();
        if (item.state == 0) {
          item.state = '失败';
          item.confirm_max = 'none';
        }
        if (item.state == 1) {
          item.state = '成功';
          item.confirm_max = 'none';
        }
        if (item.state == 2) {
          item.state = '进行中';
          var _this = this;
          wallet.getConfirmCount(_this.arr, (err, data) => {
            console.log(data);
            if (data) {
              item.block_number = data.block_number;
              item.confirm_ma = data.confirm_max;
              item.confirmed_count = data.confirmed_count;
              item.state = data.state;
            }
          });
          // setInterval(function() {
          //
          // }, 30000);
        }
        if (item.state == 3) {
          item.state = '打包中';
          var _this = this;
          wallet.getConfirmCount(_this.arr, (err, data) => {
            console.log(data);
            if (data) {
              item.block_number = data.block_number;
              item.confirm_ma = data.confirm_max;
              item.confirmed_count = data.confirmed_count;
              item.state = data.state;
            }
          });
          // setInterval(function() {
          //
          // }, 30000);
        }
      },
      zhuanzhang() {
        if (parseFloat(this.balance) <= 0 && false) {
          this.drawBarChart();
          $('.btn_div').html('金额不足');
          return;
        } else {
          // this.$store.commit('symbols', this.symbols);
          this.$router.push({
            path: '/ETH/eth',
            query: {
              type: this.currencyType,
              symbol: this.symbol,
              balance: this.balance,
              decimals: this.decimals,
              contract_address: this.contract_address,
            },
          });
        }
      },
      shoukuai() {
        if (this.zjc == '1') {
          this.$router.push({
            path: '/backWarn',
            query: {
              type: this.currencyType,
            },
          });
        } else {
          this.$router.push({
            path: '/receipt_code',
            query: {
              address: this.currentWallet.address,
            },
          });
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
        this.$router.push({
          path: '/warp',

          query: {
            type: this.$route.query.type,
            balance: this.$route.query.balance,
          },
        });
      },
    },
    mounted() {

      //TODO: 判断是否存在当前钱包 没有则跳转到登入页面
      this.removemodals();

      //TODO: 获取当前currencyType
      this.currencyType = this.$route.query.type ? this.$route.query.type : localStorage.getItem('wallet_system')
          ? localStorage.getItem('wallet_system')
          : 'ETH';
      //TODO: 获取实体币类型
      this.priceRateType = localStorage.getItem('priceRateType')
          ? localStorage.getItem('priceRateType')
          : this.priceRateType;

      //TODO: 获取当前钱包/金额
      this.balance = this.$route.query.balance;
      this.symbol = this.$route.query.symbol;
      this.decimals = this.$route.query.decimals;
      this.contract_address = this.$route.query.contract_address;
      this.realBalance = this.$route.query.realBalance;
      this.getCurrentWallet();

    },
    computed: {
      removemodals() {
        return this.$store.state.removemodals;
      },
      a() {
        return this.$store.state.a;
      },
      address() {
        return this.$store.state.address;
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
      comments() {
        return this.$store.state.comments;
      },
      froms() {
        return this.$store.state.froms;
      },
    },
  };
</script>
<style scoped>
    .divinp {
        width: 100%;
        height: 4.32rem;
        background-color: #374466;
        padding-top: 1.09rem;
        /*margin-top: 1.09rem;*/
        text-align: center;
    }

    .divinp > span:nth-child(1) {
        display: block;
        text-align: center;
        font-size: 0.85rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 1);
        line-height: 1.19rem;
        padding-top: 0.6rem;
        /*box-sizing: border-box;*/
    }

    .divinp > span:nth-child(2) {
        display: block;
        text-align: center;
        font-size: 0.38rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 1);
        /*box-sizing: border-box;*/
    }

    .div_l {
        width: 7.11rem;
        height: 1.4rem;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0rem 0rem 0.11rem 0rem rgba(240, 240, 240, 1);
        border-radius: 0.17rem;
        margin: 0.2rem auto;
    }

    .div_l1 {
        padding-top: 0.1rem;
        margin: 0 0.4rem;
    }

    .div_l2 {
        margin: 0 0.4rem;
    }

    .div_l div:nth-child(1) span:nth-child(1) {
        font-size: 0.38rem;
        color: rgba(74, 74, 74, 1);
        line-height: 0.53rem;
        width: 3.5rem; /*必须设置宽度*/
        overflow: hidden; /*溢出隐藏*/
        text-overflow: ellipsis; /*以省略号...显示*/
        white-space: nowrap; /*强制不换行*/
        display: inline-block;
    }

    .div_l div:nth-child(1) span:nth-child(2) {
        font-size: 0.24rem;
        margin-top: 0.15rem;
        text-align: right;
        width: 2.1rem; /*必须设置宽度*/
        overflow: hidden; /*溢出隐藏*/
        text-overflow: ellipsis; /*以省略号...显示*/
        white-space: nowrap; /*强制不换行*/
        display: inline-block;
    }

    .div_l div:nth-child(2) p:nth-child(1) span:nth-child(1) {
        color: rgba(155, 155, 155, 1);
        font-size: 0.26rem;
    }

    .div_l div:nth-child(2) p:nth-child(1) span:nth-child(2) {
        color: rgba(155, 155, 155, 1);
        font-size: 0.22rem;
        line-height: 0.4rem;
    }

    .gdt_div {
        height: 0.06rem;
        margin-top: 0.1rem;
    }

    .tab_center {
        background-color: #F6F6F6;
    }

    .div_b {
        display: block;
    }

    .div_none {
        display: none;
    }

    /*底部样式*/
    .foot_div {
        position: fixed;
        width: 100%;
        height: 1.2rem;
        font-size: 0.4rem;
        line-height: 1.2rem;
        text-align: center;
        bottom: 0;
    }

    .z_div {
        width: 50%;
        height: 1.2rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1), rgba(47, 124, 243, 1));
        font-weight: bold;
    }

    .s_div {
        width: 50%;
        height: 1.2rem;
        background: linear-gradient(90deg, rgba(71, 75, 79, 1), rgba(53, 61, 68, 1));
        font-weight: bold;
    }

    .mint-loadmore-top span {
        display: inline-block;
        vertical-align: middle;
        text-align: center;
        -webkit-transition: .2s linear;
        transition: .2s linear;
    }

    .mint-loadmore-top .is-rotate {
        -webkit-transform: rotate(180deg);
        transform: rotate(180deg)
    }

    .mint-loadmore-bottom span {
        display: inline-block;
        -webkit-transition: .2s linear;
        transition: .2s linear;
        vertical-align: middle;
    }

    .mint-loadmore-bottom .is-rotate {
        -webkit-transform: rotate(180deg);
        transform: rotate(180deg);
    }

    .mint-loadmore-bottom {
        margin-bottom: 0px !important;
    }

    .mint-loadmore-top span {
        font-size: .5rem;
    }

    .mint-loadmore-bottom span {
        font-size: .5rem;
    }

    .mint-loadmore-top {
        margin-top: -.75rem;
    }

    .mint-loadmore-bottom {
        margin-bottom: .85rem;
    }

    .mint_span_div {
        margin-top: .2rem;
        -webkit-animation: mint-spinner-rotate 0.8s infinite linear;
        animation: mint-spinner-rotate 0.8s infinite linear;
        border: .08rem solid transparent;
        border-radius: 50%;
    }

    @media screen and (min-width: 320px) {
        .mint-loadmore-top {
            margin-top: -1.2rem;
        }
    }

    @media screen and (min-width: 768px) {
        .mint-loadmore-top {
            margin-top: -.5rem;
        }

        .mint_span_div {
            border: 8px solid transparent;
        }

        .mint-loadmore-bottom {
            margin-bottom: .2rem !important;
        }
    }

    @media screen and (min-width: 1024px) {
        .mint-loadmore-top {
            margin-top: -.45rem;
        }
    }

    .mescroll {
        position: fixed;
        top: 4.4rem;
        bottom: 1.2rem;
        height: auto; /*如设置bottom:51px,则需height:auto才能生效*/
    }
</style>
