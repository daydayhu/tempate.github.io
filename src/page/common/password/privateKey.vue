<template>
  <div>
    <textarea class="sr" name="a" id="substance" placeholder="输入明文秘钥" v-model.trim="substance"></textarea>
    <div class="bd">
      <input type="password" placeholder="密码" @focus="focus1" @blur="blur1" v-model.trim="password1">
    </div>
    <p :class="[{'visibi':passRe},{'error-color':errorColor1}]" class="passRe">8-16位字符，建议混合使用大小写字母、数字和常用字符</p>
    <div class="bd">
      <input type="password" placeholder="重复密码" v-model.trim="password2">
    </div>
    <div class="bd">
      <input type="text" placeholder="密码提示 (可不填)">
    </div>


    <div class="divz clear">
      <div class="dh float" @click="show=!show" :class="show?'bg':'bg1'"></div>
      <span class="float" style="color:rgba(107,121,156,1);">我已经仔细阅读并同意</span>
      <router-link :to="{path:'/regulations'}">
        <span class="float" style="color:rgba(107,121,156,1); text-decoration: underline">服务及隐私条款</span>
      </router-link>
    </div>
    <button id="btn" @click="judge" :class="showBt?'bt':'bt1'" :disabled="isDisabled">重置密码</button>
    <div class="btn_div"></div>



  </div>
</template>

