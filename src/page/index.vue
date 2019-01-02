<template>
    <div class="Index">
        <!--TODO:head-->
        <div class="walletHead">
            <span class="menuBtn" @click="sidebarShow"></span>

            <div class="system" @click="selectPromptShow">{{currencyType}}<span class="down_icon"></span></div>
            <div class="walletName" :class="{'walletNameTop':backupStatus != '1'}" @click="walletDetail"
                 v-if="currentWallet">{{currentWallet.walletName}}
            </div>
            <div class="walletAddress" @click="copyWalletAddress" v-if="currentWallet" style="position: relative;">
                {{currentWallet.address.slice(0,12)}}{{'...'}}{{currentWallet.address.slice(currentWallet.address.length-12,currentWallet.address.length)}}
                <img src="../assets/common/img/icon_erweima@2x.png" class="img_erm" @click="copyWalletAddress">
            </div>
            <div class="backupContainer">
                <button class="backups" @click="walletDetail" v-if="backupStatus == '1'">请备份</button>
            </div>
            <div class="walletAmount" v-if="true">

                <p>≈ <span>{{totalBalance[currencyType] | rateFormat(this.currencyType)}}</span></p>
                <p>总资产 ( {{priceRateMark[priceRateType]}} )</p>
            </div>
            <div class="addHandle" v-show="currencyType === 'ETH'">
                <span class="add_system" @click="addToken"></span>
            </div>
        </div>
        <!--TODO:content-->
        <div class="walletContent">
            <div class="divinp" v-for="(item,index) in walletList[currencyType]" @click="toTransaction(item)" :key="index">
                <span :class="['float','symbol_icon_'+currencyType]"></span>
                <span>{{item.symbol}}</span>
                <div class="priceC">
                    <div>{{item.balance | numFormat(item.symbol)}}</div>
                    <!--<div v-if="priceRateSet[item.symbol]">≈ {{priceRateMark[priceRateType]}} {{item.realBalance |-->

                        <!--rateFormat(item.symbol)}}-->
                    <!--</div>-->
                  <div>≈ {{priceRateMark[priceRateType]}} {{item.realBalance | rateFormat(item.symbol)}}</div>
                </div>
            </div>
        </div>
        <!--TODO:sidebar-->
        <Sidebar :list="currencyWallets" :currentWallet="currentWallet" :currencyType="currencyType"
                 :readStatus="curr_readStatus" :balance="balance" v-show="sidebarFlag"
                 @maskcallback="sidebarClose" @toWallet="toWallet"></Sidebar>
        <!--TODO: select-->
        <Prompt :selectList="[{name:'ETH',checked:currencyType==='ETH'},{name:'BTC',checked:currencyType==='BTC'}]"
                v-show="selectPromptFlag" :promptType="1" @maskcallback="selectPromptClose" @selectcb="changeType"></Prompt>

    </div>
</template>

