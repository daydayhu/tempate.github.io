<template>
    <div class="marketContainer">
        <p class="title">行情</p>
        <div class="searchC" @click="toSearch">
            <input type="text" class="search" disabled>
            <div class="iconContainer">
                <span class="sIcon"></span>
            </div>

        </div>
        <div class="segment">
            <ul class="header">
                <li class="currency">货币</li>
                <li class="marketValue" :class="{'active':active}" @click="sortList('oneMarket',1)">市值 <span
                        class="changIcon"
                        :class="{'zhangfu':!szsortIf && active,'diefu':szsortIf && active}"
                ></span>
                </li>
                <li class="change" :class="{'active':!active}" @click="sortList('percent_change_24h',2)">涨跌幅 <span
                        class="changIcon"
                        :class="{'zhangfu':!sortIf && !active,'diefu':sortIf && !active}"
                ></span>
                </li>
            </ul>
            <ul class="content">
                <li class="item" v-for="(item,index) in shoewTokenList" :key="index">

                    <ul>
                        <li class="num">{{index+1}}</li>
                        <li class="currencyIcon"><img :src="item.icon"/></li>
                        <li class="currencyIntro">
                            <div class="currencyType">{{item.symbol}}</div>
                            <div class="currencyUnits">{{item.name}}</div>
                        </li>
                        <li class="marketValue">
                            <div class="uds">{{priceRateMark[priceRateType]}}{{item.oneMarket}}</div>
                            <div class="cny">{{priceRateMark[priceRateType]}}{{item.Market}}</div>
                        </li>
                        <li class="change"
                            :class="{'fall':item.percent_change_24h<0,'level':item.percent_change_24h==0}">
                            {{item.percent_change_24h>0?'+':''}}{{item.percent_change_24h}}%
                        </li>
                    </ul>
                </li>

            </ul>
        </div>
    </div>
