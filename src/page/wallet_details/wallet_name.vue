<template>
    <div style="height: 100%;">
        <v-nav>钱包名</v-nav>
        <div class="content_color">
            <div class="n_div">
                <input type="text" placeholder="请输入新名字" v-model.trim="text" @focus="focus1" @blur="blur1">
                <!--<input type="text" placeholder="请输入新名字" v-model.trim="text" @focus="focus1" @blur="blur1" v-focus="true">-->
            </div>
            <p class="passRe" :class="[{'visibi':nameRe},{'error-color':errorColor}]">1-30位字符，支持数字、大小写字母和常用字符</p>
            <button @click="estimate" class="btns">保存</button>
        </div>

        <div class="btn_div"></div>
    </div>

</template>

<script>
  import $ from 'jquery';
  import $RN from '../../api/common/regExpVal';

  export default {
    data() {
      return {
        text: '',
        uname: '',
        nameRe: true,
        errorColor: false,
      };
    },
    methods: {

      estimate() {
        var _this = this;
        if (this.text == '') {
          this.$Tool.$Toast('请输入钱包名');
          return;
        }
        if (!$RN.username.test(this.text)) {
          this.$Tool.$Toast('请按照提示设置');
          return;
        }

        var sys = this.$route.query.type;
        if (sys === 'ETH') {
          var wallet = this.common.Wallet.getCurrWallet();
          this.uname = wallet.setWalletName(this.text, (err, wallet) => {
            if (err) {
              this.$Tool.$Toast(err);
              return;
            }
          });
          if (this.uname != undefined) {
            this.$store.commit('username', this.uname.walletName);//抛出钱包名
            this.$Tool.$Toast('修改成功');
            setTimeout(() => {
              history.back();
            }, 1000);
          }
        } else {

          var wallet = this.btcCommon.BtcWallet.getCurrWallet();

          this.uname = wallet.setWalletName(this.text, (err, wallet) => {
            if (err) {
              this.$Tool.$Toast(err);
              return;
            }
          });

          if (this.uname != undefined) {
            console.log('this.uname', this.uname);
            this.$store.commit('username', this.uname.walletName);//抛出钱包名
            this.$Tool.$Toast('修改成功');
            setTimeout(() => {
              history.back();
            }, 1000);
          }
        }
      },
      focus1() {
        this.nameRe = false;
        this.errorColor = false;
      },
      blur1() {
        if ($RN.username.test(this.text)) {
          this.nameRe = true;
          this.errorColor = false;
        } else {
          this.nameRe = false;
          this.errorColor = true;
        }
      },
    },
    mounted() {
      this.removemodals();
      this.text = this.$route.query.wname.walletName;

    },
    computed: {
      username() {
        return this.$store.state.username;
      },
      removemodals() {
        return this.$store.state.removemodals;
      },
    },
    // directives: {
    //   focus: {
    //     inserted: function (el, {value}) {
    //       console.log(el,{value})
    //       if (value) {
    //         el.focus();
    //       }
    //     }
    //   }
    // }

    // watch: {
    //   text: {
    //     handler: function(val) {
    //
    //       if (this.text != '' && this.nameRe) {
    //         $('button').removeClass('btns');
    //       } else {
    //         $('button').addClass('btns');
    //       }
    //     },
    //     deep: true,
    //   },
    // },
  };
</script>

<style scoped>
    .n_div {
        width: 6.56rem;
        height: 1rem;
        border-bottom: 0.02rem solid #647295;

        margin: 0.2rem auto;
    }

    input {
        width: 100%;
        height: 100%;
        border: none;
        background-color: #2C3754;
        color:rgba(106,120,155,1);
        padding: 0;
    }

    button {
        width: 5.9rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%);
        border-radius: 0.6rem;
        font-size: 0.4rem;
        color: rgba(255, 255, 255, 0.5);
        margin: 0.38rem 0.8rem;
        border: none;
    }

    .btns {
        color: rgba(255, 255, 255, 1) !important;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%) !important;
    }

    .passRe {
        font-size: 0.20rem;
        color: rgba(216, 216, 216, 1);
        line-height: 0.4rem;
        text-align: left;
        width: 6.67rem;
        margin-top: 0.10rem;
        margin-left: 0.49rem;
    }

    .visibi {
        display: none;
    }

    .error-color {
        color: #FF6363;
    }

    input:-ms-input-placeholder {
        color: rgba(106, 120, 155, 1);
    }

    /* Internet Explorer 10+ */
    input::-webkit-input-placeholder {
        color: rgba(106, 120, 155, 1);
    }

    /* WebKit browsers */
    input::-moz-placeholder {
        color: rgba(106, 120, 155, 1);
    }

    /* Mozilla Firefox 4 to 18 */
    input:-moz-placeholder {
        color: rgba(106, 120, 155, 1);
    }

    /* Mozilla Firefox 19+ */

</style>
