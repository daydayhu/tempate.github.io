<template>
    <div class="searchContainer" >
        <v-nav>搜索</v-nav>
        <div class="searchC">
            <input type="search" v-model="tokenVal" class="search"  @focus="makeIf = true" @keydown.enter="seachToken"
                   v-focus>
            <span class="sIcon"></span>
            <span class="reset" @click="reset" v-if="tokenVal !=''"></span>

        </div>
        <div class="segment">
            <ul class="content">
                <li class="item" v-for="(item,index) in tokenList" :key="index">
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
                        <li class="focus" :class="{'nofocus':item.active}" @click="tabActive(item)">
                            {{!item.active?'关注':'已关注'}}
                        </li>
                    </ul>
                </li>
                <p class="title" v-if="tokenList.length<1">1.不支持模糊搜索，请输入完整的token</p>
                <p class="title" v-if="tokenList.length<1">2.您输入的token本平台不支持行情查询</p>
            </ul>
        </div>
        <div class="make" v-if="makeIf" @click="seachToken"></div>

    </div>
</template>
<script>
  import {ServerApi} from '../../api/common/serverApi';

  export default {
    name: 'quotes',
    data() {
      return {
        tokens: '',
        tokenList: {},
        priceRateSet: {},
        priceRateMark: {CNY: '￥', USD: '$'},
        priceRateType: 'CNY',
        tokenVal: '',
        makeIf: false,


      };
    },
    methods: {
      seachToken() {
        this.makeIf = false;
        if (this.tokenVal != '') {
          this.init(this.tokenVal);
        }

      },
      tabActive(item) {
        item.active = !item.active;
        if (item.active) {
          let tokens = localStorage.getItem('tokens');
          if (tokens.split(',') == '') {
            localStorage.setItem('tokens', 'ETH');
          } else {
            tokens = tokens.split(',');

            let token = item.symbol;
            tokens.push(token);
            localStorage.setItem('tokens', tokens.join(','));
          }
        } else {
          let tokens = localStorage.getItem('tokens');
          let token = tokens.split(',');
          token.splice(token.indexOf(item.symbol), 1);
          localStorage.setItem('tokens', token.join(','));
        }
        this.$router.push({
          path: '/warp',
        });

      },
      queryPrice(list, callback) {
        this.$ethServerApi.queryPrice(list.toLocaleLowerCase().split(','), (res) => {
          if (res.status_code === 200) {
            res.data.forEach((value) => {
              this.priceRateSet[value.asset.toUpperCase()] = value.prices;
            });
            if (callback) callback();
          }
        });
      },
      reset() {
        this.tokenVal = '';
      },

      icons(str) {
        return new Promise((resolve, reject) => {
          ServerApi.getQuotes('/marketcap/v1/cryptocurrency/info', {
            symbol: str,
          }, (res) => {
            console.log(res, 'info');
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
            if (e) {
              this.tokenVal = '';
              this.$toast('请检查输入的Token是否正确');
              this.$indicator.close();
            } else {
              reject(e);
            }

          });
        });
      },
      init(val) {
        this.$indicator.open();


        let that = this;
        let seachToken = '';
        let tokens = localStorage.getItem('tokens');
        if (val) {
          seachToken = val.toLocaleUpperCase();
        } else {
          seachToken = this.tokens = tokens || 'ETH';
        }

        this.icons(seachToken).then((icons) => {
          that.queryPrice(seachToken, () => {
            ServerApi.getQuotes('/marketcap/v1/cryptocurrency/quotes/latest', {
              symbol: seachToken,
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
              this.$indicator.close();

            }, (e) => {
              console.log(e, '获取价值失败');
              this.$indicator.close();


            });
          });
        });

      },
    },
    mounted: function() {
      setTimeout(() => {
        this.makeIf = true;
      }, 200);

      this.tokenVal = '';
      this.priceRateType = localStorage.getItem('priceRateType')
          ? localStorage.getItem('priceRateType')
          : this.priceRateType;
      this.init();
    },
  };
</script>