</template>
<script>
  import {ServerApi} from '../../api/common/serverApi';

  export default {
    name: 'quotes',
    data() {
      return {
        tokens: '',
        tokenList: [],
        shoewTokenList: [],
        priceRateSet: {},
        priceRateMark: {CNY: '￥', USD: '$'},
        priceRateType: 'CNY',
        active: '',
        sortIf: '',
        szsortIf: '',
        onReady: false,

      };
    },
    methods: {
      toSearch() {
        this.$router.push({
          path: '/quotesSeach',
        });
      },
      toFocus(e) {
      },
      queryPrice( callback) {
        this.$ethServerApi.queryPrice(this.tokens.toLocaleLowerCase().split(','), (res) => {
            res.data.forEach((value) => {
              this.priceRateSet[value.asset.toUpperCase()] = value.prices;
            });
            if (callback){
              callback()

            }
        });
      },
      icons(str) {
        return new Promise((resolve, reject) => {
          ServerApi.getQuotes('/marketcap/v1/cryptocurrency/info', {
            symbol: str,
          }, (res) => {
            if (res.status != 200) {

              this.tokenVal = '';
              if (res.status == 429) {
                this.$toast('请求频率过快');
              } else {
                this.$toast('请检查输入的Token是否正确');
              }
              this.$indicator.close();

            } else {
              resolve(res);
            }
          }, (e) => {
            reject(e);
          });
        });

      },
      sortObj(item, k) {
        return function(obj1, obj2) {
          if (k) {
            return Number(obj1[item]) - Number(obj2[item]);
          } else {
            return Number(obj2[item]) - Number(obj1[item]);

          }
        };
      },
      sortList(item, ind) {
        if (ind === 1) {
          this.active = true;
          localStorage.setItem('sortactive', true);
          if (this.onReady) {
            this.szsortIf = !this.szsortIf;

          }
          localStorage.setItem('szsortIf', this.szsortIf);
          if (this.szsortIf) {
            this.tokenList.sort(this.sortObj(item, true));
          } else {
            this.tokenList.sort(this.sortObj(item, false));
          }
        } else {
          this.active = false;
          localStorage.setItem('sortactive', false);
          if (this.onReady) {
            this.sortIf = !this.sortIf;
          }
          localStorage.setItem('sortIf', this.sortIf);

          if (this.sortIf) {
            this.tokenList.sort(this.sortObj(item, true));
          } else {
            this.tokenList.sort(this.sortObj(item, false));
          }
        }

        this.shoewTokenList = this.tokenList;
        this.onReady = true;
      },
    },
    mounted: function() {
      this.onReady = false;

      this.active = JSON.parse(localStorage.getItem('sortactive') );
      this.sortIf = JSON.parse(localStorage.getItem('sortIf')) ;
      this.szsortIf = JSON.parse(localStorage.getItem('szsortIf'));

      let token = localStorage.getItem('tokens') || '';

      if (token == '') {
        localStorage.setItem('tokens', 'ETH');
      } else {
        if (token.split(',').indexOf('ETH') < 0) {
          let token = token.split(',');
          token.push('ETH');
          localStorage.setItem('tokens', token.join(','));
        } else {
          localStorage.setItem('tokens', token);
        }
      }
      this.priceRateType = localStorage.getItem('priceRateType')
          ? localStorage.getItem('priceRateType')
          : this.priceRateType;
      let that = this;
      let tokens = localStorage.getItem('tokens');
      this.tokens = tokens || 'ETH';

      let key = '_getQuotes_'+'/marketcap/v1/cryptocurrency/quotes/latest';
      this.tokenList = $Store.state.getApiCache(key) || [];
      if (this.tokenList.length) {
        if (this.active) {
          this.active = true;
          localStorage.setItem('sortactive', true);
          localStorage.setItem('szsortIf', this.szsortIf);
          if (this.szsortIf) {
            this.tokenList.sort(this.sortObj('oneMarket', true));
          } else {
            this.tokenList.sort(this.sortObj('oneMarket', false));
          }
        } else {
          this.active = false;
          localStorage.setItem('sortactive', false);
          localStorage.setItem('sortIf', this.sortIf);
          if (this.sortIf) {
            this.tokenList.sort(this.sortObj('percent_change_24h', true));
          } else {
            this.tokenList.sort(that.sortObj('percent_change_24h', false));
          }
        }
        this.shoewTokenList = this.tokenList;
      }else {
        this.$indicator.open();
      }

      this.icons(this.tokens).then((icons) => {
        this.queryPrice( () => {
          ServerApi.getQuotes('/marketcap/v1/cryptocurrency/quotes/latest', {
            symbol: tokens,
          }, (res) => {
            let data = res.data.data;
            let priceRateType = that.priceRateType.toLocaleLowerCase();
            let list = [];
            let icon = icons.data.data;
            for (let item in data) {

              if (this.tokens.split(',').indexOf(item) > -1) {
                data[item].active = true;
              } else {
                data[item].active = false;
              }
              data[item].icon = icon[data[item].symbol].logo;
              data[item].percent_change_24h = data[item].quote['USD'].percent_change_24h.toFixed(4);
              data[item].oneMarket = that.priceRateSet[(data[item].symbol)][priceRateType];
              data[item].Market = (((that.priceRateSet[data[item].symbol][priceRateType] *
                  data[item].circulating_supply)) / 100000000).toFixed(2) + '亿';
              list.push(data[item]);
            }
            that.tokenList = list;
            if (that.active) {
              that.active = true;
              localStorage.setItem('sortactive', true);
              localStorage.setItem('szsortIf', this.szsortIf);
              if (that.szsortIf) {
                that.tokenList.sort(that.sortObj('oneMarket', true));
              } else {
                that.tokenList.sort(that.sortObj('oneMarket', false));
              }
            } else {
              that.active = false;
              localStorage.setItem('sortactive', false);
              localStorage.setItem('sortIf', this.sortIf);
              if (that.sortIf) {
                that.tokenList.sort(this.sortObj('percent_change_24h', true));
              } else {
                that.tokenList.sort(that.sortObj('percent_change_24h', false));
              }
            }
            this.shoewTokenList = this.tokenList;
            $Store.state.setApiCache(key, JSON.parse(JSON.stringify(this.tokenList)));
            this.$indicator.close();
          }, (e) => {
           if(e.status==429){
             this.$toast('请求频率过快');
           }
            this.$indicator.close();
          });
        });


      });
    },
  };

</script>

