<template>
    <div style="height: 100%;">
        <div class="top_nav">
            <p>你需要先备份</p>
        </div>

        <div class="content_color_2">
            <div class="text">
                <p>
                    1.钱包是您的区块链账户，与网站/应用账户完全不同，请您谨慎对待。 <br>
                    2.未免造成资产损失，您需要仔细检查钱包是否正确备份。<br>
                    3.我们建议您备份助记词和Keystore，这将直接关乎您的资产安全，请安全备份。
                </p>
            </div>
            <div>
                <div class="methods">
                    <img src="../../assets/common/img/icon_zhujici@2x.png" alt="">
                    <p class="zjc">助记词</p>
                    <p class="des">用于恢复钱包，请物理存储。</p>
                </div>
                <div class="methods">
                    <img src="../../assets/common/img/icon_miyao@2x.png" alt="">
                    <p class="zjc">Keystore</p>
                    <p class="des">用于加密您的交易密码，请记住它。</p>
                </div>
            </div>
            <button @click="backups">立即备份</button>
            <button class="del" @click="backLater">稍后备份</button>
        </div>
    </div>
</template>

<script>

  export default {
    name: 'back_warn',
    data() {
      return {};
    },
    methods: {
      backups() {
        this.$router.push({
          path: '/wallet_details',
          query: {
            type: this.$route.query.type,
            mnemonic:true,
          },
        });
      },
      backLater() {
        console.log(this.$route.query.type);
        this.$router.push({
          path: '/warp',

          query: {
            type: this.$route.query.type,
          },
        });
      },
    },
    created() {
      this.$nextTick(()=>{             this.$indicator.close();           });
    },
  };
</script>

<style scoped>
    .content_color_2 {
        background-color: #1F283E;
        /*margin-top: 1.10rem;*/
        padding-top: 1.10rem;
        height: 100%;
        overflow: hidden;
    }

    .text {
        height: 3.61rem;
        font-size: 0.28rem;
        font-weight: bold;
        color: rgba(162, 171, 196, 1);
        line-height: 0.33rem;
        padding: 0.96rem 0.48rem 0 0.48rem;
        background: rgba(44, 55, 84, 1);
        box-sizing: border-box;
    }

    .methods {
        height: 1rem;
        margin-left: 0.39rem;
        margin-top: 0.56rem;
    }

    .methods .zjc {
        font-size: 0.32rem;
        font-weight: 600;
        color: rgba(216, 216, 216, 1);
        line-height: 0.45rem;
    }

    .methods .des {
        font-size: 0.28rem;
        font-weight: bold;
        color: rgba(107, 121, 156, 1);
        line-height: 0.30rem;
    }

    .methods img {
        float: left;
        width: 0.8rem;
        height: 0.8rem;
        margin-right: 0.24rem;
    }

    button {
        width: 5.9rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1), rgba(47, 124, 243, 1));
        border-radius: 0.6rem;
        font-size: 0.4rem;
        color: rgba(255, 255, 255, 1);
        margin: 0.8rem 0.8rem 0rem 0.8rem;
        border: none;
    }

    button.del {
        border: 0.03rem solid rgba(97, 110, 145, 1);
        background: #2C3754;
        color: rgba(97, 110, 145, 1);
        margin: 0.34rem 0.8rem 0 0.8rem;
    }
</style>
