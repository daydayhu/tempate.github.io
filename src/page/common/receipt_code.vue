<template>
    <div style="background:rgba(246,246,247,1);overflow: hidden; height: 100%;">
        <!--头部开始-->
        <div class="top_nav">
            <div class="back_icon" @click="back"></div>
            <p>收款码</p>
        </div>
        <!--头部结束-->
        <div class="content_color">
            <div style="">
                <div class="erweima">
                    <div style="width: 100%;text-align: center;">
                        <div class="QRcode">
                            <qrcode
                                    :value="key"
                                    v-if="key"
                                    :options="{ size: this.size }">
                            </qrcode>
                        </div>
                    </div>
                    <div class="address">
                      {{address.slice(0,16)}}{{'...'}}{{address.slice(address.length-16,address.length)}}
                    </div>
                </div>
              <!--<div style="width:4.7rem;font-size: 0.24rem;color:rgba(59,62,73,1);line-height:0.33rem;margin:0.3rem auto 0 auto;padding-bottom: 0.55rem">{{this.address}}</div>-->
                <button class="btn_copy" :data-clipboard-text="this.address" @click="copy_cli">复制充值地址</button>
            </div>

            <div class="btn_div btn_divs"></div>
        </div>

    </div>
</template>
<script>
  import $ from 'jquery';
  import Clipboard from 'clipboard';
  import QRcode from '@xkeshi/vue-qrcode';

  export default {
    data() {
      return {
        as: false,
        size: 240,
        screenWidth: document.body.clientWidth,   // 这里是给到了一个默认值 （这个很重要）
        key: '',
        address: '',
      };
    },
    components: {
      qrcode: QRcode,
    },
    methods: {
      showa() {
        $('.btn_div').show().delay(500).fadeOut();
      },
      copy_cli() {
        var clipboard = new Clipboard('.btn_copy');
        clipboard.on('success', (res) => {
          this.showa();
          $('.btn_div').html('复制成功');
          // 释放内存
          clipboard.destroy();
        });
        clipboard.on('error', (err) => {
          this.showa();
          $('.btn_div').html('复制失败');
//                    this.$util.$Toast('The browser does not support replication');
          // 释放内存
          clipboard.destroy();
        });
      },
      back() {
        history.back();
      },
    },
    mounted() {
      this.removemodals();
      this.$store.commit('a', this.as);

      // TODO: 获取当前钱包地址
      this.key = this.address = this.$route.query.address;
      // this.address=localStorage.getItem("address_eth");
      // this.key=localStorage.getItem("address_eth");

      const that = this;
      window.onresize = () => {
        return (() => {
          window.screenWidth = document.body.clientWidth,
              that.screenWidth = window.screenWidth;
        })();
      };
    },
    computed: {
      removemodals() {
        return this.$store.state.removemodals;
      },
      a() {
        return this.$store.state.a;
      },
//            address(){
//                return this.$store.state.address;
//            },
//            balances(){
//                return this.$store.state.balances
//            },
//            symbols(){
//                return this.$store.state.symbols
//            }
    },
    watch: {
      screenWidth(val) {
        if (!this.timer) {
          this.screenWidth = val;
          this.timer = true;
          let that = this;
          setTimeout(function() {
            console.log(that.screenWidth);
            if (that.screenWidth <= 320) {
              that.size = 220;
            } else if (that.screenWidth <= 360) {
              that.size = 235;
            } else if (that.screenWidth <= 375) {
              that.size = 240;
            } else if (that.screenWidth <= 411) {
              that.size = 270;
            } else if (that.screenWidth <= 414) {
              that.size = 270;
            } else if (that.screenWidth <= 768) {
              that.size = 500;
            } else if (that.screenWidth <= 1024) {
              that.size = 680;
            }
            that.timer = false;
          });
        }
      },
    },
  };
</script>
<style scoped>
    .QRcode {
        width: 100%;
        padding-top: 0.85rem;
    }

    .btn_divs {
        top: 60% !important;
    }

    .erweima {
        width: 6.24rem;
        background: rgba(255, 255, 255, 1);
        border-radius: 0.17rem;
        margin: 0.5rem 0.65rem;
    }

    .erweima textarea {
        padding: 0.5rem 0.8rem;
        text-align: left;
        font-size: 0.24rem;
        color: rgba(155, 155, 155, 1);
        line-height: 0.33rem;
        border: none;
        width: 100%;
    }

    button {
        width: 6rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1), rgba(47, 124, 243, 1));
        border-radius: 0.6rem;
        border: none;
        font-size: 0.4rem;
        color: rgba(255, 255, 255, 1);
        margin: 0.5rem auto;
        display: block;
    }

    .address {
        font-size: 0.24rem;
        color: rgba(59, 62, 73, 1);
        line-height: 0.33rem;
        padding-bottom: 0.5rem;
        overflow: hidden;
        white-space: nowrap;
        text-align: center;
        margin-top: 0.3rem;
    }

    /*@media screen and (max-width: 320px) {*/
    /*.erweima{  height:8.12rem; }*/
    /*.QRcode{height: 6rem;}*/
    /*}*/
</style>



