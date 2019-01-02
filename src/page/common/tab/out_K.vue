<template>
  <div>
    <div style="width: 6.7rem;
    height: 3.2rem;
    background: rgba(250,250,250,1);
    border: 0.01rem solid rgba(239,239,239,1);
    line-height: 0.5rem;overflow: auto"><p style="margin: .1rem;font-size: .3rem;">{{this.keystore}}</p></div>
    <!--<textarea class="sr" name="text" id="text" readonly="readonly">{{this.keystore}}</textarea>-->
    <!--<button class="k_but" @click="myCopy">复制 Keystore</button>-->
    <button class="btn_copy k_but" :data-clipboard-text="this.keystore" @click="copy_cli">复制 Keystore</button>


    <div class="btn_div btn_divs"></div>
  </div>
</template>

<script>
  import $ from 'jquery';
  import Clipboard from 'clipboard';
  export default{
    data(){
      return{
        as:false,
        keystore:''
      }
    },
    methods: {
      myCopy(){
        var ele = document.getElementById("text");//ele是要复制的元素的对象
        ele.focus();
        // ele.select();
        ele.setSelectionRange(0, ele.value.length);
        if(document.execCommand('copy', false, null)){
          //success info
          this.drawBarChart();
          $(".btn_div").html('已复制');
        } else{
          //fail info
          this.drawBarChart();
          $(".btn_div").html('复制失败');
        }
      },
      drawBarChart() {
        $ ('.btn_div').show ().delay (500).fadeOut ();
      },
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
    },
    mounted(){
      console.log(this.keystore);
      this.removemodals();
      this.$store.commit("a",this.as);
      this.keystore=localStorage.getItem('keystore_s')
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
    }
  }
</script>
<style scoped>
  .sr{ margin-top: 0.5rem;  width: 6.7rem;  height: 3.2rem;  background:rgba(250,250,250,1);  border:0.01rem solid rgba(239,239,239,1);  line-height: 0.5rem;  }
  .btn_divs{  top: 64%;  }
  .k_but{  width:5.9rem;  height:1rem;  color:rgba(255,255,255,1);  background:linear-gradient(90deg,rgba(51,153,235,1),rgba(47,124,243,1));  border-radius:0.6rem;  font-size:0.4rem;    margin: 2rem 0.35rem 1rem;  border: none;  }
</style>