<style scoped lang="less">
    .make {
        position: fixed;
        top: 1rem;
        left: 0;
        width: 100%;
        height: 100vh;
    }

    .makeTrue {
        background-color: rgba(0, 0, 0, .05) !important;
    }

    .focusinput {
        background-color: #fff !important;
    }


    .searchContainer {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #ffffff;
        &>p{
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
            input {
                width: 6.98rem;

                height: 0.56rem;
                margin: 0 auto;
                background: rgba(239, 239, 239, 1);
                border-radius: 0.10rem;
                padding: 0.15rem 0.8rem 0.15rem 0.80rem;

                /*box-sizing: border-box;*/
            }
            .sIcon {
                width: 0.36rem;
                height: 0.36rem;
                position: absolute;
                left: 0.45rem;
                top: 0.1rem;
                background: url("../../assets/common/img/icon_sousuo_hui@2x.png") no-repeat center center;
                background-size: cover;
            }
            .reset {
                width: 0.36rem;
                height: 0.36rem;
                position: absolute;
                right: 0.45rem;
                top: 0.1rem;
                background: url("../../assets/common/img/icon_quxiao@2x.png") no-repeat center center;

                background-size: cover;
            }
        }
        .segment {
            width: 100%;
            margin-top: 0.10rem;
            & > .header {
                width: 100%;
                height: 0.92rem;
                border-bottom: 1px solid rgba(229, 229, 229, 1);
                & > li {
                    width: 33%;
                    height: 0.92rem;
                    line-height: 0.92rem;
                    float: left;
                    text-align: center;
                    font-size: 0.32rem;
                    font-family: PingFangSC-Semibold;
                    font-weight: 600;
                    color: rgba(74, 74, 74, 1);
                }
                & > li:nth-child(3) {
                    color: rgba(20, 192, 202, 1);
                    .changIcon {
                        width: 0.10rem;
                        height: 0.15rem;
                        background: rgba(20, 192, 202, 1);
                    }
                }
            }
            & > .content {
                height: 1.32rem;
                padding-left: 0.30rem;
                .item {
                    width: 100%;
                    height: 100%;
                    border-bottom: 0.01rem solid rgba(229, 229, 229, 1);
                    & > ul {
                        width: 100%;
                        height: 100%;
                        li {
                            float: left;
                            line-height: 1.32rem;
                            color: rgba(155, 155, 155, 1);
                        }
                        .num {
                            width: 0.38rem;
                            font-size: 0.22rem;
                            font-family: PingFangSC-Regular;
                            font-weight: 400;
                            /*color: rgba(155,155,155,1);*/
                        }
                        .currencyIcon {
                            width: 0.48rem;
                            height: 0.48rem;
                            margin-top: 0.42rem;
                            background-color: rgba(216, 216, 216, 1);
                            border-radius: 100%;
                            img {
                                width: 100%;
                                height: 100%;
                                display: block;
                            }
                        }
                        .currencyIntro {
                            margin: 0.22rem 0 0 0.24rem;
                            width: 1.69rem;
                            font-family: PingFangSC-Regular;
                            font-weight: 400;
                            .currencyType {
                                height: 0.45rem;
                                font-size: 0.32rem;
                                color: rgba(0, 0, 0, 1);
                                line-height: 0.45rem;
                            }
                            .currencyUnits {
                                height: 0.33rem;
                                font-size: 0.24rem;
                                color: rgba(155, 155, 155, 1);
                                line-height: 0.33rem;
                            }
                        }
                        .marketValue {
                            margin-top: 0.19rem;
                            font-family: PingFangSC-Regular;
                            font-weight: 400;
                            .uds {
                                height: 0.50rem;
                                font-size: 0.36rem;
                                color: rgba(51, 51, 51, 1);
                                line-height: 0.50rem;
                            }
                            .cny {
                                height: 0.33rem;
                                font-size: 0.24rem;
                                color: rgba(155, 155, 155, 1);
                                line-height: 0.33rem;
                            }

                        }
                        .focus {
                            float: right;
                            margin-right: 0.41rem;
                            width: 1.30rem;
                            height: 0.55rem;
                            margin-top: 0.40rem;
                            background: #374466;
                            border-radius: 0.06rem;
                            font-size: 0.26rem;
                            font-family: PingFangSC-Regular;
                            font-weight: 400;
                            color: rgba(255, 255, 255, 1);
                            line-height: 0.55rem;
                            text-align: center;
                        }
                        .nofocus {
                            color: #9B9B9B;
                            border: 0.01rem solid #9B9B9B;
                            background-color: transparent;
                        }
                    }
                }
            }
            .title {

                font-size: 0.20rem;
            }
        }
    }
</style>
