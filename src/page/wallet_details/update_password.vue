<template>
  <div style="height: 100%;">
    <!--<v-nav>导入钱包</v-nav>-->
    <div class="top_nav">
      <div class="back_icon" @click="back"></div>
      <p>重置密码</p>
    </div>

    <div class="content_color">

      <ul>
        <li @click="tabSelect(CURRENCYTYPE.mnemonic)" :class="{'selected': currencyType === CURRENCYTYPE.mnemonic}">助记词</li>
        <li @click="tabSelect(CURRENCYTYPE.privateKey)" :class="{'selected': currencyType === CURRENCYTYPE.privateKey}">私钥</li>
      </ul>

      <div>
        <textarea class="sr" name="a" id="substance" :placeholder="plac[index]" v-model.trim="substance"></textarea>
        <!--<chooseSys></chooseSys>-->
        <!--<div class="bd" @click="promptShow =true"><input type="text" readonly placeholder="钱包生态体系" v-model.trim="selectType"></div>-->

        <div class="bd">
          <input type="password" placeholder="密码"  v-model.trim="password1" @focus="focus1" @blur="blur1" >
        </div>
        <p :class="[{'visibi':passRe},{'error-color':errorColor1}]" class="passRe">8-16位字符，建议混合使用大小写字母、数字和常用字符</p>
        <div class="bd">
          <input type="password" placeholder="重复密码" v-model.trim="password2">
        </div>
        <!--<div class="bd">-->
        <!--<input type="text" placeholder="密码提示 (可不填)">-->
        <!--</div>-->

        <div class="divz clear">
          <div class="dh float" @click="show=!show" :class="show?'bg':'bg1'"></div>
          <span class="float" style="color:rgba(107,121,156,1);">我已经仔细阅读并同意</span>
          <div @click="reg">
            <span class="float" style="color:rgba(107,121,156,1); text-decoration: underline">服务及隐私条款</span>
          </div>
        </div>
        <button id="btn" @click="judge" :class="showBt?'bt':'bt1'" :disabled="isDisabled">重置</button>
        <p class="des">当前钱包生态体系为 {{selectType}}</p>
        <div class="btn_div"></div>


  </div>
  </div>
    <regulations v-show="showRe" @showRegulation="showReg"></regulations>
    <prompt :promptType="1" :selectList="[
          {
            name: 'ETH',
            checked: selectType=='ETH',
          }, {
            name: 'BTC',
            checked: selectType=='BTC',
          }]" v-show="promptShow" @maskcallback="selectPromptClose"
            @selectcb="changeType"></prompt>

  </div>
</template>