<script>
  import chooseSys from '../../../components/common/chooseSys'
  const $RN = {
    // username
    username: /^[a-zA-Z0-9_!@#$%^&\*\(\)\_\+\-\[\]\.\?\{\}=￥·$]{1,30}$/,
    // password
    password: /^[a-zA-Z0-9_!@#$%^&\*\(\)\_\+\-\[\]\.\?\{\}=￥·$]{8,16}$/,
  };
    export default {
        name: "privateKey",
      data(){
        return{
          show:false,
          substance:'',
          password1:'',
          password2:'',
          as:true,
          errorColor1: false,
          passRe: true,
          isDisabled:true,
        }
      },
      methods: {
        showa(){
          $ ('.btn_div').show ().delay (500).fadeOut ();
        },
        focus1() {
          this.passRe = false;
          this.errorColor1 = false;
        },
        blur1() {
          if($RN.password.test(this.password1)){
            this.passRe = true;
            this.errorColor1 = false;
            console.log("this");
          }else{
            this.passRe = false;
            this.errorColor1 = true;
            console.log('that');
          }
        },
        judge(){
          this.substance=$('#substance').val();
          this.password1 = $('input[type="password"]')[0].value;
          this.password2 = $('input[type="password"]')[1].value;
          if(this.substance==''){
            this.showa();
            $(".btn_div").html("请输入私钥");
          }else{
            this.Lshow();
            if(this.password1==''){
              this.Lhide();
              this.showa();
              $(".btn_div").html("请输入密码");
            }else{
              if(this.password2==''){
                this.Lhide();
                this.showa();
                $(".btn_div").html("请重复输入密码");
              }else {
                if(this.show==false){
                  this.Lhide();
                  this.showa();
                  $(".btn_div").html("请阅读服务隐私条例");
                } else {
                  if(this.password1!=this.password2){
                    this.Lhide();
                    this.showa();
                    $(".btn_div").html("密码不一致");
                  }else {
                    var _this=this;
                    setTimeout(function () {

                      if (_this.passW.PasswordValidator.validatePassword(_this.password1).err != null){
                        _this.Lhide();
                        _this.showa();
                        $(".btn_div").html('密码长度大于8位');
                      } else {
                        var sys = localStorage.getItem('wallet_system');
                        if (sys == 'ETH') {
                          eth_reset();
                        } else if (sys = 'BTC') {
                          btc_reset();
                        }
                      }
                    },1000)
                  }
                }
              }
            }
          }
          function btc_reset() {
            _this.btcCommon.BtcWallet.importByPrivate(_this.password1, _this.substance, (err, wallet) =>{
//                    console.log(wallet)
              if(err){
                _this.Lhide();
                $ ('.btn_div').html(err).show ().delay (500).fadeOut ();
              }else{
                _this.Lhide();
                _this.showa();
                $(".btn_div").html('重置成功');
                _this.$store.commit("address",wallet.address);
                _this.$router.push({path:"/index"});
              }
            },null);
          }

          function eth_reset() {
            _this.common.Wallet.importPrivateKey(_this.password1, _this.substance, (err, wallet) =>{
//                    console.log(wallet)
              if(err){
                _this.Lhide();
                $ ('.btn_div').html(err).show ().delay (500).fadeOut ();
              }else{
                _this.Lhide();
                _this.showa();
                $(".btn_div").html('重置成功');
                _this.$store.commit("address",wallet.address);
                _this.$router.push({path:"/index"});
              }
            },null);
          }
        },
        Lshow(){
          this.$indicator.open();
        },
        Lhide(){
          this.$nextTick(()=>{             this.$indicator.close();           });
        }
      },
      mounted(){
        // 删除script后面所有的div;
        $("script").next("div").remove();
        this.Lhide();
        this.$store.commit("a",this.as);
      },

      computed:{
        removemodals(){
          return this.$store.state.removemodals
        },
        a(){
          return this.$store.state.a
        },
        showBt () {
          if(this.substance != '' && this.password1 != '' && this.password2 && this.show) {
            this.isDisabled = false;
            return true;
          }else {
            this.isDisabled = true;
            return false;
          }
        },
      },
      beforeRouteLeave(to, from, next) {
        from.meta.keepAlive = false;
        next();
      },
      components:{
        chooseSys,
      }
    }
</script>

<style scoped>
  /*表单*/
  .bd{ width:6.57rem; border-bottom:0.02rem solid rgba(107,121,156,1);  }
  .bd input{  margin-top: 0.2rem;  border: none; width: 100%;  line-height: 0.6rem;  padding: 0.1rem;  box-sizing: border-box; background-color: #2C3754;color:rgba(107,121,156,1); }
  input:-ms-input-placeholder{color:rgba(155,155,155,1);}/* Internet Explorer 10+ */
  input::-webkit-input-placeholder{color:rgba(155,155,155,1);}/* WebKit browsers */
  input::-moz-placeholder{color:rgba(155,155,155,1);}/* Mozilla Firefox 4 to 18 */
  input:-moz-placeholder{color:rgba(155,155,155,1);}/* Mozilla Firefox 19+ */


  .dh{  width: 0.44rem;  height: 0.44rem;  margin-top: 0.65rem;  }
  .bg{  background: url("../../../assets/common/img/icon_xuanze_pre.png")no-repeat; background-size:cover; }
  .bg1{  background: url("../../../assets/common/img/icon_xuanze.png")no-repeat; background-size:cover; }
  .divz{  width: 100%;text-align: center; margin-bottom: 0.6rem; }
  span{  font-size:0.26rem;margin: 0.7rem 0 0 0.1rem;  }
  .bt1{  width:5.9rem;  height:1rem;  background:linear-gradient(90deg,rgba(51,153,235,1) 0%,rgba(47,124,243,1) 100%);  border-radius:0.6rem;   margin-left:0.3rem;   display:block;  font-size:0.4rem;  font-family:PingFang-SC-Bold;  color:rgba(255,255,255,0.4);  border: none;  }
  .bt{  background:linear-gradient(90deg,rgba(51,153,235,1) 0%,rgba(47,124,243,1) 100%);   width:5.9rem;  height:1rem;  border-radius:0.6rem;   margin-left:0.3rem;    display:block;     font-size:0.4rem;  font-family:PingFang-SC-Bold;  color:rgba(255,255,255,1);  border: none; }
  .sr{  width: 6.7rem;  height: 3.14rem;  background:rgba(250,250,250,1); border-radius:0.08rem;
    border:0px solid rgba(239,239,239,1); line-height: 0.4rem;  margin-top: 0.54rem;    font-size: 0.28rem;color:rgba(164,164,164,1);padding: 0.28rem 0.31rem;}
  .pz{  text-align: left !important;  font-size:0.23rem;  font-family:PingFang-SC-Medium;  color:rgba(164,164,164,1);  line-height: 0.4rem;  }
  .pzs{  text-align: left !important;  font-size:0.23rem !important;  color:rgba(47,124,243,1);  margin-left: 0 !important;  line-height: 0.8rem;  }
  /*异常提醒*/
  .passRe {
    font-size: 0.20rem;
    color:rgba(216,216,216,1);
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
</style>
