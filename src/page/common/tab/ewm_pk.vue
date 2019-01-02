<template>
  <div>
    <div class="ewm_pk QRcode">
      <qrcode
        :value="keystore"
        v-if="keystore"
        :options="{ size: this.size }">
      </qrcode>
    </div>
  </div>
</template>
<script>
  import $ from 'jquery';
  import QRcode from '@xkeshi/vue-qrcode';
  export default{
    data(){
      return{
        as:false,
        size:260,
        keystore:'',
        screenWidth: document.body.clientWidth,   // 这里是给到了一个默认值 （这个很重要）
        key: ''
      }
    },
    components: {
      qrcode: QRcode
    },
    methods: {

    },
    mounted(){
      this.removemodals();
      this.key=this.keystore;
      this.$store.commit("a",this.as);

      this.keystore=localStorage.getItem('keystore_s')
      const that = this;
      window.onresize = () => {
        return (() => {
          window.screenWidth = document.body.clientWidth;
          that.screenWidth = window.screenWidth
        })()
      }
    },
    computed:{
      username(){
        return this.$store.state.username;
      },
      removemodals(){
        return this.$store.state.removemodals;
      },
      a(){
        return this.$store.state.a;
      }
    },
    watch: {
      screenWidth (val) {
        if (!this.timer) {
          this.screenWidth = val
          this.timer = true
          let that = this
          setTimeout(function () {
            console.log(that.screenWidth);
            if(that.screenWidth<=320){
              that.size=220
            } else if(that.screenWidth<=360){
              that.size=235
            }  else if(that.screenWidth<=375){
              that.size=240
            }else if(that.screenWidth<=411){
              that.size=270
            }else if(that.screenWidth<=414){
              that.size=270
            }else if(that.screenWidth<=768){
              that.size=500
            }else if(that.screenWidth<=1024){
              that.size=680
            }
            that.timer = false
          })
        }
      }
    }
  }
</script>
<style scoped>
  .ewm_pk{  width:6.24rem;  height:6.31rem;  margin: 0.79rem auto;}
  .QRcode{width: 100%; text-align: center;}
</style>
