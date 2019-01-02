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
                <span>{{(this.balance) | numFormat(symbol)}}</span>
                <span>≈ {{priceRateMark[priceRateType]}} {{realBalance | rateFormat(symbol)}}</span>
            </div>
            <div class="div_sx">
                <mescroll-vue ref="mescroll" id="mescrollTran" :down="mescrollDown" :up="mescrollUp" @init="mescrollInit">
                    <ul class="tab_center" id="list_ui">
                        <li class="div_l" v-for="(item,index) in dataList"
                            @click="sclick(item)" :key="index">
                            <div class="div_l1">
                                <span>{{item.name}}</span>
                                <span class="floatr"
                                      :class="item.type=='1'?'red':'b'"
                                >{{item.type =='1'?'-':'+'}}{{(item.value) | numFormat(item.black_number)}}  {{symbol}}</span>
                            </div>
                            <div class="div_l2">
                                <p>
                                    <span>{{(item.time) | dateFormat}}</span>
                                    <span class="floatr">{{item.num +1 | state}}</span>
                                </p>
                                <div class="progress gdt_div"
                                     v-if="item.num+1 < statusMax">
                                    <div class="progress-bar" role="progressbar"
                                         aria-valuenow="(item.confirmed_count)/(item.confirm_max)"
                                         aria-valuemin="0" aria-valuemax="100"
                                         v-bind:style="{ width: (item.num +1)/(statusMax)*100+ '%'}"></div>
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
  import {$USDT} from '../../api/BTC/USDT';

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
            size: 10, //每页数据条数,默认10
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

        currencyType: '',
        symbol: '',
        currentWallet: null,
        balance: 0,
        realBalance: 0,

        as: false,
        arr: [],
        record: [],
        arrId: [],

        allLoaded: false,
        scrollMode: 'auto',
        loading: false,
        bottomStatus: '',
        wrapperHeight: 0,
        cententHeight: 0,
        topStatus: '',
        translate: 0,
        moveTranslate: 0,

        limit: 20,
        res: {},
        allNum: '',

        statusMax: 3,

        zjc: '',

        priceRateType: 'cny', //cny 人民币(默认) usd 美元
        priceRateMark: {cny: '￥', usd: '$'},
        LastBlock: 0,

      };
    },
    components: {
      MescrollVue,
    },
    filters: {
      state: function(item) {
        let text = '';
        if (item > 3) {
          text = '成功';
        } else if (item == 3) {
          text = '成功';
        } else if (item == 1) {
          text = '交易中';
        } else if (item == 2) {
          text = '交易中';
        } else {
          text = '打包中';
        }
        return text;
      },
    },
    methods: {
      // mescroll组件初始化的回调,可获取到mescroll对象
      mescrollInit(mescroll) {
        this.mescroll = mescroll;
      },
      upCallback(page, mescroll) {
        if (this.LastBlock == 0) {
          setTimeout(() => {
            this.upCallback(page, mescroll);
          }, 500);
          return;
        }
        if (this.symbol == 'BTC') {
          this.BTC(page, mescroll);
        } else if (this.symbol == 'USDT') {
          this.USDT(page, mescroll);
        }

      },
      BTC(page, mescroll) {
        // 联网请求
        var wallet = this.btcCommon.BtcWallet.getCurrWallet();
        if (this.mescrollUp.page.num == 1) {
          this.pageNo = 0;
        }
        this.pageNo = this.mescrollUp.page.size * (this.mescrollUp.page.num - 1);

        wallet.getTransactionHistory(wallet.address, this.pageNo, this.mescrollUp.page.size,
            (err, result) => {
              var that = this;
              console.log('转账记录', result);
              console.log('转账记录明细', result.data.txs);
              var list = [];
              for (let i = 0; i < result.data.txs.length; i++) {
                let res = {};
                res.black_number = 'BTC';
                res.time = result.data.txs[i].time;
                res.value = 0;
                res.hash = result.data.txs[i].hash;
                res.selfNum = result.data.txs[i].block_height ? result.data.txs[i].block_height : this.LastBlock + 1;
                res.num = this.LastBlock - res.selfNum;

                if (result.data.txs.length < that.limit) {
                  this.pageNo -= this.mescrollUp.page.size * this.mescrollUp.page.num;
                }
                var flag = 0;
                for (let j = 0; j < result.data.txs[i].inputs.length; j++) {
                  if (result.data.txs[i].inputs[j].prev_out && result.data.txs[i].inputs[j].prev_out.addr ==
                      wallet.address) {
                    flag = 1;   // 发送
                    break;
                  }
                }
                if (!flag) {
                  res.type = 2;
                  res.name = '接收';
                  for (var j = 0; j < result.data.txs[i].out.length; j++) {
                    if (result.data.txs[i].out[j].addr == wallet.address/**/) {
                      res.value += result.data.txs[i].out[j].value;
                    }
                  }
                } else {
                  res.type = 1;
                  res.name = '发送';
                  // for (let j = 0; j < result.data.txs[i].inputs.length; j++) {
                  //   if (result.data.txs[i].inputs[j].prev_out.addr == wallet.address) {
                  //     res.value += result.data.txs[i].inputs[j].prev_out.value;
                  //   }
                  // }
                  // for (var j = 0; j < result.data.txs[i].out.length; j++) {
                  //   if (result.data.txs[i].out[j].addr == wallet.address) {
                  //     res.value -= result.data.txs[i].out[j].value;
                  //   }
                  // }
                  for (var j = 0; j < result.data.txs[i].out.length; j++) {
                    if (result.data.txs[i].out[j].addr !== wallet.address) {
                      res.value += result.data.txs[i].out[j].value;
                    }
                  }
                }
                list.push(res);
              }
              console.log(list + '数据  ');
              // 如果是第一页需手动制空列表
              console.log('page.num-------------------------', page.num);
              if (page.num === 1) {
                this.dataList = [];
              }
              // 把请求到的数据添加到列表
              this.dataList = this.dataList.concat(list);
              console.log('this.dataList-------------------', this.dataList);
              // 数据渲染成功后,隐藏下拉刷新的状态
              this.$nextTick(() => {
                mescroll.endSuccess(list.length);
              });
            });
      },
      USDT(page, mescroll) {
        var wallet = this.btcCommon.BtcWallet.getCurrWallet();
        let addr = wallet.address;
        switch (process.env.BTC_NET) {
          case 'mainnet':
            $USDT.sendHttp('/apiomniinfo/v1/address/addr/details/', 'post', {
              addr: addr,
              page: this.mescrollUp.page.num,
            }, (res) => {

              let list = [];
              let sendAddress = res.data.address;
              let data = res.data.transactions;
              let obj = {};
              for (let i = 0; i < data.length; i++) {
                obj = {};
                obj.black_number = 'usdt';
                obj.time = data[i].blocktime;
                obj.value = data[i].amount;
                obj.selfNum = data[i].block ? data[i].block : this.LastBlock + 1;
                obj.num = this.LastBlock - obj.selfNum;
                obj.name = data[i].sendingaddress == sendAddress ? '发送' : '接收';
                obj.type = data[i].sendingaddress == sendAddress ? 1 : 2;
                obj.hash = data[i].txid;
                list.push(obj);
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
            break;
          case 'testnet':
            $USDT.sendHttp('/usdt/getTransactionTestnet', 'post', {
              addr: addr,
              page: this.mescrollUp.page.num,
            }, (res) => {
              let list = [];
              let sendAddress = res.data.data.address;
              let data = res.data.data.transactions;
              let obj = {};
              for (let i = 0; i < data.length; i++) {
                obj = {};
                obj.black_number = 'usdt';
                obj.time = data[i].blocktime;
                obj.value = data[i].amount;
                obj.selfNum = data[i].block ? data[i].block : this.LastBlock + 1;
                obj.num = this.LastBlock - obj.selfNum;
                obj.name = data[i].sendingaddress == sendAddress ? '发送' : '接收';
                obj.type = data[i].sendingaddress == sendAddress ? 1 : 2;
                obj.hash = data[i].txid;
                list.push(obj);
              }
              // 如果是第一页需手动制空列表
              console.log('page.num-------------------------', list);
              if (page.num === 1) {
                this.dataList = [];
              }
              // 把请求到的数据添加到列表
              this.dataList = this.dataList.concat(list);
              console.log('this.dataList-------------------', this.dataList);
              // 数据渲染成功后,隐藏下拉刷新的状态
              this.$nextTick(() => {
                mescroll.endSuccess(list.length);
              });
            });
            break;
        }

      },
      sclick(item) {
        let status = 0;
        if (((Number(item.num) + 1) / this.statusMax) >= 1) {
          status = 1;
        }
        this.$router.push({
          path: '/BTC/record',
          query: {
            value: item.value,
            txid: item.hash,
            time: item.time,
            status: status,
            type: this.symbol,
          },
        });

      },
      zhuanzhang() {
        this.$router.push({
          path: '/BTC/eth',
          query: {
            type: this.currencyType,
            symbol: this.symbol,
            balance: this.balance,
          },
        });

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
        // history.back();
        this.$router.push({
          path: '/warp',

          query: {
            type: this.$route.query.type,
            balance: this.$route.query.balance,
          },
        });
      },
    },
    created() {
      var wallet = this.btcCommon.BtcWallet.getCurrWallet();
      wallet.getLastBlock((err, res) => {
        this.LastBlock = res;
      });
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
      this.realBalance = this.$route.query.realBalance;
      this.symbol = this.$route.query.symbol;
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
      contracts() {
        return this.$store.state.contracts;
      },
      decimalss() {
        return this.$store.state.decimalss;
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
        /*margin-top: 1.1rem;*/
        padding-top: 1.09rem;
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
        width: 2.4rem; /*必须设置宽度*/
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
