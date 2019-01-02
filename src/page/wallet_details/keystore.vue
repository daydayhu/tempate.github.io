<template>

  <div style="height: 100%;">
   <v-nav>导出 keystore</v-nav>
   <!-- <div class="top_nav">
      <div class="back_icon" @click="back"></div>
      <p>导出 keystore</p>
    </div>-->

    <div class="content_color">
      <div class="ns_div">
        <div>
          <ul id="nav" class="clear">
            <li :class="{'selected' : curr === 'keystore'}" @click="change('keystore')">Keystore 文件</li>
            <li :class="{'selected' : curr === 'erweima'}" @click="change('erweima')">二维码</li>
          </ul>

          <div v-show="curr === 'keystore'">
            <div class="con">{{this.keystore}}</div>
            <!--<textarea class="sr" name="text" id="text" readonly="readonly">{{this.keystore}}</textarea>-->
            <!--<button class="k_but" @click="myCopy">复制 Keystore</button>-->
            <button class="btn_copy k_but" :data-clipboard-text="this.keystore" @click="copy_cli">复制 Keystore</button>


            <div class="btn_div btn_divs"></div>
          </div>

          <div v-show="curr === 'erweima'">

            <div class="ewm_pk QRcode">
              <qrcode
                :value="keystore"
                v-if="keystore"
                :options="{ size: this.size }">
              </qrcode>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
  import $ from 'jquery';
  import Clipboard from 'clipboard';
  import QRcode from '@xkeshi/vue-qrcode';
  export default{
    data(){
      return{
        keystore:'',
        curr:'keystore',
        size:240,
        screenWidth: document.body.clientWidth,   // 这里是给到了一个默认值 （这个很重要）
        key: ''
      }
    },
    methods: {
      copy_cli() {
        var clipboard = new Clipboard('.btn_copy');
        clipboard.on('success', (res) => {
          this.drawBarChart();
          $(".btn_div").html('已复制');
          // 释放内存
          clipboard.destroy();
        });
        clipboard.on('error', (err) => {
          this.drawBarChart();
          $(".btn_div").html('复制失败');
//                    this.$util.$Toast('The browser does not support replication');
          // 释放内存
          clipboard.destroy();
        });
      },
      drawBarChart() {
        $ ('.btn_div').show ().delay (500).fadeOut ();
      },
      change(type){
        this.curr = type;
      },
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
      removemodals(){
        return this.$store.state.removemodals;
      }
    },
    components: {
      qrcode: QRcode
    },
    watch: {
      screenWidth (val) {
        if (!this.timer) {
          this.screenWidth = val;
          this.timer = true;
          let that = this;
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
  .ns_div{  margin: 0.2rem auto; width: 6.5rem; }
  #nav{height: 1rem;  margin: 0 1rem  0.3rem 0rem;}
  #nav li{display:block;height:0.7rem;text-decoration:none;  line-height:0.8rem;margin:0 0.5rem;font-size:0.26rem;text-align:left;   float:left;cursor:pointer; color:rgba(107,121,156,1);}
  #nav li:nth-child(1){  margin:0 0.5rem 0 0 !important; ;  }
  .selected {
    border-bottom: 0.06rem solid rgba(255,255,255,1);
    color: #fff;
  }
  .con {
    width: 6.7rem;
    height: 3.2rem;
    background: rgba(250,250,250,1);
    border: 1px solid rgba(239,239,239,1);
    border-radius: 0.08rem;
    line-height: 0.5rem;
    overflow: auto;
    padding: 0.18rem 0.25rem 0.6rem 0.25rem;
    color: #9B9B9B;
    font-size: 0.28rem;
    text-align: left;
  }

  .ewm_pk{  width:6.24rem;  height:6.31rem;  margin: 0 auto 0;}
  .QRcode{width: 100%; text-align: center;}
  .QRcode canvas{
      padding: 0.47rem;
      background: #fff;
      border-radius: 0.17rem;
  }

  .sr{ margin-top: 0.5rem;  width: 6.7rem;  height: 3.2rem;  background:rgba(250,250,250,1);  border:0.01rem solid rgba(239,239,239,1);  line-height: 0.5rem;  }
  .btn_divs{  top: 64%;  }
  .k_but{  width:5.9rem;  height:1rem;  color:rgba(255,255,255,1);  background:linear-gradient(90deg,rgba(51,153,235,1),rgba(47,124,243,1));  border-radius:0.6rem;  font-size:0.4rem;    margin: 0.6rem 0.35rem 1rem;  border: none;  }
</style>
