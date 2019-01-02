<template>
    <div style="background:rgba(246,246,247,1);overflow-x: hidden; height: 100%;">


        <v-nav>交易记录</v-nav>
        <!--头部结束-->

        <div class="content_color_l">
            <div class="box_div">
                <div>
                    <img class="lsdh" v-if="type" src="../../assets/common/img/icon_xiangdan@3x.png">
                    <img class="lsdh" v-else src="../../assets/common/img/icon_dabao@2x.png">
                    <p class="p_span"><span>{{value | ETH_recordFee}}</span><span>ETH</span></p>

                </div>

                <div class="box_div_2">
                    <div class="dashed_div">
                        <div>
                            <p>发款方</p>
                            <p>{{from}}</p>
                        </div>
                        <div>
                            <p>收款方</p>
                            <p>{{to}}</p>
                        </div>
                        <div>
                            <p>矿工费用</p>
                            <p>{{fee | ETH_fee}} ETH</p>
                        </div>
                    </div>
                </div>

                <div class="jyh_div">
                    <div class="dashed_div">
                        <div>
                            <p>交易号：</p>
                            <p>
                                <a class="b" :href="key">{{txid}}</a></p>
                        </div>
                        <div>
                            <p>区块</p>
                            <p>{{black_number}}</p>
                        </div>
                        <div>
                            <p>交易时间</p>
                            <p>{{create_time}}</p>
                        </div>
                    </div>

                </div>

                <div class="ewm_div">
                    <div class="dashed_div">
                        <div style="height: 0.5rem;width: 100%;"></div>
                        <div style="text-align: center;width: 100%;">
                            <div class="QRcode">
                                <qrcode
                                        :value="key"
                                        v-if="key"
                                        :options="{ size: this.size }">
                                </qrcode>
                            </div>
                        </div>
                        <button class="btn_copy url_b" :data-clipboard-text="this.key" @click="copy_cli">复制 URL</button>
                    </div>
                </div>
            </div>


            <div class="btn_div btn_divss"></div>
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
        address: '',
        to: '',
        from: '',
        size: 270,
        screenWidth: document.body.clientWidth,  // 这里是给到了一个默认值 （这个很重要）
        key: '',
        txid: '',
        value: '',
        comments: '',
        fee: '',
        create_time: '',
        black_number: '',
        type: '',
      };
    },
    components: {
      qrcode: QRcode,
    },
    methods: {
      back() {
        history.back();
      },
      showa() {
        $('.btn_div').show().delay(500).fadeOut();
      },
      copy_cli() {
        var clipboard = new Clipboard('.btn_copy');
        clipboard.on('success', (res) => {
          this.showa();
          $('.btn_div').html('已复制');
          // 释放内存
          clipboard.destroy();
        });
        clipboard.on('error', (err) => {
          this.showa();
          $('.btn_div').html('复制失败');
          // 释放内存
          clipboard.destroy();
        });
      },
    },
    created() {
      this.address = this.$route.query.address;
      this.txid = this.$route.query.txid;
      this.comments = this.$route.query.comments;
      this.value = this.$route.query.value;
      this.create_time = this.$route.query.create_time;
      this.to = this.$route.query.to;
      this.from = this.$route.query.from;
      this.fee = this.$route.query.fee;
      this.black_number = this.$route.query.black_number || 0;
      this.key = 'https://etherscan.io/tx/' + this.txid;
      this.type = this.$route.query.type;
    },
    mounted() {

      this.removemodals();

      window.onresize = () => {
        return (() => {
          window.screenWidth = document.body.clientWidth;
          this.screenWidth = window.screenWidth;
        })();
      };

    },
    computed: {
      removemodals() {
        return this.$store.state.removemodals;
      },

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
          }, 1);
        }
      },
    },
  };

</script>
<style scoped>
    .content_color_l {
        background-color: #2C3754;
        margin-top: 1.10rem;
        min-height: 12.24rem;
        padding-bottom: 0.2rem;
    }

    .box_div {
        width: 93%;
        background: rgba(255, 255, 255, 1);
        -webkit-box-shadow: 0rem 0rem 0.11rem 0rem rgba(240, 240, 240, 1);
        box-shadow: 0rem 0rem 0.11rem 0rem rgba(240, 240, 240, 1);
        border-radius: 0.17rem;
        margin: 0.25rem 0.25rem 0 0.25rem;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        position: relative;
    }

    .lsdh {
        width: 1.41rem;
        height: 1.41rem;
        margin: 0.6rem 2.9rem 0.3rem;
    }

    .p_span {
        text-align: center;
        margin-bottom: 0.2rem;
    }

    .p_span span:nth-child(1) {
        font-size: 0.62rem;
        color: rgba(0, 0, 0, 1);
        line-height: 0.87rem;
        padding: 0 .4rem;
    }

    .p_span span:nth-child(2) {
        font-size: 0.42rem;
        color: rgba(0, 0, 0, 1);
        line-height: 0.87rem;
    }

    .y_1 {
        left: -0.28rem;
        top: 3.2rem;
    }

    .y_2 {
        left: 6.74rem;
        top: 3.2rem;
    }

    .box_div_2 {
        width: 100%;
    }

    .dashed_div {
        width: 6rem;
        margin: 0 auto;
        border-top: 1px dashed rgba(215, 215, 215, 1);
    }

    .dashed_div div {
        margin: 0.2rem auto;
        line-height: 0.46rem;
    }

    .dashed_div div p:nth-child(1) {
        font-size: 0.3rem;
        color: rgba(155, 155, 155, 1);
    }

    .dashed_div div p:nth-child(2) {
        margin-top: 0.1rem;
        font-size: 0.3rem;
        color: rgba(74, 74, 74, 1);
    }

    .y_3 {
        left: -0.28rem;
        top: 8.5rem;
    }

    .y_4 {
        left: 6.74rem;
        top: 8.5rem;
    }

    .jyh_div {
        width: 100%;
    }

    .y_5 {
        left: -0.28rem;
        top: 12.7rem;
    }

    .y_6 {
        left: 6.74rem;
        top: 12.7rem;
    }

    /*.y_6{  left: 93%;  top: 65%;  }*/
    .ewm_div {
        width: 100%;
    }

    .ewm_img {
        width: 4.7rem;
        height: 4.69rem;
        margin: 0.5rem 0.7rem;
    }

    .url_b {
        width: 5.9rem;
        height: 1rem;
        background: rgba(47, 125, 243, 1);
        color: white;
        border-radius: 0.6rem;
        font-size: 0.4rem;
        border: none;
        margin-bottom: 0.5rem;
    }

    .btn_divss {
        top: 83%;
    }

    .yuan {
        position: absolute;
        width: 0.56rem;
        height: 0.54rem;
        background: #2C3754; /*background: black;*/
        border-radius: 50%;
    }
</style>
