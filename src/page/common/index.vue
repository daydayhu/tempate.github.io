<template>
  <div style="height: 100%;">

    <div class="top_index">
      <p class="mybtn floatr"></p>
      <p class="system">{{symbol}}</p>
      <router-link :to="{path:'/wallet_details'}" tag="p" class="name">
        {{this.username}}
      </router-link>
      <p class="address" @click="ewm">
        {{this.address.slice(0,6)}}{{'......'}}{{this.address.slice(this.address.length-7,this.address.length)}}
        <!--<router-link :to="{path:'/BTC/Receipt_code'}">-->
        <!--<img src="../../assets/common/img/icon_erweima.png" class="img_erm">-->
        <!--</router-link>-->
        <img src="../../assets/common/img/icon_erweima.png" class="img_erm" @click="ewm">
      </p>
      <router-link :to="{path:'/wallet_details'}">
        <button class="backups">请备份</button>
      </router-link>

      <div class="detail">
        <p>≈ <span>160000</span></p>
        <p>总资产 ( ¥ )</p>
      </div>

      <router-link :to="{path:'/addtoken'}"><span class="add_system"></span></router-link>
    </div>

    <div class="shuju" >

      <router-link :to="{path:'/transaction'}">
        <div class="divinp">
          <span class="float symbol_icon_eth"></span>
          <span>{{symbol}}</span>
          <span>{{balance | numFormat}}</span>
          <span class="money">≈ ¥ 160000</span>
        </div>
      </router-link>

    </div>

  </div>

</template>