<script>
  import $ from 'jquery';
  import $RN from '../../api/common/regExpVal'
  import prompt from '../../components/prompt';
  import regulations from  '../../components/common/regulation'

  export default {
    name: "chooseImport",
    data() {
      return {
        index: 0,
        CURRENCYTYPE:{
          mnemonic:'mnemonic',
          privateKey:'privateKey',
        },
        currencyType:'mnemonic',

        show:false,
        substance:'',
        password1:'',
        password2:'',
        as:true,
        passRe: true,
        errorColor1:false,
        isDisabled:true,

        plac:['助记词，以空格为单词间的区分','请输入明文私钥'],
        index: 0,
        promptShow: false,
        selectType: 'ETH',

        showRe: false,
      }
    },
    methods : {
      selectPromptClose() {
        this.promptShow = false;
      },
      changeType(item) {
        this.selectType = item.name;
        this.promptShow = false;
      },
      tabSelect(type) {
        this.currencyType = type;
        if(type === this.CURRENCYTYPE.mnemonic){
          this.index = 0;
        }else if(type === this.CURRENCYTYPE.privateKey){
          this.index = 1;
        }
      },

      back(){
        history.back();
      },
      reg(){
        this.showRe = true
      },
      showReg(val){
        this.showRe = val;
      },
      judge(){
        var _this = this;
        this.substance=$('#substance').val();
        this.password1 = $('input[type="password"]')[0].value;
        this.password2 = $('input[type="password"]')[1].value;

        if(_this.password1 != this.password2) {
          this.Lhide();
          this.showa();
          $(".btn_div").html("密码不一致");
        }else {

          setTimeout(function () {

            var sys = _this.$route.query.type;
            console.log(sys);
            if(sys === 'ETH'){
              switch (_this.currencyType) {
                case 'mnemonic':
                  _this.common.Wallet.importMnemonic(_this.password1, _this.substance,  (err, wallet)=> {
                    if(err){
                      _this.Lhide();
                      $ ('.btn_div').html(err).show ().delay (500).fadeOut ();
                    }else{
                      _this.$store.commit("address",wallet.address);
                      _this.$router.push({
                        path:"/warp",

                        query:{
                          type: 'ETH'
                        }
                      });
                    }
                  },null);
                  break;
                case 'privateKey':
                  _this.common.Wallet.importPrivateKey(_this.password1, _this.substance, (err, wallet) =>{
//                   console.log(wallet)
                    if(err){
                      _this.Lhide();
                      $ ('.btn_div').html(err).show ().delay (500).fadeOut ();
                    }else{
                      _this.$store.commit("address",wallet.address);
                      _this.$router.push({
                        path:"/warp",

                        query:{
                          type:'ETH',
                        }
                      });
                    }
                  },null);
                  break;
              }
            }else if(sys === 'BTC'){
              switch (_this.currencyType) {
                case 'mnemonic':
                  _this.btcCommon.BtcWallet.importByMnemonic(_this.password1, _this.substance,  (err, wallet)=> {
                    if(err){
                      _this.Lhide();
                      $ ('.btn_div').html(err).show ().delay (500).fadeOut ();
                    }else{
                      _this.$router.push({
                        path:"/warp",

                        query:{
                          type:'BTC',
                        }
                      });
                    }
                  },null);
                  break;
                case 'privateKey':
                  _this.btcCommon.BtcWallet.importByPrivate(_this.password1, _this.substance, (err, wallet) =>{
                    if(err){
                      _this.Lhide();
                      $ ('.btn_div').html(err).show ().delay (500).fadeOut ();
                    }else{
                      _this.$router.push({
                        path:"/warp",

                        query:{
                          type:'BTC',
                        }
                      });
                    }
                  },null);
              }
            }
          },null);
        }

      },
      focus1() {
        this.passRe = false;
        this.errorColor1 = false;
      },
      blur1() {
        if($RN.password.test(this.password1)){
          this.passRe = true;
          this.errorColor1 = false;
        }else{
          this.passRe = false;
          this.errorColor1 = true;
        }
      },
      showa(){
        $ ('.btn_div').show ().delay (500).fadeOut ();
      },
      Lshow(){
        this.$indicator.open();
      },
      Lhide(){
        this.$nextTick(()=>{             this.$indicator.close();           });
      },
    },
    watch:{

    },
    mounted(){
      // 删除script后面所有的div;
      $("script").next("div").remove();
      this.selectType = this.$route.query.type || 'ETH';
      this.Lhide();
    },
    computed:{
      removemodals(){
        return this.$store.state.removemodals
      },
      password(){
        return this.$store.state.password;
      },
      a(){
        return this.$store.state.a
      },
      showBt() {
        if(this.substance != '' && this.password1 != '' && this.password2 && this.show) {
          this.isDisabled = false;
          return true;
        }else {
          this.isDisabled = true;
          return false;
        }
      }
    },
    components: {
      prompt,
      regulations

    }
  }
</script>

