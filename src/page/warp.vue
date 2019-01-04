<template>
    <div class="warp">
        <div class="viewContainer">
            <index v-if="'active1' == active"></index>
            <quotes v-if="'active2' == active"></quotes>
            <setting v-if="'active3' == active" :badge="badge"></setting>
        </div>
        <footer class="footer">
            <ul>
                <li @click="tab(1)"><span class="qb" :class="{'active':active=='active1'}"></span><em
                        :class="{'active':active=='active1'}">钱包</em>
                </li>
                <li @click="tab(2)"><span class="hq" :class="{'active':active=='active2'}"></span><em
                        :class="{'active':active=='active2'}">行情</em>
                </li>
                <li @click="tab(3)"><span class="wd" :class="{'active':active=='active3'}"><i class="icon" v-if="badge"></i></span><em
                        :class="{'active':active=='active3'}">我的</em>
                </li>
            </ul>
        </footer>

    </div>
</template>

<script>
  import index from './index';
  import quotes from '../page/common/quotes';
  import setting from '../page/setting/setting';
  import CreateDB from '../api/indexDB';
  import BtcSocket from '../api/BTC/btc_socket';
  import EthPoll from '../api/pollNotice';


  export default {
    name: 'warp',
    data() {
      return {
        active: 'active1',
        badge: false,
        systemNoticeDB: null,
        btcSocket: null,
        ethPoll: null,

        usdtScriptData: null,
        USDTSTR: {
          op_return: {
            value: '6a',
            len: 2,
            index: 0,
          },
          length: {
            value: '14', // 16进制 20
            len: 2,
            index: 2,
          },
          omni: {
            value: '6f6d6e69',
            len: 8,
            index: 4,
          },
          omniversion: {
            value: '',
            len: 4,
            index: 12,
          },
          txtype: {
            value: '',
            len: 4,
            index: 16,
          },
          omniId: {
            value: '',
            len: 8,
            index: 20,
          },
          amount: {
            value: '',
            len: 16,
            index: 28,
          },
        },
      };
    },
    components: {
      index,
      quotes,
      setting,
    },
    methods: {
      tab(ind) {
        if(ind !=1){
          this.$indicator.close();
        }
        this.active = 'active' + ind;
        localStorage.setItem('warpActive', this.active);
      },
      createDB() {
        // TODO: 数据库创建
        this.systemNoticeDB = new CreateDB();

        this.systemNoticeDB.openDB({name: 'SystemNotice', keyPath: 'id', status: 'readwrite'}, (data) => {
          console.log('当前数据集合', data);
          // // TODO: 创建socket连接
          this.createSockete();
          // // TODO: 创建长轮询
          this.createPoll();


          // TODO: 首页增加红点机制处理
          this.systemNoticeDB.readAll(null,res=>{
            console.log('获取当前所有消息数据',res);
            let _readStatus = 'N'; // 为Y 未阅读  为N 都已读
            // 获取可读状态
            if (res && res.length) {
              for(let i = 0; i < res.length; i++) {
                let value = res[i];
                if (!value.readStatus) {
                  // 有红点
                  _readStatus = 'Y';
                  break;
                }
              }
            }
            // 设置全局红点状态
            localStorage.setItem('noticeReadStatus',_readStatus);
            this.badge = _readStatus === 'Y';

          });

        });
      },
      createSockete() {
        // TODO: socket 实现
        // ETH 无需

        // TODO: 增加使用判断
        /*
          1.每次创建socket 若原来存在 先关闭
          2.先判断是否存在btc钱包 若无 则无需开启sockete

        */
        let btcWallets = JSON.parse(localStorage.getItem('btc_wallets'));
        if (!btcWallets || !btcWallets.length) return false;
        if (this.btcSocket) { this.btcSocket.onclose(); this.btcSocket = null };

        this.btcSocket = new BtcSocket();
        this.btcSocket.init();
        this.btcSocket.onmessage = (data) => {

          var data = data || {
            'op': 'utx',
            'x': {
              'lock_time': 0,
              'ver': 1,
              'size': 192,
              'inputs': [
                {
                  'sequence': 4294967295,
                  'prev_out': {
                    'spent': true,
                    'tx_index': 99005468,
                    'type': 0,
                    'addr': 'mh1MejCESfzeSeVfU93zsFvF4CLc3fZRVw',
                    'value': 65574000,
                    'n': 0,
                    'script': '76a91477f4c9ee75e449a74c21a4decfb50519cbc245b388ac',
                  },
                  'script': '483045022100e4ff962c292705f051c2c2fc519fa775a4d8955bce1a3e29884b2785277999ed02200b537ebd22a9f25fbbbcc9113c69c1389400703ef2017d80959ef0f1d685756c012102618e08e0c8fd4c5fe539184a30fe35a2f5fccf7ad62054cad29360d871f8187d',
                },
                {
                  'sequence': 4294967295,
                  'prev_out': {
                    'spent': true,
                    'tx_index': 99005468,
                    'type': 0,
                    'value': 65574000,
                    'n': 0,
                    'script': '6a146f6d6e6900000000000000010000000000989680',
                  },
                  'script': '483045022100e4ff962c292705f051c2c2fc519fa775a4d8955bce1a3e29884b2785277999ed02200b537ebd22a9f25fbbbcc9113c69c1389400703ef2017d80959ef0f1d685756c012102618e08e0c8fd4c5fe539184a30fe35a2f5fccf7ad62054cad29360d871f8187d',
                },
              ],
              'time': 1540086763,
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
                  'addr': 'mh1MgjCESfzeSeVfU93zsFvF4CLc3fZRVw',
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
                {
                  'spent': false,
                  'tx_index': 99006637,
                  'type': 0,
                  'value': 11164000,
                  'n': 0,
                  'script': '6a146f6d6e6900000000000000010000000001989680',
                },

              ],
            },
          };

          // 记录历史

          // 获取钱包地址
          let _type, _hash, _address, _assetType, _time, currentAddress, _value = 0;

          if (data.op && data.op === 'utx') {
            _hash = data.x.hash;
            _time = data.x.time;
            let _addressFlag = false;

            btcWallets.forEach((value) => {
              if (_addressFlag) return false;
              currentAddress = value.address;
              data.x.inputs.forEach((value) => {
                if (value.prev_out.addr === currentAddress) {
                  _type = 'Send';
                  _assetType = 'BTC';
                  _address = currentAddress;
                  _addressFlag = true;
                }
                if (!value.prev_out.addr) {
                  // let _script = '6a146f6d6e6900000000000000010000000000989680';
                  let _script = value.prev_out.script;
                  this.parseUSDTScript(_script);
                }
              });

              if (_type === 'Send') {
                if (this.usdtScriptData) {
                  _assetType = 'USDT';
                  _value = this.usdtScriptData.d_amount;
                } else {
                  data.x.out.forEach((value) => {
                    if (value.addr && value.addr !== currentAddress) {
                      console.log('==========================value', _value);
                      _value += Number(value.value);
                    }
                  });
                }
              } else {
                this.usdtScriptData = null; // 先清空usdtScriptData，阻止send干扰
                data.x.out.forEach((value) => {
                  if (value.addr === currentAddress) {
                    _type = 'Receive';
                    _assetType = 'BTC';
                    _address = currentAddress;
                    _addressFlag = true;
                    _value = Number(value.value);
                  }
                  if (!value.addr) {
                    let _script = value.script;
                    this.parseUSDTScript(_script);
                  } //
                });
                if (this.usdtScriptData) {
                  _assetType = 'USDT';
                  _value = this.usdtScriptData.d_amount;
                }
              }
            });

            if (_addressFlag) {
              var _data = {
                type: _type,
                assetType: _assetType,
                value: _value,
                txid: _hash,  // hash 与txid 区别
                time: _time,
                address: _address,
                readStatus: false
              };

              // TODO: 数据添加到数据库

              this.systemNoticeDB.indexGetData((val) => {
                if (val > 0) {
                  _data.id = val;
                  this.systemNoticeDB.add(_data, {name: 'SystemNotice', keyPath: 'id', status: 'readwrite'}, (res) => {
                    if (localStorage.getItem('noticeReadStatus') !== 'Y') {
                      localStorage.setItem('noticeReadStatus','Y');
                      this.badge = true;
                    }
                  });
                }else {
                  console.log('txid重复 不写入');
                }
              },{txid:_data.txid});

              // this.systemNoticeDB.indexGetData((val) => {
              //   _data.id = val;
              //   this.systemNoticeDB.add(_data, {name: 'SystemNotice', keyPath: 'id', status: 'readwrite'});
              //
              //   if (localStorage.getItem('noticeReadStatus') !== 'Y') {
              //     localStorage.setItem('noticeReadStatus','Y');
              //   }
              //
              //   // // TODO: 红点机制
              //   // if (!this.btc_readStatus) {
              //   //   this.btc_readStatus = true;
              //   //   localStorage.setItem('btc_readStatus', true);
              //   // }
              //   // //TODO: 获取消息状态 注意btc刷新丢失
              //   // this.getReadStatus();
              //
              // });

            }

          }

        };
        // this.btcSocket.onmessage();
      },
      createPoll() {

        if (this.ethPoll) {
          this.ethPoll.cancelPoll = true;
          if (this.ethPoll.timer) {
            clearTimeout(this.ethPoll.timer);
            this.ethPoll.timer = null;
          }
          this.ethPoll = null;
        }

        this.ethPoll = new EthPoll();
        this.ethPoll.init((res) => {

          // TODO: 添加到数据库
          var _data = {};
          if (res.status_code === 200) {
            console.log('轮询数据-----', res);
            if (res.data.length) {

              /*
              *  1.小红点逻辑
              *  进去了 默认全部已读   目的 禁止推送
              *  数据库列表记录 已读未读状态  默认都是未读
              *
              *  2.交易详情页面数据
              *
              *
              * */

              // TODO: 确保消息的唯一性  防止重复添加

              res.data.forEach((obj) => {

                _data.type = obj.msg_type === 1 ? 'Receive' : 'Send';
                _data.assetType = obj.symbot;
                _data.value = obj.value;
                _data.txid = obj.txid;
                _data.time = new Decimal(obj.createTime).div(new Decimal(1000)).toNumber();
                _data.address = obj.address;
                _data.readStatus = false;

                this.systemNoticeDB.indexGetData((val) => {
                  if (val > 0) {
                    _data.id = val;
                    this.systemNoticeDB.add(_data, {name: 'SystemNotice', keyPath: 'id', status: 'readwrite'}, (res) => {
                      if (localStorage.getItem('noticeReadStatus') !== 'Y') {
                        localStorage.setItem('noticeReadStatus','Y');
                        this.badge = true;
                      }
                    });
                  }else {
                    console.log('txid重复 不写入');
                  }
                },{txid:_data.txid});
              });

            } else {

              // _data.type = 'Receive';
              // _data.assetType = 'ETH';
              // _data.value = 1000;
              // _data.txid = '0xb4e0ed7ab1be0f98c5deca1497cd1db885460abe080c29a6750cdc3debdacf76';
              // _data.time = 152618282;
              // _data.address = '0xd03ea8624c8c5987235048901fb614fdca89b117';
              // _data.readStatus = false;
              //
              // this.systemNoticeDB.indexGetData((val) => {
              //   if (val > 0) {
              //     _data.id = val;
              //     this.systemNoticeDB.add(_data, {name: 'SystemNotice', keyPath: 'id', status: 'readwrite'}, (res) => {
              //       if (localStorage.getItem('noticeReadStatus') !== 'Y') {
              //         localStorage.setItem('noticeReadStatus','Y');
              //       }
              //     });
              //   }else {
              //     console.log('txid重复 不写入');
              //   }
              // },{txid:_data.txid});
            }
          }
        });
      },
      parseUSDTScript(str) {
        /*
        * op_return的id 6a
        * 标识：0x6f6d6e69(omni) 固定值
        *
        * omniversion: 0x0000 (0)  交易版本
        * txtype: 0x0000(0)  交易类型
        * id: 0x00000001(1) 现网环境中只处理31的交易，31代表usdt. 测试环境一般是2  代表测试币  货币标识符
        * amount: 0x0000000000989680(10000000 = 0.1USDT)
        * */
        let _USDTSTR = this.USDTSTR;
        let _script = str;
        let omniData = {};

        if (_script.slice(_USDTSTR.op_return.index, _USDTSTR.op_return.index + _USDTSTR.op_return.len) ===
          _USDTSTR.op_return.value && _script.slice(_USDTSTR.omni.index, _USDTSTR.omni.index + _USDTSTR.omni.len) ===
          _USDTSTR.omni.value) {
          omniData.txt = _script;
          ['omniversion', 'txtype', 'omniId', 'amount'].forEach((value) => {
            omniData[value] = _script.slice(_USDTSTR[value].index, _USDTSTR[value].index + _USDTSTR[value].len);
            omniData['d_' + value] = parseInt(omniData[value], 16);
          });
          console.log('omniData=====',omniData);
          this.usdtScriptData = omniData;
        } else {
          omniData = null;
          this.usdtScriptData = null;
        }
        return omniData;

      },
      pushHistory(e) {
        window.history.pushState("warp",null,location.href);
        // window.history.forward(1); 兼容ie考虑
      },
    },
    mounted() {
      this.createDB();
      this.active = localStorage.getItem('warpActive') || 'active1';
      //TODO:  监听物理按键
      if (window.history && window.history.pushState) {
        window.addEventListener("popstate", this.pushHistory);
      }
      window.history.pushState("warp",null,location.href);
    },
    destroyed() {
      if (this.btcSocket) {
        this.btcSocket.onclose();
        this.btcSocket = null;
      }
      if (this.ethPoll) {
        this.ethPoll.cancelPoll = true;
        if (this.ethPoll.timer) {
          clearTimeout(this.ethPoll.timer);
          this.ethPoll.timer = null;
        }
        this.ethPoll = null;
      }
      window.removeEventListener('popstate', this.pushHistory);
    }
  };
