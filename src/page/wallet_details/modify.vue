<template>
    <div style="height: 100%;">
        <v-nav>更改密码</v-nav>

        <div class="content_color" style="padding-left:0.45rem; padding-right: 0.45rem;">
          <form>
            <div>
              <input autocomplete="off" type="password" placeholder="当前密码" v-model.trim="oldPassword" @focus="focus1">
            </div>
            <h2 class="passRe" :class="[{'visibi':oldPass},{'error-color':errorColor1}]">
              密码错误
            </h2>


            <div>
              <input autocomplete="off" type="password" placeholder="新密码"  v-model.trim="newPassword" @focus="focus2" @blur="blur2">
            </div>
            <h2 class="passRe" :class="[{'visibi':newPass},{'error-color':errorColor2}]">
              8-16位字符，建议混合使用大小写字母、数字和常用字符
            </h2>

            <div>
              <input autocomplete="off" type="password" placeholder="重复新密码" v-model.trim="password3" @focus="focus3">
            </div>
            <h2 class="passRe" :class="[{'visibi':newPassRe},{'error-color':errorColor3}]">
              密码不一致
            </h2>

          </form>

          <p class="g p_wj">忘记钱包密码？您可以通过使用助记词或私钥重置密码。</p>
          <router-link :to="{path:'/password',query:{type: this.$route.query.type}}">
            <span class="b p_wj">马上导入</span>
          </router-link>

          <button @click="estimate" :disabled="isDisabled" :class="btnShow?'btns':''">保存</button>


          <!--<div class="ns_div">
              <div class="n_div">
                  <input type="password" placeholder="当前密码" v-model="oldPassword">
              </div>
              <div class="n_div">
                  <input type="password" placeholder="新密码" v-model="newPassword">
              </div>
              <div class="n_div">
                  <input type="password" placeholder="重复新密码" @input="search($event)" v-model="password3">
              </div>
              <p class="g p_wj">忘记钱包密码？您可以通过使用助记符或私钥重置密码。</p>
              <router-link :to="{path:'/password',query:{type: this.$route.query.type}}">
                  <span class="b p_wj">马上导入</span>
              </router-link>

              <button @click="estimate">保存</button>
          </div>-->


        </div>
    </div>
</template>

<script>
  import $ from 'jquery';
  import $RN from '../../api/common/regExpVal'
  export default {
    data() {
      return {
        oldPassword: '',
        newPassword: '',
        password3: '',
        pass: '',

        oldPass: true,
        newPass: true,
        newPassRe: true,
        errorColor1: false,
        errorColor2: false,
        errorColor3: false,

        isDisabled: true,
      };
    },
    methods: {
      focus1() {
        this.oldPass = true;
        this.errorColor1 = false;
      },

      focus2() {
        this.newPass = true;
        this.errorColor2 = false;
        this.newPassRe = true;
        this.errorColor3 = false;
      },
      focus3() {
        this.newPassRe = true;
        this.errorColor3 = false;
      },
      blur2(){
        if($RN.password.test(this.newPassword)){
          this.newPass = true;
          this.errorColor2 = false;
        }else{
          this.newPass = false;
          this.errorColor2 = true;
        }
      },
      estimate() {
        this.$indicator.open();
        setTimeout(() => {

          if (this.oldPassword == '') {
            this.$Tool.$Toast('请输入当前密码');
            this.$nextTick(()=>{             this.$indicator.close();           });
          } else if (this.newPassword == '') {
            this.$Tool.$Toast('请输入新密码');
            this.$nextTick(()=>{             this.$indicator.close();           });
          } else if (this.password3 == '') {
            this.$Tool.$Toast('请重新输入新密码');
            this.$nextTick(()=>{             this.$indicator.close();           });
          } else if (this.newPassword !== this.password3) {
            // this.$Tool.$Toast('密码不一致');
            this.newPassRe = false;
            this.errorColor3 = true;

            this.$nextTick(()=>{             this.$indicator.close();           });
          } else if (this.newPassword == this.oldPassword) {
            this.$Tool.$Toast('不可和旧密码一致');
            this.$nextTick(()=>{             this.$indicator.close();           });
          } else if (this.passW.PasswordValidator.validatePassword(this.newPassword).err != null) {
            // this.$Tool.$Toast('密码不符合要求');
            this.newPass = false;
            this.errorColor2 = true;

            this.$nextTick(()=>{             this.$indicator.close();           });
          } else {
            var _this = this;
            var sys = this.$route.query.type;
            if (sys === 'ETH') {
              var wallet = _this.common.Wallet.getCurrWallet();
              _this.pass = wallet.setPassword(_this.oldPassword, _this.newPassword, (err, wallet) => {
                if (err) {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  // this.$Tool.$Toast('旧密码错误');

                  this.oldPass = false;
                  this.errorColor1 = true;

                } else {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  // _this.showa();
                  this.$Tool.$Toast('修改成功');

                  setTimeout(() => {
                    history.back();
                  }, 1000);
                }
              });
            } else {
              var wallet = _this.btcCommon.BtcWallet.getCurrWallet();
              _this.pass = wallet.setPassword(_this.oldPassword, _this.newPassword, wallet.getAddress(), (err, wallet) => {
                if (err) {
                  setTimeout(() => {_this.$indicator.close();}, 0);
                  // this.$Tool.$Toast('旧密码错误');

                  this.oldPass = false;
                  this.errorColor1 = true;

                } else {
                  setTimeout(() => {_this.$indicator.close();}, 0);
                  this.$Tool.$Toast('修改成功');
                  setTimeout(() => {
                    history.back();
                  }, 1000);
                }

              });
            }

          }

        }, 1000);
      },
    },
    mounted() {

    },
    computed: {
      btnShow() {
        if (this.oldPassword != '' && this.newPassword != '' && this.password3 && !this.errorColor1 & !this.errorColor2 & !this.errorColor3) {
          this.isDisabled = false;
          return true;
        } else {
          this.isDisabled = true;
          return false;
        }
      },
    },
  };
