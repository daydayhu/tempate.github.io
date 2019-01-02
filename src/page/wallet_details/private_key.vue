<template>
  <div class="conHei">
    <div class="top_nav">
      <div class="back_icon" @click="back"></div>
      <p>导出私钥</p>
    </div>

    <div class="content_color">
      <div class="ns_div">
        <p style=" font-size: .28rem;color:rgba(216,216,216,1);">安全警告：私钥未经加密，导出存在风险，建议使用助记词和 Keystore 进行备份。</p>
        <!--<textarea class="sr" name="text" id="text" readonly="readonly">{{this.addsa}}</textarea>-->
        <div style="width: 6.57rem;
    height: 1.74rem;
    background:rgba(250,250,250,1);
border-radius:8px;
border:1px solid rgba(239,239,239,1);
color:rgba(155,155,155,1);
font-size: 0.28rem;
    line-height: 0.4rem;
    margin-top: 0.4rem;"><p style="margin: .1rem;font-size: .3rem;">{{this.addsa}}</p></div>
        <!--<button @click="myCopy">复制</button>-->
        <button class="btn_copy" :data-clipboard-text="this.addsa" @click="copy_cli">复制</button>
      </div>

      <div class="btn_div btn_divs"></div>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery';
  import Clipboard from 'clipboard';
  export default{
    data(){
      return{
        pass:'',
        addsa:''
      }
    },
    methods: {
      back() {
        history.back();
      },
      showa() {
        $ ('.btn_div').show ().delay (500).fadeOut ();
      },
      myCopy(){
        var ele = document.getElementById("text");//ele是要复制的元素的对象
        ele.focus();
        // ele.select();
        ele.setSelectionRange(0, ele.value.length);
        if(document.execCommand('copy', false, null)){
          //success info
          this.showa();
          $(".btn_div").html('已复制');
        } else{
          //fail info
          this.showa();
          $(".btn_div").html('复制失败');
        }
      },
      copy_cli() {
        var clipboard = new Clipboard('.btn_copy');
        clipboard.on('success', (res) => {
          this.showa();
          $(".btn_div").html('已复制');
          // 释放内存
          clipboard.destroy();
        });
        clipboard.on('error', (err) => {
          this.showa();
          $(".btn_div").html('复制失败');
//                    this.$util.$Toast('The browser does not support replication');
          // 释放内存
          clipboard.destroy();
        });
      }
    },
    mounted(){
      this.removemodals();
      this.addsa=localStorage.getItem('addsa_s')
    },
    computed:{
      removemodals(){
        return this.$store.state.removemodals;
      }
//            addsa(){
//                return this.$store.state.addsa;
//            }
    }

  }
</script>
<style scoped>
  .ns_div{  margin: 0.4rem auto; width: 6.5rem; }
  .sr{  width: 6.7rem;  height: 1.5rem;  background:rgba(250,250,250,1);  border:0.01rem solid rgba(239,239,239,1);  line-height: 0.5rem;  margin-top: 0.4rem;  }
  .btn_divs{  top: 65%;  }
  button{  width:5.9rem;  height:1rem;  color:rgba(255,255,255,1);
    background:linear-gradient(90deg,rgba(51,153,235,1),rgba(47,124,243,1));
    border-radius:0.6rem;  font-size:0.4rem;  margin: 0.55rem 0.35rem 1rem;  border: none;  color:rgba(255,255,255,1);}
</style>
