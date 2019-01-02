<template>
    <div style="height: 100%;">
        <div class="top_nav">
            <div style="position:relative;">
                <span class="search" @click="search"></span>
                <input type="text" v-model.trim="input" @keyup.enter="search">
            </div>

            <span class="cancel" @click="cancel">取消</span>
        </div>

        <div class="content_bg">
            <ul>
                <li v-for="(item,index) in token_data" :key="index">
                    <span class="symbol_icon_eth float"></span>
                    <span class="text"><i class="symbol">{{item.symbol}}</i>  <i class="name"> {{item.name}}</i></span>
                    <span @click="add(item)" v-show="item.symbol!='ETH'" class="icon"
                          :class="item.isKaiguan ? 'kai_bg' : 'guan_bg' "> </span>
                </li>
            </ul>
            <p class="nodata" v-show="token_data.length < 1 && !fastSearch ">找不到匹配的结果，请检查输入是否正确</p>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'search_token',
    data() {
      return {
        token_data: [],
        hold_token: [],
        input: '',
        lll: true,
        fastSearch: true,
        wallet: this.common.Wallet.getCurrWallet(),
      };
    },
    methods: {
      search() {

        if (this.input == '') {
          this.$Tool.$Toast('请输入条件');


          return;
        }
        this.$indicator.open();
        let that = this;
        this.wallet.searchAsset(that.input, (err, response)=> {
          that.fastSearch = false;
          if ('eth'.indexOf(that.input.toLocaleLowerCase()) !== -1) {
            that.token_data = [{symbol: 'ETH'}].concat(response);
          } else {
            that.token_data = response;
          }
          for (let i = 0; i < that.hold_token.length; i++) {
            for (let j = 0; j < that.token_data.length; j++) {
              if (that.hold_token[i].contract_address == that.token_data[j].contract_address) {
                that.token_data[j].isKaiguan = true;
              }
            }
          }
          this.$nextTick(()=>{
            this.$indicator.close();
          });
        });
      },
      cancel() {
        this.$router.replace('/addtoken');
      },
      add(item) {

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

    },
    mounted() {
      var wallet = this.common.Wallet.getCurrWallet();
      wallet.getTokens((err, data) => {
        this.hold_token = data;
      });
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

    input {
        width: 5.85rem;
        height: 0.60rem;
        background: rgba(255, 255, 255, 0.1666);
        border-radius: 1rem;
        font-size: 0.30rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 1);
        line-height: 0.6rem;
        border: none;
        padding-left: 0.88rem;
    }

    .search {
        position: absolute;
        top: 50%;
        left: 0.36rem;
        margin-top: -0.15rem;
        display: inline-block;
        width: 0.34rem;
        height: 0.3rem;
        background: url("../../../assets/common/img/icon_sousuo.png") no-repeat;
        background-size: contain;
    }

    .cancel {
        font-size: 0.30rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 1);
        line-height: 0.42rem;
        margin-left: 0.24rem;
    }

    .add {
        background: #ccc !important;
    }

    .name {
        font-size: 12px;
    }

    ul {
        padding-top: 1.2rem;
    }

    ul li {
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

    .nodata {
        font-size: 0.3rem;
        color: #4A4A4A;

        text-align: center;
        margin-top: 2.42rem;
    }

</style>
