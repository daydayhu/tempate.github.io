<template>
  <div style="height: 100%">
    <v-nav>设置</v-nav>
    <div class="content_color cbg">
      <div class="setBox">
        <div class="setCon" @click="promptShow = true">
          <span>默认货币单位</span>
          <span class="text floatr">{{priceRateMark[priceRateType]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <router-link :to="{path: '/help'}" tag="div">
          <div class="setCon">
            <span>帮助</span>
            <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
          </div>
        </router-link>
        <router-link :to="{path: '/feedback'}" tag="div">
          <div class="setCon">
            <span>反馈</span>
            <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
          </div>
        </router-link>
         <router-link :to="{path: '/regulation',query:{type:'setting'}}" tag="div">
           <div class="setCon" style="border-bottom: none">
              <span>查看隐私协议</span>
              <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
           </div>
         </router-link>
      </div>

      <prompt :promptType="1" :selectList="[
          {
            name: priceRateMark['usd'],
            type: 'usd',
            checked: priceRateType === 'usd',
          }, {
            name: priceRateMark['cny'],
            type: 'cny',
            checked: priceRateType === 'cny',
          }]" v-show="promptShow" @maskcallback="selectPromptClose"
              @selectcb="changeType">
      </prompt>
    </div>
  </div>
</template>

<script>
    import prompt from '../../components/prompt/index'
    export default {
        name:'',
        data(){
          return {
            priceRateType: 'cny', //cny 人民币(默认) usd 美元
            lastRateType: '',
            priceRateMark: {cny:'人民币',usd:'美元'},
            promptShow: false,
            showRe: false,
          }
        },
        methods: {
          selectPromptClose() {
            this.promptShow = false;
          },
          changeType(item) {
            this.promptShow = false;
            this.lastRateType = this.priceRateType;
            this.priceRateType = item.type;
            if (this.lastRateType !== this.priceRateType) {
              localStorage.setItem('priceRateType',this.priceRateType);
            }
          },
        },
        mounted() {
          //TODO: 获取实体币类型
          this.priceRateType = localStorage.getItem('priceRateType') ? localStorage.getItem('priceRateType') : this.priceRateType;
        },
        components: {
          prompt,
        }
    };
</script>

<style scoped>
  .cbg {
    background: #F6F6F6;
  }
  .setBox {
    background-color: #ffffff;
    margin-top: 0.26rem;
  }
  .setCon {
    height: 1.2rem;
    border-bottom: 0.02rem solid #E6E6E6;
    margin-left: 0.4rem;
    margin-right: 0.4rem;
    line-height: 1.2rem;
    font-size:0.34rem;
    /*font-weight:500;*/
    font-weight:600;
    color:rgba(5,5,5,1);
    position: relative;

  }
  .setCon .text {
    margin-right: 0.38rem;
    color:rgba(155,155,155,1);
    font-size: 0.34rem;
  }
  .img_right {
    width: 0.16rem;
    height: 0.26rem;
    position: absolute;
    right: 0;
    top:50%;
    margin-top: -0.08rem;
  }

</style>
