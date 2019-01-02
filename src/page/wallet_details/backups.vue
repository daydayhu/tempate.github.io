<template>
    <div style="height: 100%;">
        <!--头部开始-->
        <div class="top_nav">
            <!--<router-link :to="{path: '/wallet_details',query:{type: this.$route.query.type}}">-->
            <!--<div class="back_icon"></div>-->
            <!--</router-link>-->
            <!--<p>备份助记词</p>-->

            <div class="back_icon" @click="back"></div>
            <p>备份助记词</p>

        </div>
        <!--头部结束-->
        <div class="content_color">
            <div class="ns_div">
                <p class="cx_p">请抄写下你的钱包助记词</p>
                <p class="zjc_p">助记词用于恢复钱包或重置钱包密码，将它准确的抄写到纸上，并存放在只有你知道的安全的地方。</p>
                <!--<textarea class="sr no-touch" name="a" readonly @touchstart.native="forbbit">{{this.backups}}</textarea>-->
              <p class="sr" name="a">{{this.backups}}</p>
                <router-link :to="{path:'/backups_ok',query:{type: this.$route.query.type, backups_text: backups}}">
                    <button>下一步</button>
                </router-link>
            </div>
        </div>
        <prompt :promptType="4" @maskcallback="maskcallback" v-if="promptShow"></prompt>
    </div>
</template>
<script>
  import prompt from '../../components/prompt';

  export default {
    data() {
      return {
        backups: '',
        promptShow: true,
      };
    },
    components: {
      prompt,
    },
    methods: {
      maskcallback() {
        this.promptShow = false;
      },
      back() {
        history.back();
      },
    },
    mounted() {
      this.$nextTick(()=>{             this.$indicator.close();           });
      // this.backups = localStorage.getItem('backups_s');
      this.backups = this.$route.query.backups_text;
    },
  };
</script>
<style scoped>
  
    .ns_div {
        margin: 0.4rem auto;
        width: 6.5rem;
    }

    .cx_p {
        font-size: 0.32rem;
        color: rgba(203, 204, 206, 1);
        line-height: 0.8rem;
    }

    .zjc_p {
        font-size: 0.23rem;
        color: rgba(107, 121, 156, 1);
        line-height: 0.32rem;
    }

    .sr {
        width: 6.57rem;
        height: 2.1rem;
        margin-top: 0.25rem;
        background: rgba(250, 250, 250, 1);
        border: 0.01rem solid rgba(239, 239, 239, 1);
        line-height: 0.4rem;
        font-size: 0.28rem;
        color: rgba(102, 102, 102, 1);
        border-radius:0.08rem;
        padding: 0.2rem 0.24rem;
    }

    button {
        width: 5.9rem;
        height: 1rem;
        border-radius: 0.6rem;
        font-size: 0.4rem;
        color: rgba(255, 255, 255, 1);
        background: linear-gradient(90deg, rgba(51, 153, 235, 1), rgba(47, 124, 243, 1));
        margin: 0.36rem 0.35rem 1rem;
        border: none;
    }

    /*显示隐藏*/
    .modal_diva {
        position: absolute;
    }

    .a {
        display: none
    }

    .b {
        width: 7.5rem;
        height: 16.34rem;
        background: rgba(0, 0, 0, 0.43);
        display: none;
        margin-top: -40%;
    }

    .cc {
        display: block;
    }
</style>
