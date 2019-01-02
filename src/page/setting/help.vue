<template>
  <div style="height: 100%;">
    <v-nav>帮助</v-nav>
    <div class="content_color cbg">
      <div class="setBox">
        <div class="setCon" @click="helpClick(0)">
          <span>{{question[0]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <div class="setCon" @click="helpClick(1)">
          <span>{{question[1]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <div class="setCon" @click="helpClick(2)">
          <span>{{question[2]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <div class="setCon" @click="helpClick(3)">
          <span>{{question[3]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <div class="setCon" @click="helpClick(4)">
          <span>{{question[4]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <div class="setCon" @click="helpClick(5)">
          <span>{{question[5]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <div class="setCon" @click="helpClick(6)">
          <span>{{question[6]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <div class="setCon" @click="helpClick(7)">
          <span>{{question[7]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <div class="setCon" @click="helpClick(8)">
          <span>{{question[8]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
        <div class="setCon" @click="helpClick(9)">
          <span>{{question[9]}}</span>
          <img src="../../assets/common/img/next@2x.png" alt="" class="img_right">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name:'',
        data() {
          return {
            question:[
              '如何导入钱包？',
              '如何备份钱包？',
              '为什么一定要备份助记词？',
              '如何删除钱包？',
              '如何使用ForYoung转账和收款？',
              '如何搜索和添加代币？',
              'ForYoung 都支持哪些代币？',
              '矿工费是什么？为什么我需要支付矿工费？',
              '如果ForYoung公司在经营上出现了问题，我的资产是安全的吗？',
              '转账时填错地址，怎么办？',
            ],
          }
        },
        methods:{
          helpClick(val){
            this.$router.push({
              path: '/help_answer',
              query:{
                question: this.question[val],
                index: val,
              }
            })
          }
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
    font-size:0.28rem;
    font-weight:600;
    color:rgba(48,48,48,1);
    position: relative;
    padding-right: 1rem;
    overflow:hidden;          /*超出部分隐藏*/
    white-space: nowrap;
    -ms-text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
  }
  .setCon:last-child{
    border-bottom: none;
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