</script>

<style scoped>
  form div {
    height: 1rem;
    width: 6.57rem;
    /*border-bottom: 0.02rem solid rgba(68, 78, 105, 1);*/
    border-bottom: 0.02rem solid #647295;
    margin-top: 0.39rem;
  }

  form div input {
    border: none;
    height: 0.95rem;
    width: 100%;
    background-color: #2C3754;
    font-size: 0.3rem;
    font-weight: 500;
    color: rgba(97, 110, 145, 1);
    line-height: 0.42rem;
    padding: 0;
  }

  input:-ms-input-placeholder {
    color: rgba(97, 110, 145, 1);
  }

  /* Internet Explorer 10+ */
  input::-webkit-input-placeholder {
    color: rgba(97, 110, 145, 1);
  }

  /* WebKit browsers */
  input::-moz-placeholder {
    color: rgba(97, 110, 145, 1);
  }

  /* Mozilla Firefox 4 to 18 */
  input:-moz-placeholder {
    color: rgba(97, 110, 145, 1);
  }

  /*异常提醒*/
  .passRe {
    font-size: 0.20rem;
    color: rgba(216, 216, 216, 1);
    line-height: 0.4rem;
    text-align: left;
    width: 6.67rem;
    margin-top: 0.10rem;
    margin-left: auto;
    margin-right: auto;
  }

  .visibi {
    /*visibility: hidden;*/
    display: none;
  }

  .error-color {
    color: #FF6363;
  }
  .p_wj{
    margin-top: 0.4rem;
    font-size: .3rem;
    line-height: 0.42rem;
    display: inline-block
  }
  .btn_divs{
    top: 65%;
    font-size: 0.24rem;
  }
  button{
    width:5.9rem;
    height:1rem;
    border-radius:0.6rem;
    font-size:0.4rem;
    color:rgba(255,255,255,0.5);
    margin: 0.68rem 0.30rem;
    border: none;
    background:linear-gradient(90deg,rgba(51,153,235,1) 0%,rgba(47,124,243,1) 100%);
    border-radius:60px;
  }

    .btns {
        color: rgba(255, 255, 255, 1);
        background: linear-gradient(90deg, rgba(51, 153, 235, 1), rgba(47, 124, 243, 1));
    }
</style>