<script>
  import $ from 'jquery';
  // import BtcSocket from '../api/BTC/btc_socket';
  // import CreateDB from '../api/indexDB';
  // import EthPoll from '../api/pollNotice';
  import Sidebar from '../components/sidebar/index';
  import Prompt from '../components/prompt/index';
  import {$USDT} from '../api/BTC/USDT';

  export default {
    name: 'index',
    data() {
      return {
        currentWallet: null,
        currencyType: '',

        totalBalance: {
          ETH: 0,
          BTC: 0
        },
        balance: 0,
        lastBtcBalance: 0,
        lastEthBalance: 0,

        currencyWallets: [],
        ethToggle: false,
        btcToggle: false,
        walletList: {

          ETH:[],
          BTC:[]
        },
        TokenList: ['btc','usdt'],
        backupStatus: '', // 是否已经备份 基于助记词
        isbackups: false,   // 是否要备份助记词
        sidebarFlag: false,
        selectPromptFlag: false,

        curr_readStatus: false,
        btc_readStatus: false,
        eth_readStatus: false,

        btcSocket: null,
        systemNoticeDB: null,
        ethPoll: null,
        DB_DELAY_TIME: 2000,


        BTC_confirmations: 3, // BTC 确认块 默认3
        priceRateType: 'cny', //cny 人民币(默认) usd 美元
        priceRateMark: {cny: '￥', usd: '$'},
        priceRateSet: [],

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
    methods: {
      reset() {
        this.getReadStatus();
        this.getAllWallets();
        if (this.getCurrentWallet()) {
          this.$router.push({
            path: '/warp',

            query: {
              type: this.currencyType,
            },
          });
        }
      },
      importWay() {
        this.$router.push({
          path: '/import',
          query: {
            type: this.currencyType,
          },
        });
      },
      sidebarShow() {
        this.sidebarFlag = true;
      },
      sidebarClose() {
        this.sidebarFlag = false;
      },
      toWallet(item) {
        // 先类型

        switch (this.currencyType) {
          case 'ETH':
            localStorage.setItem('currWallet', JSON.stringify(item));
            break;
          case 'BTC':
            localStorage.setItem('btc_currWallet', JSON.stringify(item));
            break;
          default:
            break;
        }
        this.sidebarFlag = false;
        this.reset();
      },
      toTransaction(item) {

        switch (this.currencyType) {
          case 'ETH':
            this.$router.push({
              path: '/ETH/transaction',
              query: {
                type: this.currencyType,
                symbol: item.symbol,
                balance: item.balance,
                realBalance: item.realBalance,
                decimals: item.decimals,
                contract_address: item.contract_address,
              },
            });
            break;
          case 'BTC':
            this.$router.push({
              path: '/BTC/transaction',
              query: {
                type: this.currencyType,
                symbol: item.symbol,
                balance: item.balance,
                realBalance: item.realBalance,
              },
            });
            break;
          default:
            break;
        }
      },
      getReadStatus() {

        switch (this.currencyType) {
          case 'ETH':
            this.eth_readStatus = JSON.parse(localStorage.getItem('eth_readStatus')) || this.eth_readStatus;
            this.curr_readStatus = this.eth_readStatus;
            break;
          case 'BTC':
            this.btc_readStatus = JSON.parse(localStorage.getItem('btc_readStatus')) || this.btc_readStatus;
            this.curr_readStatus = this.btc_readStatus;
            break;
          default:
            break;
        }

      },
      changeType(item) {
        if (item.checked) {
          this.currencyType = item.name;
          this.selectPromptFlag = false;
          // TODO:记录 当前currencyType
          localStorage.setItem('wallet_system', this.currencyType);
          this.reset();
        }
      },
      selectPromptShow() {
        this.selectPromptFlag = true;
      },
      selectPromptClose() {
        this.selectPromptFlag = false;
      },
      copyWalletAddress() {
        if (this.backupStatus == '1') {
          this.$router.push({
            path: '/backWarn',
            query: {
              type: this.currencyType,
            },
          });
        } else {
          this.$router.push({
            path: '/receipt_code',
            query: {
              address: this.currentWallet.address,
            },
          });
        }
      },
      getCurrentWallet() {

        //TODO: 增加钱包管理的实现
        /*
        *  1.新增更新钱包方法
        *  2.新增获取人民币总金额方式
        *
        * */


        this.currentWallet = null;
        switch (this.currencyType) {
          case 'ETH':
            if (this.common.Wallet.getCurrWallet()) {
              this.currentWallet = this.common.Wallet.getCurrWallet();
              console.log('当前ETH钱包', this.currentWallet);
              // TODO: 获取备份状态
              this.backupStatus = this.$Tool.$zjc_backups(this.currentWallet.address);
              //TODO: 获取Tokens、balance
              this.getTokens();
            } else {
              this.$router.push({
                path: '/create',
              });
            }
            break;
          case 'BTC':
            if (this.btcCommon.BtcWallet.getCurrWallet()) {
              this.currentWallet = this.btcCommon.BtcWallet.getCurrWallet();
              console.log('当前BTC钱包', this.currentWallet);
              // TODO: 获取备份状态
              this.backupStatus = this.$Tool.$zjc_backups(this.currentWallet.address);
              //TODO: 获取Tokens、balance
              this.getTokens();
            } else {
              this.$router.push({
                path: '/create',
              });
            }
            break;
          default:
            break;
        }
        return this.currentWallet;
      },
      getAllWallets() {
        switch (this.currencyType) {
          case 'ETH':
            this.currencyWallets = JSON.parse(localStorage.getItem('eth_wallets')) || [];
            break;
          case 'BTC':
            this.currencyWallets = JSON.parse(localStorage.getItem('btc_wallets')) || [];
            break;
          default:
            break;
        }
      },
      getTokens() {

        if (this.currentWallet) {
          let key = '_getTokens' + this.currentWallet.address;
          switch (this.currencyType) {
            case 'ETH':
              this.walletList.ETH = $Store.state.getApiCache(key) || [];

              this.totalBalance.ETH = $Store.state.getApiCache(key + '_totalBalance') || 0;
              if (!this.ethToggle) {
                this.ethToggle = true;
                this.currentWallet.getTokens((err, data) => {
                  let list = ['btc', 'usdt'];
                  let _data = data;

                  console.log('data=====================',_data);
                  if (_data.length) {
                    _data.forEach((value) => {
                      list.push(value.symbol.toLocaleLowerCase());
                    });
                  }
                  this.TokenList = list;
                  //TODO: 获取币种率


                  this.queryPrice(this.TokenList,() => {
                    if (this.currencyType === 'ETH') {
                      let _sum = 0,_cny = 0,_cnySum = 0,_usd = 0,_usdSum = 0;
                      if (_data.length) {
                        _data.forEach((value) => {
                          value.realBalance = new Decimal(value.balance).mul(new Decimal(this.priceRateSet[value.symbol][this.priceRateType])).toNumber();
                          _cny = Decimal(value.balance).mul(new Decimal(this.priceRateSet[value.symbol]['cny'])).toNumber();
                          _usd = Decimal(value.balance).mul(new Decimal(this.priceRateSet[value.symbol]['usd'])).toNumber();
                          _sum = new Decimal(_sum).add(new Decimal(value.realBalance)).toNumber();
                          _cnySum = new Decimal(_cnySum).add(new Decimal(_cny)).toNumber();
                          _usdSum = new Decimal(_usdSum).add(new Decimal(_usd)).toNumber();
                        });
                      }
                      this.totalBalance.ETH = _sum;
                      this.walletList.ETH = _data;

                      // TODO: 更新ETH钱包结合 用来增加余额
                      this.currentWallet.cnyBalance = _cnySum;
                      this.currentWallet.usdBalance = _usdSum;
                      this.currentWallet.updateWallets();
                      // TODO: 数据缓存
                      $Store.state.setApiCache(key, JSON.parse(JSON.stringify(this.walletList.ETH)));
                      $Store.state.setApiCache(key + '_totalBalance', JSON.parse(JSON.stringify(this.totalBalance.ETH)));
                    }
                    this.ethToggle = false;
                  });
                });
              }

              break;
            case 'BTC':
              var _itemBtc = {balance: 0, symbol: this.currencyType};

              this.totalBalance.BTC = $Store.state.getApiCache(key + '_totalBalance') || 0;
              //TODO: 缓存待处理
              this.walletList.BTC = $Store.state.getApiCache(key) || [];
              let btcWalletList = [];
              // let totalBalance = 0;
              let _sum = 0,_cny = 0,_cnySum = 0,_usd = 0,_usdSum = 0;

              // TODO: 新获取余额方式
              if (!this.btcToggle) {
                this.btcToggle = true;
                this.currentWallet.getBalanceNew(this.currentWallet.address, this.BTC_confirmations, (res) => {
                  console.log('new BTC------', res);
                  this.btcToggle = false;
                  if (res.status === 200) {
                    if (this.currencyType === 'BTC') {
                      _itemBtc.balance = res.data;
                      _itemBtc.realBalance = new Decimal(_itemBtc.balance).mul(

                        new Decimal(this.priceRateSet[_itemBtc.symbol][this.priceRateType])).toNumber();
                      _cny = new Decimal(_itemBtc.balance).mul(
                        new Decimal(this.priceRateSet[_itemBtc.symbol]['cny'])).toNumber();
                      _usd = new Decimal(_itemBtc.balance).mul(
                        new Decimal(this.priceRateSet[_itemBtc.symbol]['usd'])).toNumber();

                      _sum = new Decimal(_sum).add(new Decimal(_itemBtc.realBalance)).toNumber();
                      _cnySum = new Decimal(_cnySum).add(new Decimal(_cny)).toNumber();
                      _usdSum = new Decimal(_usdSum).add(new Decimal(_usd)).toNumber();


                      btcWalletList.push(_itemBtc);

                      // 1FoWyxwPXuj4C6abqwhjDWdz6D4PZgYRjA
                      let address = this.currentWallet.address;
                      switch (process.env.BTC_NET) {
                        case 'mainnet':

                          $USDT.getAddrV2(`addr=${address}` , (res) => {
                            let balance = res.data[address].balance;
                            let usdtObj = {
                              balance: 0,
                              symbol: 'USDT',
                              realBalance: 0,
                            };

                            for (let i = 0; i < balance.length; i++) {
                              if (balance[i].id == '31') {
                                usdtObj.symbol = 'USDT';
                                usdtObj.realBalance = new Decimal(balance[i].value).mul(

                                  new Decimal(this.priceRateSet['USDT'][this.priceRateType])).toNumber();
                                _cny = new Decimal(balance[i].value).mul(
                                  new Decimal(this.priceRateSet['USDT']['cny'])).toNumber();
                                _usd = new Decimal(balance[i].value).mul(
                                  new Decimal(this.priceRateSet['USDT']['usd'])).toNumber();


                                usdtObj.balance = balance[i].value;
                                _sum = new Decimal(_sum).add(
                                  new Decimal(usdtObj.realBalance)).toNumber();
                                _cnySum = new Decimal(_cnySum).add(new Decimal(_cny)).toNumber();
                                _usdSum = new Decimal(_usdSum).add(new Decimal(_usd)).toNumber();
                              }
                            }
                            btcWalletList.push(usdtObj);
                            this.totalBalance.BTC = _sum;

                            // TODO: 更新BTC钱包结合 用来增加余额
                            this.currentWallet.cnyBalance = _cnySum;
                            this.currentWallet.usdBalance = _usdSum;
                            this.currentWallet.updateWallets();

                            this.walletList.BTC = btcWalletList;
                            $Store.state.setApiCache(key, JSON.parse(JSON.stringify(this.walletList.BTC)));
                            $Store.state.setApiCache(key + '_totalBalance', JSON.parse(JSON.stringify(this.totalBalance.BTC)));
                          });
                          break;
                        case 'testnet':
                          this.currentWallet.getUsdtBalance(address,(res) => {
                            console.log('usdt_res========',res);
                            let usdtObj = {
                              balance: 0,
                              symbol: 'USDT',
                              realBalance: 0,
                            };
                            usdtObj.balance = res.data.value;

                            usdtObj.realBalance = new Decimal(usdtObj.balance).mul(new Decimal(this.priceRateSet['USDT'][this.priceRateType])).toNumber();
                            _cny = new Decimal(usdtObj.balance).mul(new Decimal(this.priceRateSet['USDT']['cny'])).toNumber();
                            _usd = new Decimal(usdtObj.balance).mul(new Decimal(this.priceRateSet['USDT']['usd'])).toNumber();

                            _sum = new Decimal(_sum).add(new Decimal(usdtObj.realBalance)).toNumber();
                            _cnySum = new Decimal(_cnySum).add(new Decimal(_cny)).toNumber();
                            _usdSum = new Decimal(_usdSum).add(new Decimal(_usd)).toNumber();

                            btcWalletList.push(usdtObj);
                            this.totalBalance.BTC = _sum;
                            this.walletList.BTC = btcWalletList;

                            // TODO: 更新BTC钱包结合 用来增加余额
                            this.currentWallet.cnyBalance = _cnySum;
                            this.currentWallet.usdBalance = _usdSum;
                            this.currentWallet.updateWallets();

                            $Store.state.setApiCache(key, JSON.parse(JSON.stringify(this.walletList.BTC)));
                            $Store.state.setApiCache(key + '_totalBalance', JSON.parse(JSON.stringify(this.totalBalance.BTC)));
                          });
                          break;
                        default:
                          break
                      }
                    }
                  }
                });
              }


              // TODO: 旧获取余额方式
              // this.currentWallet.getBalance(this.currentWallet.address, (err, balance) => {
              //   console.log('balance------------', balance);
              //   _itemBtc.balance = balance;
              //   // 无usdt时 总资产 === btc币种资产
              //   this.balance = balance;
              //   // TODO: 上一次记录待确定
              //   // this.lastBtcBalance = this.balance;
              // });
              break;
            default:
              break;
          }
        }
      },
      walletDetail() {
        this.$router.push({
          path: '/wallet_details',
          query: {
            type: this.currencyType,
          },
        });
      },
      addToken() {
        this.$router.push({
          path: '/addtoken',
          query: {
            type: this.currencyType,
          },
        });
      },
      // 货币 金额 换算

      queryPrice(list,callback) {
        console.log(this.TokenList, 'this.TokenList');
        // TODO: 可增加this.priceRateSet
        this.TokenList = list || this.TokenList;
        this.$ethServerApi.queryPrice(this.TokenList, (res) => {
          if (res.status_code === 200) {
            res.data.forEach((value) => {
              this.priceRateSet[value.asset.toUpperCase()] = value.prices;
            });
            console.log('this.priceRateSet====', this.priceRateSet);

            if(callback)callback();
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
      createDB() {
        // TODO: 数据库创建
        this.systemNoticeDB = new CreateDB();

        this.systemNoticeDB.openDB({name: 'SystemNotice', keyPath: 'id', status: 'readwrite'}, (data) => {
          console.log('当前数据集合', data);
          // TODO: 创建socket连接
          this.createSockete();
          // TODO: 创建长轮询
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
                      }
                    });
                  }else {
                    console.log('txid重复 不写入');
                  }
                },{txid:_data.txid});
              });

            } else {

              _data.type = 'Receive';
              _data.assetType = 'ETH';
              _data.value = 1000;
              _data.txid = '0xb4e0ed7ab1be0f98c5deca1497cd1db885460abe080c29a6750cdc3debdacf76';
              _data.time = 152618282;
              _data.address = '0xd03ea8624c8c5987235048901fb614fdca89b117';
              _data.readStatus = false;

              this.systemNoticeDB.indexGetData((val) => {
                if (val > 0) {
                  _data.id = val;
                  this.systemNoticeDB.add(_data, {name: 'SystemNotice', keyPath: 'id', status: 'readwrite'}, (res) => {
                    if (localStorage.getItem('noticeReadStatus') !== 'Y') {
                      localStorage.setItem('noticeReadStatus','Y');
                    }
                  });
                }else {
                  console.log('txid重复 不写入');
                }
              },{txid:_data.txid});
            }
          }
        });
      },
      setting() {
        this.$router.push({
          path: '/setting',
          query: {
            type: this.currencyType,
          },
        });
      },

    },
    mounted() {


      // TODO:禁止选中
      document.onselectstart = function(){
        event.returnValue = false;
      };

      this.$nextTick(()=>{             this.$indicator.close();           });
      //TODO: 获取当前currencyType
      this.currencyType = this.$route.query.type ? this.$route.query.type : localStorage.getItem('wallet_system')
          ? localStorage.getItem('wallet_system')
          : 'ETH';
      localStorage.setItem('wallet_system', this.currencyType);

      //TODO: 获取实体币类型
      this.priceRateType = localStorage.getItem('priceRateType')
          ? localStorage.getItem('priceRateType')
          : this.priceRateType;

      //TODO: 获取消息状态
      this.getReadStatus();

      //TODO: 默认获取queryPrice
      this.queryPrice();

      //TODO: 获取当前币种所有钱包
      this.getAllWallets();

      //TODO: 获取当前钱包
      this.getCurrentWallet();

      //TODO: 获取Tokens、balance
      // this.getTokens();

      // TODO: 创建/开启数据库
      // this.createDB();


      // ******************************************************************************

    },
    destroyed() {
      // if (this.btcSocket) {
      //   this.btcSocket.onclose();
      //   this.btcSocket = null;
      // }
      // if (this.ethPoll) {
      //   this.ethPoll.cancelPoll = true;
      //   if (this.ethPoll.timer) {
      //     clearTimeout(this.ethPoll.timer);
      //     this.ethPoll.timer = null;
      //   }
      //
      //   this.ethPoll = null;
      // }
    },
    components: {
      Sidebar,
      Prompt,
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
    .Index {
        width: 100%;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
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

    .walletHead {
        width: 100%;
        height: 5.24rem;
        background-color: #374466;
        color: #ffffff;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 99;
    }

    .system {
        position: relative;
        width: 1.6rem;
        margin: 0 auto 0;
        top: 0.19rem;
        padding: 0.05rem;
        font-size: 0.38rem;
        font-weight: bold;
        color: rgba(255, 255, 255, 1);
        line-height: 0.53rem;
        text-align: center;
        /*background-color: aqua;*/

    }

    .system .down_icon {
        content: '';
        position: absolute;
        right: 0.1rem;
        top: 0.14rem;
        width: 0.17rem;
        height: 0.17rem;
        border-top: 1px solid;
        border-right: 1px solid;
        transform: rotateZ(135deg);
        border-color: rgba(215, 217, 224, 1);
        z-index: 99;
    }

    .system_show {
        font-size: 0.30rem;
        font-weight: 500;
        color: rgba(153, 153, 153, 1);
        line-height: 0.42rem;
        margin-top: 0.15rem;
        margin-left: 0.33rem;
    }

    .walletName {
        margin: 0.37rem auto 0 auto;
        width: 5rem; /*必须设置宽度*/
        text-align: center;
        height: 1.19rem;
        font-size: 0.85rem;
        font-weight: 800;
        color: rgba(255, 255, 255, 1);
        line-height: 1.19rem;
        overflow: hidden; /*溢出隐藏*/
        text-overflow: ellipsis; /*以省略号...显示*/
        white-space: nowrap; /*强制不换行*/
    }

    .walletNameTop {
        margin-top: 0.8rem;
    }

    .walletAddress {

        height: 0.50rem;

        font-size: 0.33rem;
        font-weight: bold;
        color: rgba(255, 255, 255, 1);
        line-height: 0.5rem;
        text-align: center;
        margin: 0.06rem auto;
    }

    .walletAmount {
        width: 4.5rem;
        position: absolute;
        bottom: 0.38rem;
        left: 0.3rem;
    }

    .walletAmount > p {
        font-size: 0.22rem;
        color: rgba(255, 255, 255, 1);
        line-height: 0.30rem;
        margin-left: 0.29rem;
    }

    .walletAmount > p > span {
        font-size: 0.48rem;
        font-weight: 600;
        line-height: 0.67rem;
        color: rgba(255, 255, 255, 1);
    }

    .img_erm {
        width: .24rem;
        height: .24rem;
        /*vertical-align: middle;*/
        /*margin-left: 0.1rem;*/
        position: absolute;
        top: 50%;
        margin-top: -0.14rem;
        margin-left: 0.13rem;
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

    .add_system {
        background: url("../assets/common/img/icon_tianjia@2x.png") no-repeat;
        background-size: 100% 100%;
        width: 0.59rem;
        height: 0.59rem;
        position: absolute;
        bottom: 0.49rem;
        right: 0.2rem;
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
        background: url("../assets/common/img/icon_tab_eht_pre.png") no-repeat;
        background-size: cover;

        vertical-align: middle;
        margin-right: 0.25rem;
    }

    .tab li span.little_icon_btc {
        display: inline-block;
        width: 0.34rem;
        height: 0.34rem;
        background: url("../assets/common/img/icon_tab_btc_pre.png") no-repeat;
        background-size: cover;

        vertical-align: middle;
        margin-right: 0.25rem;
    }

    .showWallet {
        display: block !important;
    }

    .tab li.selected span.little_icon_btc {
        background: url("../assets/common/img/icon_tab_btc.png") no-repeat;
        background-size: cover;
    }

    .tab li.selected span.little_icon_eth {
        background: url("../assets/common/img/icon_tab_eht.png") no-repeat;
        background-size: cover;
    }

    .walletContent {
        height: 100%;
        padding-top: 5.3rem;
        background-color: #F6F6F6;
        overflow-y: scroll;
        box-sizing: border-box;
        flex: auto;
    }

    .divinp {
        width: 7rem;
        height: 1.4rem;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0rem 0rem 0.11rem 0rem rgba(240, 240, 240, 1);
        border-radius: 0.17rem;
        margin: 0.2rem auto;
    }

    .divinp > span {
        line-height: 1.4rem;
        font-size: 0.38rem;
        color: rgba(74, 74, 74, 1);
    }

    .divinp > span:nth-child(1) {
        float: left;
        margin-left: 0.39rem;
        font-weight: 600;
    }

    .divinp > span:nth-child(2) {
        margin-left: 0.26rem;
        font-weight: 600;
    }

    .divinp .priceC {
        float: right;
        height: 0.9rem;
        margin: 0.25rem 0.55rem 0 0;
        text-align: right;
    }

    .divinp .priceC div {
        font-weight: 500;
        height: 0.45rem;
        line-height: 0.45rem;
        font-size: 0.38rem;
        color: rgba(74, 74, 74, 1);
    }

    .divinp .priceC div:nth-child(2) {
        font-size: 0.22rem;
        color: rgba(155, 155, 155, 1);
    }

    /*侧边栏开始*/
    .menuBtn {
        position: absolute;
        right: 0.3rem;
        top: 0.27rem;
        width: 0.33rem;
        height: 0.31rem;
        background: url("../assets/common/img/icon_shezhi@2x.png") no-repeat;
        background-size: cover;
    }

    .setting {
        position: absolute;
        left: 0.29rem;
        top: 0.25rem;
        width: 0.4rem;
        height: 0.39rem;
        background: url("../assets/common/img/icon_caidan_shezhi@2x.png") no-repeat;
        background-size: cover;
    }

    .modal.left .modal-dialog, .modal.right .modal-dialog {
        position: fixed;
        margin: auto;
        width: 4.94rem;
        height: 100%;
        -webkit-transform: translate3d(0%, 0, 0);
        -ms-transform: translate3d(0%, 0, 0);
        -o-transform: translate3d(0%, 0, 0);
        transform: translate3d(0%, 0, 0);
    }

    .modal.left .modal-content, .modal.right .modal-content {
        height: 100%;
        overflow-y: auto;
    }

    /*Left*/
    .modal.left.fade .modal-dialog {
        left: -6.4rem;
        -webkit-transition: opacity 0.3s linear, left 0.3s ease-out;
        -moz-transition: opacity 0.3s linear, left 0.3s ease-out;
        -o-transition: opacity 0.3s linear, left 0.3s ease-out;
        transition: opacity 0.3s linear, left 0.3s ease-out;
    }

    .modal.left.fade.in .modal-dialog {
        left: 0;
    }

    /*Right*/
    .modal.right.fade .modal-dialog {
        right: -6.4rem;
        -webkit-transition: opacity 0.3s linear, right 0.3s ease-out;
        -moz-transition: opacity 0.3s linear, right 0.3s ease-out;
        -o-transition: opacity 0.3s linear, right 0.3s ease-out;
        transition: opacity 0.3s linear, right 0.3s ease-out;
    }

    .modal.right.fade.in .modal-dialog {
        right: 0;
    }

    .modal-content {
        border-radius: 0;
        border: none;
    }

    .modal-body-div {
        padding: 0;
    }

    .My_qb {
        color: black !important;
        min-height: 1.18rem;
        overflow-y: auto;
        max-height: 2.2rem;
        border-bottom: 0.01rem solid rgba(232, 232, 232, 1);
        position: relative;
        width: 100%;
        display: none;
    }

    .My_qb_div {
        margin: 0 !important;
        height: 1.18rem;
        padding: 0 !important;
        color: black !important;
        width: 100%;
    }

    .My_qb_div:hover {
        background: rgba(246, 246, 246, 1);
    }

    .My_qb_div .read {
        position: absolute;
        width: 0.21rem;
        height: 0.21rem;
        top: 0.5rem;
        left: 0.84rem;
        background-color: red;
        border-radius: 0.21rem;
    }

    .em_shuju em:focus {
        outline: none;
    }

    /*侧边栏结束*/

    .cuo {
        width: 1rem;
        height: 1rem;
    }

    .div_img img {
        width: .3rem;
    }

    .top {
        width: 100%;
        height: 4rem;
        background-size: cover;
    }

    /*p {*/
    /*font-family: PingFangSC-Semibold;*/
    /*color: rgba(255, 255, 255, 1);*/
    /*}*/

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

    span {
        line-height: 1.4rem;
        font-size: 0.38rem;
        color: rgba(74, 74, 74, 1);
    }

    .sj_img {
        width: .7rem;
        height: .95rem;
    }

    .em_shuju {
        font-size: 0.3rem;
        line-height: 1.05rem;
        display: inline-block;
        height: 1rem;
        width: 4rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /*弹框开始*/
    .modals {
        width: 5.89rem;
        height: 4.4rem;
        background: rgba(251, 251, 251, 1);
        border-radius: 0.18rem;
        margin-top: 3rem;
        position: absolute;
        z-index: 100000;
        left: 50%;
        top: 15%;
        transform: translate(-50%, -50%);
    }

    .modals div {
        color: rgba(0, 0, 0, 1);
    }

    .modals div:nth-child(1) {
        font-size: 0.38rem;
        text-align: center;
        line-height: 1.4rem;
    }

    .modals div:nth-child(2) {
        font-size: 0.3rem;
        line-height: 0.42rem;
        margin: 0.1rem 0.45rem 0.2rem;
    }

    .modals button {
        width: 4.8rem;
        height: 0.8rem;
        background: rgba(48, 125, 243, 1);
        border-radius: 0.5rem;
        margin: 0.5rem;
        border: none;
        font-size: 0.36rem;
        color: rgba(255, 255, 255, 1);
    }

    .buttons {
        position: absolute;
        z-index: 100000;
        left: 50%;
        top: 60%;
        transform: translate(-50%, -50%);
        background: none;
        border: none;
    }

    /*弹框结束*/

    /*显示隐藏*/
    .modal_diva {
        position: absolute;
    }

    .a {
        display: none
    }

    .b {
        width: 7.5rem;
        height: 16.34rem;
        background: rgba(0, 0, 0, 0.43);
        display: none;
        margin-top: -40%;
    }

    .cc {
        display: block;
    }

    .symbol_icon_eth_little {
        display: inline-block;
        width: 0.34rem;
        height: 0.34rem;
        background: url("../assets/common/img/icon_tab_eht_pre.png") no-repeat;
        background-size: cover;
        margin-left: 0.27rem;
        margin-top: 0.33rem;
    }
</style>
