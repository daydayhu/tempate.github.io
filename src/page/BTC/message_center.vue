<template>

    <div style="width: 100%;">
        <!--头部-->
      <div class="top_nav">
        <div class="back_icon" @click="back"></div>
        <p>消息中心</p>
      </div>
      <div class="content_color">
        <div style="background:rgba(246,246,247,1);overflow: scroll;"
             ref="wrapper"
             :style="{ height: wrapperHeight + 'px' }">
            <v-loadmore :top-method="loadTop"
                        @translate-change="translateChange"
                        @top-status-change="handleTopChange"
                        :bottom-method="loadBottom"
                        @bottom-status-change="handleBottomChange"
                        :bottom-all-loaded="allLoaded"
                        ref="loadmore" :autoFill="false">
                <p class="noMessage" v-show="!data.length && topStatus !== 'loading'">没有新消息</p>
                <div class="noticeContainer" :style="{ minHeight: wrapperHeight - 65 + 'px' }">
                  <div class="box_html" style="padding: 0.2rem;" v-for="(item,index) in data">
                    <div class="divinp clear">
                      <div class="div_L float">
                        <p>[{{item.type === 'Send' ? '转账':'收款'}}] {{item.value | formatNum}} {{item.assetType}}</p>
                      </div>
                      <div class="div_r">{{item.time | dateFormat}} </div>
                      <div class="div_t">hash:{{item.hash}}</div>
                    </div>
                  </div>
                </div>
                <div slot="top" class="mint-loadmore-top">
                    <span v-show="topStatus === 'loading'">
                          <span>
                                <div class="mint_span mint-spinner-snake" style="border-top-color: rgb(204, 204, 204);
                                    border-left-color: rgb(204, 204, 204);
                                    border-bottom-color: rgb(204, 204, 204);
                                    height: .6rem !important;
                                    width: .6rem !important;"></div>
                          </span>
                    </span>
                </div>
                <div slot="bottom" class="mint-loadmore-bottom">
                    <span v-show="bottomStatus === 'loading'">
                      <div>没有更多了</div>
                         <!--<span>-->
                           <!--<div class="mint_span mint-spinner-snake" style="border-top-color: rgb(204, 204, 204);-->
                                    <!--border-left-color: rgb(204, 204, 204);-->
                                    <!--border-bottom-color: rgb(204, 204, 204);-->
                                    <!--height: .6rem !important;-->
                                    <!--width: .6rem !important;"></div>-->
                         <!--</span>-->
                    </span>
                    <!--<span v-show="bottomStatus === 'drop'">-->
                           <!--<div>没有更多了</div>-->
                    <!--</span>-->
                </div>
            </v-loadmore>
        </div>
      </div>
    </div>
