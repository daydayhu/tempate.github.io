<template>
  <div style="height: 100%">
    <v-nav>反馈</v-nav>
    <div class="content_color cbg">
      <div class="fankui">
        <span class="img_gou"></span>
        <p>ForYoung平台的官方邮箱为：</p>
        <p style="color:rgba(155,155,155,1);">xxxxxxx@outlook.com <br>请发送邮件联系我们</p>
      </div>
      <div class="fankui">
        <span class="img_gou"></span>
        <p>请详细描述遇到的问题</p>
        <p style="color:rgba(155,155,155,1);">提供与问题有关的信息，必要时配图说明</p>
      </div>
      <div class="fankui">
        <span class="img_gou"></span>
        <p>为了您的资产安全</p>
        <p style="color:rgba(155,155,155,1);">切勿向我们提交助记词、Keystore或私钥！长时间没有收到回复请检查一下垃圾邮箱</p>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: "feedback"
    }
</script>

<style scoped>
  .cbg {
    background: #ffffff;
  }
  .fankui {
    font-size:0.28rem;
    font-weight:600;
    color:rgba(48,48,48,1);
    line-height:0.40rem;

    padding-left: 1.3rem;
    padding-right: 0.84rem;
    margin-top: 0.63rem;
    position: relative;
  }
  .img_gou {
    width: 0.44rem;
    height: 0.44rem;
    position: absolute;
    left: 0.39rem;
    top: 0;
    background: url("../../assets/common/img/icon_xuanze_gou@2x.png") no-repeat center center;
    background-size: contain;
  }
</style>
