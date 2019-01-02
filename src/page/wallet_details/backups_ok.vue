<template>
    <div style="width: 100%; height: 100%;">


        <!--进入弹框结束-->

        <!--头部开始-->
        <div class="top_nav">
            <div class="back_icon" @click="back"></div>
            <p>备份助记词</p>
        </div>
        <!--头部结束-->
        <div class="content_color">
            <div class="ns_div">
                <p class="cx_p">确认你的钱包助记词</p>
                <p class="zjc_p">请按照顺序点助记词，已确保你的备份助记词正确。</p>

                <p class="sr">
                    <span v-for="(item,index) in arr2" class="span_span">{{item.name}}</span>
                </p>

                <div style="width: 100%;">
                    <div class="f_div" v-for="(item,index) in arr" @click="shijian(item,index)">

                        <div><p class="text" :class="{'changColor':item.b===true}">{{item.name}}</p></div>
                    </div>
                </div>


                <button @click="yo" class="buton">确认</button>
            </div>
            <div class="btn_divs"></div>
        </div>
        <prompt :promptType="5" v-show="promptShow" @maskcallback="propFun" @confirmcb="propcb"></prompt>

    </div>
</template>
<script>
  import $ from 'jquery';
  import prompt from '../../components/prompt';

  export default {
    components: {
      prompt,
    },
    data() {
      return {
        promptShow: false,
        show: false,
        gaoYuanIdk: 'aboutModalk',
        as: true,
        cen: '',
        content: [],
        arr: [],
        arr2: [],
        bups: '',
        dd: false,

        address: '',
        wallet: '',
        wallet_system: '',
      };
    },
    methods: {
      propFun() {
        this.promptShow = false;
      },
      propcb() {
        if (this.wallet_system === 'ETH') {
          localStorage.setItem('eth_zjc' + this.address, 'y');
          var zjc = localStorage.getItem('eth_zjc' + this.address);
          this.$store.commit('back_zjc', zjc);
          this.$router.replace({
            path: '/wallet_details',
            query: {
              type: 'ETH',
            },
          });
        } else if (this.wallet_system === 'BTC') {
          localStorage.setItem('btc_zjc' + this.address, 'y');
          var zjc = localStorage.getItem('btc_zjc' + this.address);
          this.$store.commit('back_zjc', zjc);
          this.$router.replace({
            path: '/wallet_details',
            query: {
              type: 'BTC',
            },
          });
        }
      },
      back() {
        history.back();
      },
      yo() {
        var sys = this.$route.query.type;
        if (sys == 'ETH') {
          if (this.arr2.length == 12) {

            var wallet = this.common.Wallet.getCurrWallet();
            this.address = wallet.address;
            this.bups = '';
            for (let i = 0; i < this.arr2.length; i++) {
              this.bups += this.arr2[i].name + ' ';
            }
            if (!wallet.validationMnemonic(this.backups, this.bups.substr(0, this.bups.length - 1))) {
              this.$Tool.$Toast('助记词顺序错误');
            } else {
              this.promptShow = true;
            }
          } else {

            this.$Tool.$Toast('请输入完整的助记词');
          }
        } else if (sys === 'BTC') {
          if (this.arr2.length == 12) {

            var wallet = this.btcCommon.BtcWallet.getCurrWallet();
            this.address = wallet.address;

            this.bups = '';
            for (let i = 0; i < this.arr2.length; i++) {
              this.bups += this.arr2[i].name + ' ';
            }

            console.log(this.bups);
            console.log(this.backups);
            if (!wallet.validationMnemonic(this.backups, this.bups.substr(0, this.bups.length - 1))) {
              this.showa();
              $('.btn_divs').html('助记词顺序错误');
            } else {
              this.promptShow = true;
            }
          } else {
            this.$Tool.$Toast('请输入完整的助记词');
          }
        }
      },
      ee: function() {
        this.dd = false;
      },
      showa() {
        $('.btn_divs').show().delay(1000).fadeOut();
      },
      shijian(item) {
        if (!item.b) {
          this.arr2.push(item);
          item.b = true;
        } else {
          item.b = false;
          for (var i = 0; i < this.arr2.length; i++) {
            if (this.arr2[i].id == item.id) {
              this.arr2.splice(i, 1);
            }
          }
        }
        if (this.arr2.length == 12) {
          $('.buton').addClass('butons');
        } else {
          $('.buton').removeClass('butons');
        }
      },

    },
    mounted() {
      this.wallet_system = localStorage.getItem('wallet_system');
      switch (this.wallet_system) {
        case 'BTC':
          this.wallet = this.btcCommon.BtcWallet.getCurrWallet();
          this.address = this.btcCommon.BtcWallet.getCurrWallet().address;
          break;
        case 'ETH':
          this.wallet = this.common.Wallet.getCurrWallet();
          this.address = this.common.Wallet.getCurrWallet().address;
          break;
      }

      this.removemodals();
      $('body').removeClass('modal-open');
      this.$store.commit('a', this.as);

      this.backups = this.$route.query.backups_text;
      console.log(this.backups);

      this.content = this.backups.split(' ').sort();//['1','2','3']

      for (var i = 0; i < this.content.length; i++) {
        this.arr.push({
          name: this.content[i],
          b: false,
          id: i,
        });
      }

    },
    computed: {
      removemodals() {
        return this.$store.state.removemodals;
      },
      password() {
        return this.$store.state.password;
      },
      a() {
        return this.$store.state.a;
      },
      back_zjc() {
        return this.$store.state.back_zjc;
      },
    },
  };