<script>
  import $ from 'jquery';
  import BtcSocket from '../../api/BTC/btc_socket';
  import CreateDB from '../../api/indexDB';

  import EthPoll from '../../api/pollNotice'
  export default {
    data() {
      return {
        sendVal: false,
        gaoYuanId: 'aboutModal',
        dd: false,
        uname: '',
        btc_data: '',
        eth_data: '',
        datas: '',
        adress: '',
        symbol: 'BTC',
        balance: '',
        zjc: '',
        showW: '',
        currSys: '',
        btc_readStatus: false,
        eth_readStatus: false,
        btcSocket:null,
        systemNoticeDB:null,
        DB_DELAY_TIME:2000,
        ethPoll:null
      }
    },
    methods: {
      yo: function() {
        this.dd = true;
      },
      ee: function() {
        this.dd = false;
      },
      wName(item) {
        this.uname = item.walletName;
        this.adress = item.address;
        this.$store.commit('username', this.uname);//抛出钱包名
        this.$store.commit('address', this.adress);//抛出钱包名
      },
      spot_bowling(item, index) {
        // this.$store.commit("symbols",item.symbol);
        // this.$store.commit("balances",item.balance);
        // this.$store.commit("contracts",item.contract_address);
        // this.$store.commit("decimalss",item.decimals);
        //
        // localStorage.setItem("symbol_s",item.symbol);
        // localStorage.setItem("balance_s",item.balance);
      },
      changeSys(item) {
        this.currSys = item;
        this.showW = item;
      },
      importWay() {
        var flag = localStorage.getItem('importType');
        if (flag) {
          // var path = '/BTC/import/' + flag;
          var path = '/import/' + flag;
          this.$router.push(path);
        } else {
          // var path = '/BTC/import/mnemonic';
          var path = '/import/mnemonic';
          this.$router.push(path);
        }
      },
      qiehuanBTC(item) {
//                if(item.address!=this.common.Wallet.getCurrWallet().address){
//                    console.log('刷新');
//                    location.reload(true);
//                } else{
//                    console.log('不刷新');
//                    return false;
//                }

        location.reload(true);
        console.log('BTC-BTC');
        this.btcCommon.BtcWallet.importFromWallet(item);
      },
      qiehuanETH(item) {

        // location.reload(true);
        console.log('BTC-ETH');
        this.$router.push('/index');

        this.common.Wallet.importFromWallet(item);
        localStorage.setItem('wallet_system', 'ETH');
      },
      showDeleteButton(item, index) {
        if (item.integral != undefined) {
          console.log(item.integral);

          $('.sj_img').eq(index).show();  //显示
//                    $(".sj_img").show();  //显示-备注
          localStorage.setItem('integral', item.integral);
        } else {
          $('.sj_img').hide();  //隐藏
        }
      },
      ewm() {
        if (this.zjc) {
          this.$router.push('/Receipt_code');
        } else {
          this.$router.push('/backWarn');
        }
      },
      createSockete() {
        // TODO: socket 实现

        this.btcSocket = new BtcSocket();
        this.btcSocket.init();
        this.btcSocket.onmessage = (data) => {

          var data = data || {
            "op": "utx",
            "x": {
              "lock_time": 0,
              "ver": 1,
              "size": 192,
              "inputs": [
                {
                  'sequence': 4294967295,
                  'prev_out': {
                    'spent': true,
                    'tx_index': 99005468,
                    'type': 0,
                    'addr': '1FyLv4N5cof3k8xFcMUw9PSgm6pr8fZzaf',
                    'value': 65574000,
                    'n': 0,
                    'script': '76a91477f4c9ee75e449a74c21a4decfb50519cbc245b388ac',
                  },
                  'script': '483045022100e4ff962c292705f051c2c2fc519fa775a4d8955bce1a3e29884b2785277999ed02200b537ebd22a9f25fbbbcc9113c69c1389400703ef2017d80959ef0f1d685756c012102618e08e0c8fd4c5fe539184a30fe35a2f5fccf7ad62054cad29360d871f8187d',
                },
              ],
              'time': 1440086763,
              'tx_index': 99006637,
              'vin_sz': 1,
              'hash': '0857b9de1884eec314ecf67c040a2657b8e083e1f95e31d0b5ba3d328841fc7f',
              'vout_sz': 1,
              'relayed_by': '127.0.0.1',
              'out': [
                {
                  'spent': false,
                  'tx_index': 99006637,
                  'type': 0,
                  'addr': '1A828tTnkVFJfSvLCqF42ohZ51ksS3jJgX',
                  'value': 65564000,
                  'n': 0,
                  'script': '76a914640cfdf7b79d94d1c980133e3587bd6053f091f388ac',
                },
                {
                  'spent': false,
                  'tx_index': 99006637,
                  'type': 0,
                  'addr': '1A828tTnkVFJfSvLCqF42ohZ51ksS3jJgX',
                  'value': 11164000,
                  'n': 0,
                  'script': '76a914640cfdf7b79d94d1c980133e3587bd6053f091f388ac',
                },
              ],
            },
          };

          // 获取钱包地址
          let btcAddressArray = JSON.parse(localStorage.getItem('btc_wallets'));
          let _type, _value = 0, _hash, _address, _time, currentAddress;

          if (data.op && data.op === 'utx') {

            _hash = data.x.hash;
            _time = data.x.time;

            var _addressFlag = false;

            btcAddressArray.forEach((value) => {

              if (_addressFlag) return false;

              currentAddress = value.address;
              data.x.inputs.forEach((value) => {
                if (value.prev_out.addr === currentAddress) {
                  _type = 'Send';
                  _address = currentAddress;
                  _addressFlag = true;
                }
              });

              if (_type === 'Send') {

                data.x.out.forEach((value) => {
                  if (value.addr !== currentAddress) {
                    console.log('==========================value', _value);
                    _value += Number(value.value);
                  }
                });

              } else {
                data.x.out.forEach((value) => {
                  if (value.addr === currentAddress) {

                    _type = 'Receive';
                    _value = Number(value.value);
                    _address = currentAddress;
                    _addressFlag = true;

                  }
                });
              }
            });
          }

          var _data = {
            type: _type,
            address: _address,
            assetType: 'BTC',
            value: _value,
            hash: _hash,
            time: _time,
          };

          // TODO: 数据添加到数据库
          this.systemNoticeDB.indexGetData((val)=>{
            _data.id = val;
            this.btcDB.add(_data,{name:'btcSystemNotice',keyPath:'id',status:'readwrite'});
            // TODO: 红点机制
            this.btc_readStatus = true;
          },'id',{name:'btcSystemNotice',keyPath:'id',status:'readwrite'});
        };
        // this.btcSocket.onmessage();
      },

      createDB() {
        // TODO: 数据库创建
        this.systemNoticeDB = new CreateDB();
        this.systemNoticeDB.openDB({name:'btcSystemNotice',keyPath:'id',status:'readwrite'},(data) => {
          console.log('当前数据集合',data);
          // TODO: 创建socket连接
          this.createSockete();
          // TODO: 创建长轮询
          this.createPoll();
        });
      },

      createPoll() {
        this.ethPoll = new EthPoll();
        this.ethPoll.init((res) => {
          // TODO: 添加到数据库
          var _data;
          if (res.status_code === 200){

            if (res.data.length) {
              res.data.forEach((obj) => {
                _data.id = obj.id;
                _data.type = obj.msg_type === 1 ? 'Receive' : 'Send';
                _data.assetType = 'ETH';
                _data.value = obj.value;
                _data.txid = obj.txid;
                _data.time = obj.createTime;

                this.systemNoticeDB.add(_data,{name:'ethSystemNotice',keyPath:'id',status:'readwrite'}, (res) => {
                  // TODO: 红点机制
                  if (!this.eth_readStatus) this.eth_readStatus = true;
                });
              });


            }else {
              // _data = {
              //   id:10,
              //   type: 'send',
              //   address: 'dsadssaaddsadsadasasdas',
              //   assetType: 'ETH',
              //   value: 10000,
              //   txid: '0857b9de1884eec314ecf67c040a2657b8e083e1',
              //   time: 1540086763
              // };
              // this.systemNoticeDB.add(_data,{name:'ethSystemNotice',keyPath:'id',status:'readwrite'}, (res) => {
              //   if (!this.eth_readStatus) this.eth_readStatus = true;
              // });
            }
          }
        });
      },
    },
    mounted() {

      // TODO: 创建/开启数据库
      this.createDB();

      // ******************************************************************************

      // this.system = localStorage.getItem('wallet_system');
      this.currSys = localStorage.getItem('wallet_system') ? localStorage.getItem('wallet_system') : 'ETH';
      this.showW = localStorage.getItem('wallet_system') ? localStorage.getItem('wallet_system') : 'ETH';
      console.log('a', this.$store.state.a);
      // this.$store.commit("eth_s",1);
      if (this.a) {
        this.yo();
      }
      this.removemodals();

      var wallet = this.btcCommon.BtcWallet.getCurrWallet();
      console.log(wallet);
      this.uname = wallet.walletName;
      this.adress = wallet.address;
      this.$store.commit('username', this.uname);//抛出钱包名
      localStorage.setItem('username', this.uname);
      localStorage.setItem('address_btc', this.adress);

      var zjc = localStorage.getItem('btc_zjc' + this.adress);
      this.$store.commit('back_zjc', zjc);
      console.log('zjc:', zjc);
      console.log('back_zjc:', this.$store.state.back_zjc);

      this.$store.commit('address', this.adress);

      this.btc_data = this.btcCommon.BtcWallet.getWallets() ? this.btcCommon.BtcWallet.getWallets() : '';
      this.eth_data = this.common.Wallet.getWallets() ? this.common.Wallet.getWallets() : '';
      this.zjc = this.$store.state.back_zjc;

      var _this = this;
      wallet.getBalance(this.adress, function(err, balance) {
        // console.log("balance",balance);
        _this.balance = balance;
      });

      this.balance = localStorage.getItem('balance_btc');
      localStorage.setItem('balances_s_btc', this.balance);

      var isCanBackUp = localStorage.getItem('isCanBackUp:' + this.adress);
      if (isCanBackUp === 'no') {
        this.zjc = true;
        this.$store.commit('back_zjc', this.zjc);

        console.log('back_zjc', this.$store.state.back_zjc);
      }
//       wallet.getTokens( (err, data)=> {
//         console.log(data);
//         for(var i=0;i<data.length;i++){
//           if(data[i].symbol=="ETH"){
// //                        console.log(data[i].balance);
//             this.$store.commit("symbols",data[i].symbol);
//             this.$store.commit("balances",data[i].balance);
//             this.$store.commit("balances_s",data[i].balance);
//             localStorage.setItem("balances_s_eth",this.$store.commit("balances_s",data[i].balance));
//             localStorage.setItem("key_s",'iban:'+this.adress+'?amount='+data[i].balance+'&token='+data[i].symbol);
//           }
//         }
//         this.datas=data;
//         this.$store.commit("token",this.datas);
//       });
    },
    destroyed() {
      if (this.btcSocket) { this.btcSocket.onclose(); }
      if (this.ethPoll) {
        this.ethPoll.cancelPoll = true;
        if (this.ethPoll.timer) {
          clearTimeout(this.ethPoll.timer);
          this.ethPoll.timer = null;
        }
      }
    },
    computed: {
      username() {
        return this.$store.state.username;
      },
      address() {
        return this.$store.state.address;
      },
      removemodals() {
        return this.$store.state.removemodals;
      },
      a() {
        return this.$store.state.a;
      },
      back_zjc() {
        // console.log("this.$store.state.back_zjc:",this.$store.state.back_zjc);
        return this.$store.state.back_zjc;
      },
    },
  };
