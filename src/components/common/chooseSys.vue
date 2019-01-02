<template>
    <div>
      <div class="bd">
        <input type="text" readonly placeholder="钱包生态体系" @click="choose_sys" v-model.trim="sys_text">
      </div>


      <div class="sys_bg" :class="{'show_sys':isShow}">
        <div class="sysBox">
          <p :class="{'selected': currencySys === CURRENCYSYS.ETH}" @click="change_sys(CURRENCYSYS.ETH)">ETH</p>
          <p :class="{'selected': currencySys === CURRENCYSYS.BTC}" @click="change_sys(CURRENCYSYS.BTC)">BTC</p>
        </div>
      </div>
    </div>
</template>

<script>
    export default {
        name: "chooseSys",
      data() {
          return {
            sys_text:'',
            isShow: true,
            currencySys:'ETH',
            CURRENCYSYS:{
              ETH:'ETH',
              BTC:'BTC',
            },

          }
      },
      methods : {
        choose_sys() {
          this.isShow = false;
        },
        change_sys(sys){
          this.sys_text = sys;
          this.currencySys = sys;
          this.isShow = true;
          this.$emit('changeSys',this.currencySys);
        },
      },
      mounted() {
        this.sys_text = this.$route.query.type;
      }
    }
</script>

<style scoped>
  .bd{  width:6.57rem;border-bottom:0.02rem solid rgba(107,121,156,1);  }
  .bd input{  margin-top: 0.2rem;  border: none; width: 100%;  line-height: 0.6rem;  padding: 0.1rem;  box-sizing: border-box;  background-color: #2C3754;font-size:0.3rem;font-weight:500;color:rgba(107,121,156,1); }
  input:-ms-input-placeholder{color:rgba(155,155,155,1);}/* Internet Explorer 10+ */
  input::-webkit-input-placeholder{color:rgba(155,155,155,1);}/* WebKit browsers */
  input::-moz-placeholder{color:rgba(155,155,155,1);}/* Mozilla Firefox 4 to 18 */
  input:-moz-placeholder{color:rgba(155,155,155,1);}/* Mozilla Firefox 19+ */
  .sys_bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.3);
  }
  .sysBox {
    width:6.79rem;
    height: 2.26rem;
    background:rgba(255,255,255,1);
    border-radius:0.14rem;
    position: absolute;
    bottom: 0.5rem;
    left: 0.34rem;
  }
  .sysBox p {
    width:6.79rem;
    height:1.13rem;
    line-height: 1.13rem;
    padding-left: 0.41rem;
    border-radius:0.14rem;
  }
  .sysBox p.selected {
    background:rgba(238,238,238,1);
  }
  .show_sys {
    display: none;
  }
</style>