</script>


<style scoped>
    .btn_divs {
        display: none;
        position: absolute;
        top: 23%;
        width: 3.08rem;
        height: 0.96rem;
        background: rgb(0, 0, 0);
        border-radius: 0.48rem;
        left: 30%;
        color: white;
        text-align: center;
        line-height: 0.96rem;
        opacity: 1;
    }

    .ns_div {
        margin: 0.4rem auto;
        width: 6.5rem;
    }

    .cx_p {
        font-size: 0.32rem;
        color: rgba(203, 204, 206, 1);
        line-height: 0.8rem;
    }

    .zjc_p {
        font-size: 0.23rem;
        color: rgba(107, 121, 156, 1);
        line-height: 0.32rem;
    }

    .sr {
        display: inline-block;
        *display: inline;
        *zoom: 1;
        width: 6.7rem;
        min-height: 2rem;
        margin-top: 0.5rem;
        background: rgba(250, 250, 250, 1);
        border: 0.01rem solid rgba(239, 239, 239, 1);
        line-height: 0.5rem;
        border-radius: 0.08rem;
    }

    .f_div {
        margin-top: 0.2rem;
    }

    .f_div {
        width: 100%;
    }

    .f_div div p.text {
        float: left;
        width: 1.5rem;
        height: 0.47rem;
        text-align: center;
        font-size: 0.28rem;
        margin: 0.2rem 0.05rem;
        border-radius: 0.24rem;
        color: #CACBCD;
    }

    .f_div div p.changColor {
        float: left;
        width: 1.5rem;
        height: 0.47rem;
        text-align: center;
        margin: 0.2rem 0.05rem;
        border-radius: 0.24rem;
        border: 0.02rem solid rgba(107, 121, 156, 1);
        color: rgba(107, 121, 156, 1);
    }

    .span_span {
        width: 1.5rem;
        font-size: .3rem;
        background: #374466;
        color: rgba(255, 255, 255, 1);
        border-radius: 0.24rem;
        line-height: 0.47rem;
        float: left;
        text-align: center;
        margin: 0.2rem 0.05rem;
    }

    .btn_divs {
        top: 65%;
    }

    button {
        width: 5.9rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%);
        border-radius: 0.6rem;
        font-size: 0.4rem;
        color: rgba(255, 255, 255, 1);
        margin: 1rem 0.35rem 1rem;
        border: none;
    }

    .butons {
        color: rgba(255, 255, 255, 1) !important;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1), rgba(47, 124, 243, 1)) !important;
    }

    .buton {
        color: #ccc;
    }

    /*弹框开始*/
    .modals {
        width: 5.89rem;
        height: 3.4rem;
        background: rgba(251, 251, 251, 1);
        border-radius: 0.18rem;
        margin-top: 3rem;
        position: absolute;
        z-index: 100000;
        left: 50%;
        top: 15%;
        transform: translate(-50%, -50%);
    }

    .modals div {
        color: rgba(0, 0, 0, 1);
    }

    .modals div:nth-child(1) {
        font-size: 0.3rem;
        line-height: 0.42rem;
        margin: 0.8rem 0.5rem 0.2rem;
    }

    .modals button {
        width: 4.8rem;
        height: 0.8rem;
        background: rgba(48, 125, 243, 1);
        border-radius: 0.5rem;
        margin: .25rem 0.5rem;
        border: none;
        font-size: 0.36rem;
        color: rgba(255, 255, 255, 1);
    }

    .img {
        margin: 0 auto;
        display: inherit;
        padding: .5rem;
    }

    /*弹框结束*/

    /*显示隐藏*/
    .modal_diva {
        position: absolute;
    }

    .a {
        display: none
    }

    .b {
        width: 7.5rem;
        height: 16.34rem;
        background: rgba(0, 0, 0, 0.43);
        display: none;
        margin-top: -40%;
    }

    .cc {
        display: block;
    }
</style>




