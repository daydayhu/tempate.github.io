<template>
    <div class="manageWallet">
        <v-nav>管理钱包</v-nav>
        <div class="walletsContainer">
          <ul class="walletList">
            <li v-for="(item,index) in allWallets" :key="index" @click="toDetailWallet(item)">
              <ul class="walletItem">
                <li class="wIcon" :class="['wIcon_'+item.symbol]"></li>
                <li class="wMsg">
                  <div class="wType">{{item.symbol}} {{item.walletName}}</div>
                  <div class="wbalance">≈{{priceRateMark[priceRateType]}} {{priceRateType === 'cny' ? item.cnyBalance : item.usdBalance | rateFormat(item.symbol)}}</div>
                </li>
                <li class="backupHint" v-if="item.backup == '1'">未备份</li>
                <li class="goto"></li>
              </ul>
            </li>
          </ul>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'manageWallet',
    data() {
      return {
        allWallets:[],
        priceRateType: 'cny', //cny 人民币(默认) usd 美元
        priceRateMark: {cny: '￥', usd: '$'}
      }
    },
    methods: {
      getAllWallets() {
        let ethWallets = JSON.parse(localStorage.getItem('eth_wallets')) || [];
        let btcWallets = JSON.parse(localStorage.getItem('btc_wallets')) || [];

        // TODO: 更新备份状态
        ethWallets.forEach(value => {
          value.backup = localStorage.getItem('eth_zjc'+value.address);
          value.symbol = 'ETH';
        });
        btcWallets.forEach(value => {
          value.backup = localStorage.getItem('btc_zjc'+value.address);
          value.symbol = 'BTC';
        });

        this.allWallets = ethWallets.concat(btcWallets);

        console.log('this.allWallets====',this.allWallets);
      },
      toDetailWallet(item) {

        let walletObj = {};
        walletObj.address = item.address;
        walletObj.pwdPrompt = item.pwdPrompt;
        walletObj.walletName = item.walletName;
        walletObj.cnyBalance = item.cnyBalance;
        walletObj.usdBalance = item.usdBalance;

        switch (item.symbol) {
          case 'ETH':
            localStorage.setItem('currWallet', JSON.stringify(walletObj));
            break;
          case 'BTC':
            localStorage.setItem('btc_currWallet', JSON.stringify(walletObj));
            break;
          default:
            break;
        }

        this.$router.push({
          path: '/wallet_details',
          query: {
            type: item.symbol,
          },
        });
      }
    },
    mounted() {
      //TODO: 获取实体币类型
      this.priceRateType = localStorage.getItem('priceRateType') ? localStorage.getItem('priceRateType')
        : this.priceRateType;

      // TODO: 获取钱包集合ETH/BTC
      this.getAllWallets();


    }
  };
</script>

<style  lang="less" scoped>
    .manageWallet {
      position: absolute;
      width: 100%;
      height: 100%;
      background:rgba(246,246,246,1);
      .walletsContainer {
        margin-top: 1.1rem;
        /*background-color: #5bc0de;*/
        padding-bottom: 0.2rem;
        overflow: auto;
        .walletList > li {
          width: 7.1rem;
          height: 1.58rem;
          margin: 0.26rem auto 0;
          background: rgba(255,255,255,1);
          border-radius: 0.14rem;
          .walletItem {
            height: 100%;
            width: 100%;
            position: relative;
            /*background-color: #5bc0de;*/
            & > li{
              float: left;
              height: 100%;
            }
            .wIcon {
              width: 0.69rem;
              height: 0.69rem;
              margin: 0.46rem 0 0 0.46rem;
              border-radius: 100%;

            }
            .wIcon_ETH {
              background: url("../../assets/common/img/icon_biao_eth.png") no-repeat center center;
              background-size: cover;
            }
            .wIcon_BTC {
              background: url("../../assets/common/img/icon_biao_btc.png") no-repeat center center;
              background-size: cover;
            }
            .wMsg {
              /*width: 2.0rem;*/
              margin: 0 0 0 0.4rem;
              /*background-color: #5bc0de;*/
              padding-top: 0.38rem;
              max-width: 3.4rem;

              .wType {
                height: 0.45rem;
                font-size: 0.32rem;
                font-weight: 400;
                color: rgba(0,0,0,1);
                line-height: 0.45rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .wbalance {
                height: 0.40rem;
                font-size: 0.26rem;
                font-weight: 400;
                color: rgba(110,110,110,1);
                line-height: 0.40rem;
              }
            }
            .backupHint {
              width: 0.95rem;
              height: 0.3rem;
              margin: 0.44rem 0 0 0.2rem;
              border-radius: 0.15rem;
              border:1px solid rgba(141,150,177,1);
              text-align: center;
              font-size: 0.2rem;
              font-weight: 500;
              color:rgba(141,150,177,1);
              line-height: 0.3rem;
            }
            .goto {
              float: right;
              width: 0.16rem;
              height: 0.26rem;
              margin: 0.45rem 0.48rem 0 0;
              background: url("../../assets/common/img/icon_goto.png") no-repeat center center;
              background-size: cover;
            }
          }

        }
      }
    }

</style>