</template>
<script>
    import $ from 'jquery';
    import {Loadmore} from 'mint-ui';
    import CreateDB from '../../api/indexDB';
    export default {
        data(){
            return{
                as:false,
                data:[],
                pageNo:'0',
                dizhi:'',

                allLoaded: true,
                scrollMode: 'auto',
                loading:false,
                bottomStatus: '',
                wrapperHeight: 0,
                topStatus: '',
                translate: 0,

                btcDB: null
            }
        },
        components: {
            'v-loadmore':Loadmore
        },
        methods: {
            createDB() {
              // TODO: 数据库创建
              this.btcDB = new CreateDB();
              this.btcDB.openDB({name:'btcSystemNotice',keyPath:'id',status:'readwrite'},(data) => {
                console.log('当前数据集合',data);
                this.data = data;
                if (this.data.length > 5) {
                  this.allLoaded = false;
                }
              });
            },
            loadTop:function(){
                var that = this;
                console.log('执行刷新.............................');
                setTimeout(()=>{
                    that.loadPageList();
                    that.$refs.loadmore.onTopLoaded()
                },1500)
            },
            loadBottom:function(){
                var that = this;
                setTimeout(()=>{
                    that.more();
                    that.$refs.loadmore.onBottomLoaded()
                },1000)
            },
            loadPageList:function(){
              console.log('首次加载................................');
              this.createDB();

            },
            more:function(){
              console.log('加载更多.............................');

            },
            handleTopChange(status){
              /*
              *  pull：如果组件被拉动但尚未准备好掉落（顶部距离在定义的距离阈值内topDistance）
              *  drop：如果组件准备好掉线
              *  loading：if topMethod正在运行每次状态更改时，名为top-status-change fire 的事件都会触发，其中的参数指示组件的当前状态。因此，您可以使用handleTopChange方法处理此更改，就像上面的示例所示。
              * */

                console.log('状态————————',status);
                this.topStatus = status
            },
            translateChange(translate){
                // translate 记录下拉偏移量
                // console.log('translate-------',translate);
            },
            handleBottomChange(status){
                this.bottomStatus = status
            },
            back() {
              history.back();
            }
        },
        mounted(){
            this.removemodals();
            this.$store.commit("a",this.as);
            $('.mint_span').addClass('mint_span_div');
            this.loadPageList();
            this.wrapperHeight = document.documentElement.clientHeight - this.$refs.wrapper.getBoundingClientRect().top
        },
        filters:{
          dateFormat: function(value, type, joint = '-') {
            function addZero(val) {
              return val < 10 ? '0' + val : val;
            }
            let data = new Date();
            data.setTime(value * 1000);
            let year = data.getFullYear();
            let month = addZero(data.getMonth() + 1);
            let day = addZero(data.getDate());
            let hour = addZero(data.getHours());
            let minute = addZero(data.getMinutes());
            let second = addZero(data.getSeconds());
            return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
          },
          formatNum(num){
            num = num * 1.0/ 100000000;
            return Number(parseFloat(num).toFixed(5).slice(0,-1));
          },
        },
        computed:{
            removemodals(){
                return this.$store.state.removemodals
            },
            a(){
                return this.$store.state.a;
            }
        },
    }
</script>
<style scoped>
    .noMessage{
        text-align: center;
        font-size: 0.3rem;
        margin-top: 1.42rem;
    }
    .box_html{width: 100%;}
    .divinp{  width:7rem;  height:1.4rem;  background:rgba(255,255,255,1);  box-shadow:0rem 0rem 0.11rem 0rem rgba(240,240,240,1);  border-radius:0.17rem;}
    .div_L{margin: 0.3rem 0 0 0.3rem;}
    .div_L > p{  font-size:0.24rem;  font-weight:bold; color:rgba(74,74,74,1);  line-height:0.5rem; height:0.5rem }
    .div_r{
      float: right;
      margin: 0.3rem 0.2rem 0 0;
      height: 0.5rem;
      line-height:0.5rem;
      font-size:0.22rem;
      color:rgba(155,155,155,1);
    }
    .div_t {
      float: left;
      font-size:0.22rem;
      margin: 0.1rem 0 0 0.3rem;
      color:rgba(155,155,155,1);
      /*line-height:0.42rem;*/
      width: 6rem;  /*必须设置宽度*/
      overflow: hidden;  /*溢出隐藏*/
      text-overflow: ellipsis; /*以省略号...显示*/
      white-space: nowrap;  /*强制不换行*/
    }
    .mint-loadmore-top{  margin-top: -0.9rem;  margin-bottom: 0.1rem;  }
    .mint-loadmore-top span{display: inline-block; vertical-align: middle;text-align:center;-webkit-transition: .2s linear;transition: .2s linear;}
    .mint-loadmore-top .is-rotate{-webkit-transform: rotate(180deg);transform: rotate(180deg)}
    .mint-loadmore-bottom {  margin-bottom: -0.4rem;  }
    .mint-loadmore-bottom span{display: inline-block;-webkit-transition: .2s linear;transition: .2s linear;vertical-align: middle;}
    .mint-loadmore-bottom .is-rotate{-webkit-transform: rotate(180deg);transform: rotate(180deg);}
    .mint-loadmore-top span{  font-size: .5rem;  margin-top: -0.2rem;}
    .mint_span_div {
        margin-top: .2rem;
        -webkit-animation: mint-spinner-rotate 0.8s infinite linear;
        animation: mint-spinner-rotate 0.8s infinite linear;
        border:  .08rem solid transparent;
        border-radius: 50%;
    }

    @media screen and (min-width: 768px) {
        .mint-loadmore-top {    margin-top: .1rem;}
        .mint_span_div {
            border:  8px solid transparent;
        }
        .mint-loadmore-bottom {
            margin-bottom: 1rem;
        }
    }


</style>
