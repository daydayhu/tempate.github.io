<template>
    <div>
        <!--弹框开始-->
        <div class="modals">
            <div>
                <p>请确保已备份钱包至安全的地方 钱包 不承担任何钱包丢失、被盗、忘记密码等产生的资产损失</p>
            </div>
          <button type="button" class="close float" data-dismiss="modal" aria-label="Close" aria-hidden="true" style="opacity: 1">取消</button>
          <button @click="queren" style="margin-left: 0.12rem;">确认</button>

        </div>
        <!--弹框结束-->
    </div>
</template>

<script>
    import $ from 'jquery';
    export default {
        data(){
            return{

            }
        },
        methods:{
            queren(){
              var flag = localStorage.getItem('wallet_system');
              console.log(flag);
              switch (flag) {
                case 'ETH':
                  var wallet = this.common.Wallet.getCurrWallet();
                  wallet.delete();
                  if(this.common.Wallet.getCurrWallet()){
                    this.$router.push({path:"/ETH/index"});
                  }else {
                    if(this.btcCommon.BtcWallet.getCurrWallet()){
                      this.$router.push({path:"/BTC/index"});
                      localStorage.setItem('wallet_system','BTC');
                    }else{
                      this.$router.push({path:"/login"});
                    }
                  }
                  break;
                case 'BTC':
                  var wallet = this.btcCommon.BtcWallet.getCurrWallet();
                  wallet.delete();
                  if(this.btcCommon.BtcWallet.getCurrWallet()){
                    this.$router.push({path:"/BTC/index"});
                  }else {
                    if(this.common.Wallet.getCurrWallet()){
                      console.log(this.common.Wallet.getCurrWallet());
                      localStorage.setItem('wallet_system','ETH');
                      this.$router.push({path:"/ETH/index"});
                    }else{
                      this.$router.push({path:"/login"});
                    }
                  }
                  break;
                default:
                  this.$router.push({path:"/login"});
              }

                // var wallet = this.common.Wallet.getCurrWallet();
                // wallet.delete();
                //  if(this.common.Wallet.getCurrWallet()){
                //    var flag = localStorage.getItem('wallet_system');
                //    switch (flag) {
                //      case 'ETH':
                //        this.$router.push({path:"/ETH/index"});
                //        break;
                //      case 'BTC':
                //        this.$router.push({path:"/BTC/index"});
                //        break;
                //    }
                //  }else{
                //     this.$router.push({path:"/login"});
                //  }

            }

        },
        mounted(){
            this.removemodals();
        },
        computed:{
            removemodals(){
                return this.$store.state.removemodals
            }
        },
    }
</script>

<style scoped>
    /*弹框开始*/
    .m_divc{
      height: 4.67rem !important;
    }
    .modals div{  color:rgba(0,0,0,1);  }
    .modals div:nth-child(1){  font-size:0.3rem;  line-height:0.42rem; }
    .modals button{
      width:3rem;
      height:0.80rem;
      background:linear-gradient(90deg,rgba(51,153,235,1) 0%,rgba(47,124,243,1) 100%);
      border-radius:0.50rem;
      font-size:0.36rem;
      font-weight:500;
      color:rgba(255,255,255,1);
      line-height:0.8rem;
      border:none;
      margin-top: 0.05rem;
    }
    /*.modals button{  width:4.8rem;  height:0.8rem;  background:rgba(48,125,243,1);  border-radius:0.5rem;  margin: 0.3rem 0.3rem;  border: none;  font-size:0.36rem;  color:rgba(255,255,255,1);  }*/
    .buttons{  position: absolute;  z-index: 100000;  left: 50%;  top: 72%;  transform: translate(-50%,-50%);  background: none;  border: none;  }
    /*弹框结束*/

    @media screen and (max-width: 320px) {
        .modals div:nth-child(1){  margin: -0.2rem 0 0.2rem;  }
    }
    @media screen and (max-width: 768px) {
        .modals div:nth-child(1){  margin: 0 0.4rem 0.2rem;  }
        /*.modals button{ margin: 0.3rem 0.4rem; }*/

    }
</style>
