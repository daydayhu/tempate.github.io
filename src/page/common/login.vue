<template>
    <div class="box">
        <div class="top_img"></div>
        <div class="top_tx">
            <p class="w p1">最懂你的钱包</p>
            <p class="w p2">更安全、更丰富、更便捷</p>
        </div>
      <div style="text-align: center;margin-top: 3.3rem">
        <button class="cj" @click="createW">创建钱包</button>
        <button class="dr" @click="importW">
          导入钱包
        </button>
      </div>

    </div>
</template>
<script>
    export default {
        data(){
            return {

            }
        },
        methods: {
          importW() {
            var type = localStorage.getItem('importType') || 'ETH';
            var sys = localStorage.getItem('wallet_system');
            this.$router.push({
              path:'/import',
              query:{
                type:type,
                wallet:'empty',
              }
            });
          },
          createW() {
            var type = localStorage.getItem('wallet_system') || 'ETH';

            this.$router.push({
              path:'/create',
              query:{
                type:type,
                wallet:'empty',
              }
            });
          }
        },
         mounted(){
          // alert(this.$route.query.oppenId);
          //  console.log(this.$route.query,'xxxxxxxxxxxxxx');
           this.removemodals();
        },
         computed:{
            removemodals(){
                return this.$store.state.removemodals;
            },
        }
    }
</script>
<style scoped>
    .box { width: 100%;height:100%;background-color: #374466; overflow: hidden;}
    .top_img{background: url("../../assets/common/img/iTunesArtwork.png") no-repeat; background-size:100% 100%; width: 2.54rem;  height: 2.16rem; margin: 1.34rem auto 0 auto;}
    .top_tx{text-align: center;}
    .p1{  font-size:0.42rem;  font-family:PingFangSC-Semibold;  color:rgba(255,255,255,1);  line-height:0.87rem;  padding: 0 0 0 0.21rem;  }
    .p2{ font-size:0.33rem;  font-family:PingFang-SC-Bold;  color:rgba(107,121,156,0.8);;  line-height:0.46rem; }
    button{font-size:0.4rem; color:rgba(255,255,255,1); border-radius:1rem;  width:5.9rem;
        height:1rem; border:none;}
    .cj{  background:linear-gradient(90deg,rgba(51,153,235,1) 0%,rgba(47,124,243,1) 60%);  }
    .dr{ margin-top: 0.5rem; border-radius:0.5rem;
      border:0.03rem solid rgba(91,105,140,1);font-size:0.36rem;
      font-weight:bold;
      color:rgba(97,110,145,1);
      line-height:0.50rem;
    background-color: #374466;}
</style>


