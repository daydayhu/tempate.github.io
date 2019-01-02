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
                        ref="loadmore" :autoFill="false" >

                    <p class="noMessage" v-show="!noticeList.length && topStatus !== 'loading'">没有新消息</p>
                    <div class="noticeContainer" :style="{ minHeight: wrapperHeight - 65 + 'px' }">
                      <div class="box_html" style="padding: 0.2rem;" v-for="(item,index) in noticeList" @click="toTransferInfo(item)">
                        <div class="divinp clear">
                          <div class="div_L float">
                            <p><span class="readIcon" v-if="!item.readStatus"></span>[{{item.type === 'Send' ? '转账':'收款'}}] {{item.value | formatNum}} {{item.assetType}}</p>
                          </div>
                          <!--TODO:增加type类型判断-->
                          <!--
                              1.区分时间格式 统一
                              2.区分hash与txid  BTC:hash  ETH:txid   txid是整个交易的哈希值
                              3.金额的区分 ETH与其代币是一类  BTC/USDT 是一类
                          -->
                          <div class="div_r">{{item.time | dateFormat}}</div>
                          <div class="div_t">交易ID: {{item.txid}}</div>
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

                noticeDB: null,
                as:false,
                noticeList:[],
                pageNo:'0',
                dizhi:'',

                allLoaded: true,
                scrollMode: 'auto',
                loading:false,
                bottomStatus: '',
                wrapperHeight: 0,
                topStatus: '',
                translate: 0,

                eth_wallets: null,
                addrSet: [],
                addrNum: 0
            }
        },
        components: {
            'v-loadmore':Loadmore
        },
        methods:{
            readAll:function(){
              this.eth_wallets = JSON.parse(localStorage.getItem('eth_wallets'));
              this.eth_wallets.forEach((value) => {
                if (value.address) { this.addrSet.push(value.address); }
              });
              this.readSingleAddr();
            },
            readSingleAddr: function() {
              this.$ethServerApi.msgReaded(this.addrSet[this.addrNum],(res) => {
                if (res.status_code === 200) {
                  this.addrNum++;
                  if (this.addrNum < this.addrSet.length) {
                    this.readSingleAddr();
                  }else {
                    return false;
                  }
                }
              });
            },
            createDB() {
              // TODO: 数据库创建
              this.noticeDB = new CreateDB();
              this.noticeDB.openDB({name:'SystemNotice',keyPath:'id',status:'readwrite'},(data) => {
                console.log('当前数据集合',data);
                this.noticeList = data;
                if (this.noticeList.length > 5) {
                  this.allLoaded = false;
                }
              });
            },

            loadTop: function(){
                var that = this;
                setTimeout(()=>{
                    that.loadPageList();
                    that.$refs.loadmore.onTopLoaded()
                },1500)
            },

            loadBottom: function(){
                var that = this;
                setTimeout(()=>{
                    that.more();
                    that.$refs.loadmore.onBottomLoaded()
                },1000)
            },

            loadPageList: function(){
                this.createDB();
            },
            more: function(){
              console.log('加载更多.............................');
            },
            handleTopChange(status){
                this.topStatus = status
            },
            translateChange(translate){
              // translate 记录下拉偏移量
              // console.log('translate-------',translate);
            },
            handleBottomChange(status){
                this.bottomStatus = status
            },

            toTransferInfo(item) {
              // TODO: 变更可读状态
              item.readStatus = true;
              setTimeout(()=>{
                this.noticeDB.update(item.id,item);
              },300);

              // TODO: 路由跳转 record
              /*
              * 区分跳转ETH/BTC
              *
              * */
              console.log('item.assetType',item.assetType);
              switch (item.assetType) {
                case "USDT":
                case "BTC":
                  this.$router.push({
                    path: '/BTC/record',
                    query: {
                      value: item.value,
                      txid: item.txid,
                      time: item.time,
                      status: 1,  // === ETH 下type
                      type: item.assetType,
                    },
                  });
                  break;
                default:
                  console.log('item.address',item.address)
                  console.log('item.txid',item.txid)
                  this.$ethServerApi.getTransactionByTxid(item.address,item.txid,res=>{
                    console.log('etTransactionByTxid res========',res);
                    this.$router.push({
                      path: '/ETH/record',
                      query: {
                        value: item.value,
                        comments: item.comments || '',
                        txid: item.txid,
                        create_time: res.data.create_time,
                        to: res.data.to || '',
                        from: res.data.from || '',
                        black_number: res.data.black_number || 0,
                        address: item.address || '',
                        fee: res.data.fee || 0,
                        type: 1 // === BTC status
                      },
                    });
                  });
                  break;
              }
            },
            back() {
              history.back();
            },
            dateFormat: function (value, type, joint = '-') {
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
            }
        },
        filters: {
          dateFormat: function (value, type, joint = '-') {
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
          formatNum(num) {
            // num = num * 1.0 / 100000000;
            return Number(parseFloat(num).toFixed(5).slice(0, -1));
          },
        },
        mounted(){

            // TODO: 设置已读状态
            this.readAll();
            this.removemodals();
            this.$store.commit("a",this.as);
            $('.mint_span').addClass('mint_span_div');
            this.loadPageList();

            this.wrapperHeight = document.documentElement.clientHeight - this.$refs.wrapper.getBoundingClientRect().top
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

<style lang="less" scoped>
    .noMessage {

      text-align: center;
      font-size: 0.3rem;
      margin-top: 1.42rem;

    }
    .box_html {
      width: 100%;
    }

    .divinp {
      width:7rem;
      height:1.4rem;
      background:rgba(255,255,255,1);
      box-shadow:0rem 0rem 0.11rem 0rem rgba(240,240,240,1);
      border-radius:0.17rem;
    }
    .div_L {
      margin: 0.3rem 0 0 0.3rem;
      /*background-color: #5bc0de;*/
      & > p {

        font-size:0.24rem;
        font-weight:bold;
        color:rgba(74,74,74,1);
        line-height:0.5rem;
        height:0.5rem;

        /*background-color: #5bc0de;*/

        .readIcon {
          /*display: inline-block;*/
          float: left;
          width: 10px;
          height: 10px;
          margin: 0.14rem 0.12rem 0 0;
          background: rgba(255,55,55,1);
          border-radius: 100%;
        }

      }
    }
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