</script>

<style scoped>
  body {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .isDeleting {
    width: 93%;
    height: 1.4rem;
    text-align: center;
    line-height: 1.4rem;
    background: rgba(48, 138, 239, 0.9);
    font-size: .3rem;
    color: #f8fffb;
    position: absolute;
    border-radius: .1rem;
    text-decoration: none;
    display: none;
  }

  .top_index {
    width: 100%;
    height: 5.24rem;
    background-color: #374466;
    color: #ffffff;
    position: absolute;
    top: 0;
  }

  .system {
    margin-top: 0.19rem;
    font-size: 0.38rem;
    font-weight: bold;
    color: rgba(255, 255, 255, 1);
    line-height: 0.53rem;
    text-align: center;
  }
  .name {
    margin: 0.37rem auto 0 auto;
    text-align: center;
    height: 1.19rem;
    font-size: 0.85rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 1);
    line-height: 1.19rem;

    width: 5rem; /*必须设置宽度*/
    overflow: hidden; /*溢出隐藏*/
    text-overflow: ellipsis; /*以省略号...显示*/
    white-space: nowrap; /*强制不换行*/
  }

  .address {
    width: 5.23rem;
    height: 0.50rem;
    font-size: 0.33rem;
    font-family: PingFang-SC-Bold;
    font-weight: bold;
    color: rgba(255, 255, 255, 1);
    line-height: 0.5rem;
    text-align: center;
    margin: 0.06rem auto;
  }

  .img_erm {
    width: .25rem;
    height: .25rem;
    vertical-align: middle;
  }

  .backups {
    width: 1.49rem;
    height: 0.47rem;
    border-radius: 0.24rem;
    border: 0.02rem solid rgba(95, 108, 142, 1);
    background-color: #374466;
    margin: 0.2rem 3rem 0.33rem 3rem;
    color: rgba(95, 108, 142, 1);
    text-align: center;
    font-size: 0.24rem;
  }

  .add_system{
    background: url("../../assets/common/img/icon_tianjia@2x.png") no-repeat;
    background-size: 100% 100%;
    width: 0.59rem;
    height: 0.59rem;
    position: absolute;
    bottom: 0.49rem;
    right: 0.24rem;
  }
  .detail p {
    font-size: 0.22rem;
    font-weight:500;
    color:rgba(255,255,255,1);
    line-height:0.30rem;
    margin-left: 0.29rem;
  }
  .detail p span{
     font-size:0.48rem;
     font-weight:600;
    line-height: 0.67rem;
   }

  .mybtn {
    position: absolute;
    right: 0.3rem;
    top:0.27rem;
    width: 0.33rem;
    height: 0.31rem;
    background: url("../../assets/common/img/icon_shezhi@2x.png") no-repeat;
    background-size: cover;
  }
  .tab li {
    width: 50%;
    height: 0.94rem;
    float: left;
    background: rgba(55, 68, 102, 1);
    text-align: center;
    line-height: 0.94rem;

    font-size: 0.30rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 1);
  }

  .tab li.selected {
    background: rgba(79, 92, 130, 1);
    color: rgba(255, 255, 255, 0.7);
  }

  .tab li span.little_icon_eth {
    display: inline-block;
    width: 0.34rem;
    height: 0.34rem;
    background: url("../../assets/common/img/icon_tab_eht_pre@2x.png") no-repeat;
    background-size: cover;

    vertical-align: middle;
    margin-right: 0.25rem;
  }

  .tab li span.little_icon_btc {
    display: inline-block;
    width: 0.34rem;
    height: 0.34rem;
    background: url("../../assets/common/img/icon_tab_btc_pre@2x.png") no-repeat;
    background-size: cover;

    vertical-align: middle;
    margin-right: 0.25rem;
  }

  .tab li.selected span.little_icon_btc {
    background: url("../../assets/common/img/icon_tab_btc.png") no-repeat;
    background-size: cover;
  }

  .tab li.selected span.little_icon_eth {
    background: url("../../assets/common/img/icon_tab_eht.png") no-repeat;
    background-size: cover;
  }

  .shuju {
    height: 100%;
    padding-top: 5.3rem;
    background-color: #F6F6F6;
    overflow-y: scroll;
    box-sizing: border-box;
  }

  .divinp {
    width: 7rem;
    height: 1.4rem;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0rem 0rem 0.11rem 0rem rgba(240, 240, 240, 1);
    border-radius: 0.17rem;
    margin: 0.2rem auto;
    position: relative;
  }

  .divinp span {
    line-height: 1.4rem;
    font-size: 0.38rem;
    color: rgba(74, 74, 74, 1);
  }

  .divinp span:nth-child(1) {
    float: left;
    margin-left: 0.39rem;
    font-weight: 600;
  }

  .divinp span:nth-child(2) {
    margin-left: 0.26rem;
    font-weight: 600;
  }

  .divinp span:nth-child(3) {
    float: right;
    margin-right: 0.7rem;
    font-size:0.32rem;
    font-weight:600;
    line-height:45px;
  }
  .divinp .money {
    font-size:0.22rem;
    font-weight:500;
    color:rgba(155,155,155,1);
    line-height:0.3rem;
    position: absolute;
    right: 0.55rem;
    bottom: 0.29rem;
  }
  .div_img img {
    width: .3rem;
  }


  p {
    font-family: PingFangSC-Semibold;
    color: rgba(255, 255, 255, 1);
  }

  /*p:nth-child(1){  padding: 0.7rem 0 0 6rem;  font-size:0.3rem;  }*/
  /*p:nth-child(2){  font-size:0.5rem;  padding: 0.4rem 0 0 0.7rem;*/
  /*width: 5rem;  !*必须设置宽度*!*/
  /*overflow: hidden;  !*溢出隐藏*!*/
  /*text-overflow: ellipsis; !*以省略号...显示*!*/
  /*white-space: nowrap;  !*强制不换行*! }*/
  /*p:nth-child(3){  font-size:0.33rem;  padding: 0.2rem 0 0 0.7rem;  }*/
  .divinp {
    width: 7rem;
    height: 1.4rem;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0rem 0rem 0.11rem 0rem rgba(240, 240, 240, 1);
    border-radius: 0.17rem;
    margin: 0.2rem auto;
  }

  /*span {*/
    /*line-height: 1.4rem;*/
    /*font-size: 0.38rem;*/
    /*color: rgba(74, 74, 74, 1);*/
  /*}*/

  /*span:nth-child(1){  position: absolute;  margin-left: 0.5rem;  }*/
  /*span:nth-child(2){  margin-left: 1.5rem;  }*/
  /*span:nth-child(3){  float: right;  margin-right: 0.7rem;  }*/
  .img_erm {
    width: .25rem;
    height: .25rem;
  }

  .em_shuju {
    font-size: 0.3rem;
    line-height: 1.05rem;
    float: left;
    height: 1rem;
    width: 4rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