<style scoped>
  .content_color{
    padding-left: 0.45rem;
    height: 100%;
  }
  ul {
    display: flex;
    justify-content: flex-start;
    font-size: 0.26rem;
    font-family:PingFang-SC-Medium;
    font-weight:500;
    color: rgba(107,121,156,1);
    line-height:0.37rem;
    margin-top: 0.5rem;
  }
  ul li{
    color: rgba(107,121,156,1);
    margin-right: 1.3rem;
  }
  .tab{
    display: flex;
    justify-content: flex-start;
    font-size: 0.26rem;
    font-family:PingFang-SC-Medium;
    font-weight:500;
    color: rgba(107,121,156,1);
    line-height:0.37rem;
    margin-top: 0.5rem;
  }
  ul li.selected {
    color:rgba(255,255,255,1);
    border-bottom: 0.06rem solid rgba(255,255,255,1);
    padding-bottom: 0.05rem;
  }
  .tab a{
    margin-right: 1.3rem;
  }
  .tab span{
    color: rgba(107,121,156,1);
    display: inline-block;
  }
  .hovers{
    color:rgba(255,255,255,1) !important;
    border-bottom: 0.06rem solid rgba(255,255,255,1);
    padding-bottom: 0.05rem;
  }
  .chovers{
    color:rgba(255,255,255,1) !important;
    border-bottom: 0.06rem solid rgba(255,255,255,1);
    padding-bottom: 0.05rem;
  }
  /*表单*/
  .bd{ width:6.57rem;border-bottom:0.02rem solid rgba(107,121,156,1);  }
  .bd input{  margin-top: 0.2rem;  border: none; width: 100%;  line-height:1.03rem;  padding: 0rem;  box-sizing: border-box;  background-color: #2C3754;font-size:0.3rem;font-weight:500;color:rgba(107,121,156,1); }
  input:-ms-input-placeholder{color:rgba(107,121,156,1);}/* Internet Explorer 10+ */
  input::-webkit-input-placeholder{color:rgba(107,121,156,1);}/* WebKit browsers */
  input::-moz-placeholder{color:rgba(107,121,156,1);}/* Mozilla Firefox 4 to 18 */
  input:-moz-placeholder{color:rgba(107,121,156,1);}/* Mozilla Firefox 19+ */

  .dh{  width: 0.44rem;  height: 0.44rem;  margin-top: 0.65rem;  }
  .bg{  background: url("../../assets/common/img/icon_y@2x.png")no-repeat; background-size:cover; }
  .bg1{  background: url("../../assets/common/img/icon_xuanze@2x.png")no-repeat;  background-size:cover;}

  .divz{  width: 100%;text-align: center; margin-bottom: 0.9rem; }
  span{  font-size:0.26rem;margin: 0.7rem 0 0 0.2rem;  }
  .bt1{  width:5.9rem;  height:1rem;  background:linear-gradient(90deg,rgba(51,153,235,1) 0%,rgba(47,124,243,1) 100%);  border-radius:0.6rem;  margin-left:0.3rem;  display:block;  font-size:0.4rem;  font-family:PingFang-SC-Bold;  color:rgba(255,255,255,0.4);  border: none;  }
  .bt{    background:linear-gradient(90deg,rgba(51,153,235,1) 0%,rgba(47,124,243,1) 100%);   width:5.9rem;  height:1rem;  border-radius:0.6rem;   margin-left:0.3rem;   display:block;     font-size:0.4rem;  font-family:PingFang-SC-Bold;  color:rgba(255,255,255,1);  border: none; }
  .sr{  width: 6.7rem;  height: 3.14rem;  background:rgba(250,250,250,1); border-radius:0.08rem;
    border:0px solid rgba(239,239,239,1); line-height: 0.4rem;  margin-top: 0.47rem;padding: 0.21rem 0.30rem;color:rgba(164,164,164,1);
    font-size: 0.28rem;}
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
  .des {
    font-size:0.32rem;
    width: 5.9rem;
    font-weight:500;
    color:rgba(102,115,150,1);
    line-height:0.45rem;

    margin-top: 0.23rem;
    margin-left: 0.3rem;
    text-align: center;
  }
</style>
