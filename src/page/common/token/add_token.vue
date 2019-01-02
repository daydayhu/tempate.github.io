<template>
    <div style="height: 100%;">
        <div class="top_nav">
            <div class="back_icon" @click="back"></div>
            <p>新增资产</p>
            <span class="search_icon" @click="search"></span>
        </div>

        <div class="content_bg">

            <ul style="height: 100%;">
                <p class="eth">
                    <span class="symbol_icon_eth float"></span>
                    <span class="text">ETH</span>
                </p>
                <mescroll-vue ref="mescroll" id="mescrollTran" :down="mescrollDown" :up="mescrollUp" @init="mescrollInit">
                    <li v-for="item in dataList" v-if="item.symbol != 'ETH'">
                        <span class="symbol_icon_eth float"></span>
                        <span class="text"><i class="symbol">{{item.symbol}}</i>  <i class="name"> {{item.name}}</i></span>
                        <span @click="change(item)" :class="item.isKaiguan ? 'kai_bg' : 'guan_bg' " class="icon"></span>
                    </li>
                </mescroll-vue>


            </ul>
        </div>
    </div>

</template>

<script>
  import MescrollVue from 'mescroll.js/mescroll.vue';

  export default {
    name: 'add_token',
    data() {
      return {
        mescroll: null, // mescroll实例对象
        mescrollDown: {}, //下拉刷新的配置. (如果下拉刷新和上拉加载处理的逻辑是一样的,则mescrollDown可不用写了)
        mescrollUp: { // 上拉加载的配置.
          callback: this.upCallback, // 上拉回调,此处简写; 相当于 callback: function(page, mescroll) { }
          //以下是一些常用的配置,当然不写也可以的.
          page: {
            num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
            size: 20, //每页数据条数,默认10
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
        token_data: [],
        all_token: [],
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
        // 如果是第一页需手动制空列表
        if (page.num === 1) {
          this.dataList = [];
        }
        var wallet = this.common.Wallet.getCurrWallet();
        let that = this;
        // 获取所有的token
        wallet.getAllTokens({size: page.size, page: page.num}, (err, data) => {
          that.all_token = data.list;
          // 获取持有的token
          wallet.getTokens((err, res) => {
            that.token_data = res;
            for (let i = 0; i < that.all_token.length; i++) {
              for (let j = 0; j < that.token_data.length; j++) {
                if (that.token_data[j].contract_address == that.all_token[i].contract_address) {
                  that.all_token[i].isKaiguan = true;
                }
              }
            }
            // 把请求到的数据添加到列表
            this.dataList = that.dataList.concat(that.all_token);
            // 数据渲染成功后,隐藏下拉刷新的状态
            this.$nextTick(() => {
              mescroll.endSuccess(that.all_token.length);
            });
          });

        });

      },
      back() {
        // history.back();
        this.$router.push({
          path: 'index',
          query: {
            type: 'ETH',
          },
        });
      },
      change(item) {
        this.$forceUpdate();
        this.$set(item, 'isKaiguan', !item.isKaiguan);
        var wallet = this.common.Wallet.getCurrWallet();
        if (item.isKaiguan) {
          wallet.addHoldToken(item.contract_address, (err, response) => {
          });
        } else {
          wallet.removeHoldToken(item.contract_address, (err, response) => {
          });

          wallet.getTokens((err, data) => {
          });
        }
      },
      search() {
        this.$router.replace('/searchtoken');
      },
    },
    mounted() {

    },
  };
</script>

<style scoped>
    .content_bg {
        background-color: #F6F6F6;
        overflow-x: hidden;
        overflow-y: scroll;
        height: 100%;
    }

    ul {
        padding-top: 1.2rem;
    }

    ul li, p.eth {
        width: 7.11rem;
        height: 1.40rem;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0 0 0.11rem 0 rgba(240, 240, 240, 1);
        border-radius: 0.14rem;
        margin: 0.2rem auto 0;

        font-size: 0.32rem;
        font-weight: 600;
        color: rgba(74, 74, 74, 1);
        line-height: 1.40rem;
        padding-left: 0.4rem;
    }

    ul li span.text {
        width: 4rem;
        height: 1.40rem;
        display: inline-block;

    }

    ul li span .symbol {
        max-width: 2rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
    }

    ul li span .name {
        max-width: 1.9rem;
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
    }

    ul li span.icon {
        float: right;
        margin: 0.41rem 0.35rem;
        width: 0.99rem;
        height: 0.59rem;
    }

    ul li span.kai_bg {
        background: url("../../../assets/common/img/icon_kaiguan_kai.png") no-repeat;
        background-size: contain;
    }

    ul li span.guan_bg {
        background: url("../../../assets/common/img/icon_kaiguan_guan.png") no-repeat;
        background-size: contain;
    }

    .search_icon {
        position: absolute;
        display: inline-block;
        width: 0.34rem;
        height: 0.33rem;
        background: url("../../../assets/common/img/icon_sousuo.png") no-repeat;
        background-size: contain;
        top: 50%;
        margin-top: -0.17rem;
        right: 0.5rem;

    }

    .mescroll {
        position: fixed;
        top: 2.8rem;
        bottom: 0;
        height: auto; /*如设置bottom:51px,则需height:auto才能生效*/
    }
</style>