</script>

<style scoped lang="less">
    .warp {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .viewContainer {
            flex: auto;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #FCFCFC;
            min-height: 1.05rem;
            z-index: 10;
            ul {
                display: flex;
                justify-content: space-around;
                li {
                    flex: 1;
                    text-align: center;
                }
            }
            span {
                margin-top: 0.15rem;
                width: 0.48rem;
                height: 0.48rem;
                display: inline-block;
            }
            span.qb {
                background: url("../assets/common/img/icon_qianbao@2x.png") no-repeat;
                background-size: contain;
            }
            span.qb.active {
                background: url("../assets/common/img/icon_qianbao_dianjizhuangtai@2x.png") no-repeat;
                background-size: contain;
            }
            span.hq {
                background: url("../assets/common/img/icon_hangqing@2x.png") no-repeat;
                background-size: contain;
            }
            span.hq.active {
                background: url("../assets/common/img/icon_hangqing_dianjizhuangtai@2x.png") no-repeat;
                background-size: contain;
            }
            span.wd {
                background: url("../assets/common/img/icon_wode@2x.png") no-repeat;
                background-size: contain;
                position: relative;
                .icon {
                    position: absolute;
                    content: '';
                    display: block;
                    width: 0.21rem;
                    height: 0.21rem;
                    top: -0.04rem;
                    right: -0.03rem;
                    background: url("../assets/common/img/icon_xinxiaoxitishi@2x.png") no-repeat;
                    background-size: 100% 100%;
                }
            }
            span.wd.active {
                background: url("../assets/common/img/icon_wode_dianjizhuangtai@2x.png") no-repeat;
                background-size: contain;
            }
            em {
                display: block;
                margin-top: -0.1rem;
                font-size: 0.22rem;
                color: #000;
            }
            em.active {
                color: #3085F1;
            }
        }
    }

</style>