<style scoped>
    .marketContainer {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #ffffff;
        overflow-y: scroll;

    }

    .marketContainer .title {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 1;
        text-align: center;
        line-height: 1.1rem;
        font-size: 0.42rem;
        font-family: Semibold;
        color: #ffffff;
        background: #374466;
    }

    .searchC {
        width: 100%;
        margin-top: 1.54rem;
        position: relative;

    }

    .searchC input {
        width: 6.98rem;
        height: 0.56rem;
        margin: 0 auto;
        background: rgba(239, 239, 239, 1);
        border-radius: 0.10rem;
        padding: 0.15rem 0 0.15rem 0.8rem;
    }

    .iconContainer {
        display: flex;
        height: 100%;
        position: absolute;
        left: 0.45rem;
        top: 0;
        width: 0.36rem;
        align-items: center;
    }

    .sIcon {
        float: left;
        width: 0.36rem;
        height: 0.36rem;
        background: url("../../assets/common/img/icon_sousuo_hui@2x.png") no-repeat center center;

        background-size: cover;
    }

    .segment {
        width: 100%;
        margin-top: 0.1rem;
    }

    .segment .header {
        width: 100%;
        height: 0.92rem;
        border-bottom: 1px solid rgba(229, 229, 229, 1);
    }

    .segment .header li {
        width: 33%;
        height: 0.92rem;
        line-height: 0.92rem;
        float: left;
        font-size: 0.32rem;
        font-family: PingFangSC-Semibold;
        font-weight: 600;
        color: rgba(74, 74, 74, 1);
    }

    .segment .header .currency, .segment .header .marketValue {
        text-indent: 0.3rem;
    }

    .segment .header li:nth-child(3), .segment .header li:nth-child(2) {
        position: relative;

        text-indent: 0.6rem;

    }

    .segment .header li.active {
        color: #3089EF;
    }

    .segment .header li:nth-child(3) .changIcon, .segment .header li:nth-child(2) .changIcon {

        width: 0.17rem;
        height: 0.36rem;
        position: absolute;
        top: 0.29rem;
        background: url("../../assets/common/img/icon_x_zhangfu_ling@2x.png") no-repeat center center;
        background-size: cover;
    }

    .segment .header li:nth-child(3) .zhangfu, .segment .header li:nth-child(2) .zhangfu {
        background: url("../../assets/common/img/icon_zhangdiefucopy@2x.png") no-repeat center center;
        background-size: cover;
    }

    .segment .header li:nth-child(3) .diefu, .segment .header li:nth-child(2) .diefu {
        background: url("../../assets/common/img/icon_zhangdiefu@2x.png") no-repeat center center;
        background-size: cover;
    }

    .segment .content {
        width: 100%;
        padding-left: 0.30rem;
        box-sizing: border-box;
    }

    .segment > .content .item {
        height: 1.32rem;
        border-bottom: 1px solid rgba(229, 229, 229, 1);
    }

    .segment > .content .item ul {
        height: 100%;
    }

    .segment > .content .item li {
        float: left;
        line-height: 1.32rem;
        color: rgba(155, 155, 155, 1);
    }

    .segment > .content .item .num {
        width: 0.38rem;
        font-size: 0.22rem;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        /*color: rgba(155,155,155,1);*/
    }

    .segment .currencyIcon {
        width: 0.48rem;
        height: 0.48rem;
        margin-top: 0.42rem;
        background-color: rgba(216, 216, 216, 1);
        border-radius: 100%;

    }

    .segment .currencyIcon img {
        width: 100%;
        height: 100%;
        display: block;
    }

    .segment .currencyIntro {
        margin: 0.22rem 0 0 0.24rem;
        width: 1.59rem;
        font-family: PingFangSC-Regular;
        font-weight: 400;
    }

    .segment .content .currencyType {
        height: 0.45rem;
        font-size: 0.32rem;
        color: rgba(0, 0, 0, 1);
        line-height: 0.45rem;
    }

    .segment .content .currencyUnits {
        height: 0.33rem;
        font-size: 0.24rem;
        color: rgba(155, 155, 155, 1);
        line-height: 0.33rem;
    }

    .segment .content li.marketValue {
        margin-top: 0.19rem;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        width: 2rem;
        text-align: right;
    }

    .segment .content .uds {
        height: 0.50rem;
        font-size: 0.36rem;
        color: rgba(51, 51, 51, 1);
        line-height: 0.50rem;
    }

    .segment .content .cny {
        height: 0.33rem;
        font-size: 0.24rem;
        color: rgba(155, 155, 155, 1);
        line-height: 0.33rem;
    }

    .segment .content ul .change {
        float: right;
        margin-right: 0.37rem;
        width: 1.56rem;
        height: 0.55rem;
        margin-top: 0.36rem;
        background-color: rgba(0, 189, 103, 1);
        border-radius: 0.06rem;
        text-align: center;
        font-size: 0.26rem;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        color: rgba(255, 255, 255, 1);
        line-height: 0.55rem
    }

    .segment .fall {
        background-color: #EA573B !important;
    }

    .segment .level {
        background-color: #999999 !important;
    }

</style>
