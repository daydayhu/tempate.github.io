<template>
    <div class="clear box">
      <div class="index"></div>
    </div>
</template>
<script>
    import $ from 'jquery';
    export default {
        data(){
            return{
                as:false,
                zjc: false,
            }
        },
        methods:{

        },
        mounted(){
            this.removemodals();
            this.$store.commit("a",this.as);
            this.$store.commit("back_zjc",this.zjc);
            var sys = localStorage.getItem('wallet_system') ? localStorage.getItem('wallet_system') : '';
            var _this=this;
            switch (sys) {
              case 'ETH':
                this.common.Wallet.getCurrWallet();
                setTimeout(function () {
                  _this.$router.push({path:"/index"});
                },2000);
                break;
              case 'BTC':
                this.btcCommon.BtcWallet.getCurrWallet();
                setTimeout(function () {
                  _this.$router.push({path:"/index"});
                },2000);
                break;
              default:
                setTimeout(function () {
                  _this.$router.push({path:"/login"});
                },2000);
                break;
            }
        },
        computed:{
            removemodals(){
                return this.$store.state.removemodals;
            },
            a(){
                return this.$store.state.a;
            }
        }
    }
</script>
<style scoped>
   .index {
     width: 100%;
     height: 13.34rem;
     background: url("../../assets/common/img/ios_qidongye_750_1334@2x.png") no-repeat;
     background-size: cover;
   }
</style>
