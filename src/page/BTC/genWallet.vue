<template>
  <div>
    <input type="text" placeholder="钱包名字" id="username">
    <input type="password" placeholder="钱包密码" id="password">
    <button id="btn" @click="create()">创建钱包</button>

  </div>
</template>

<script>
  import $ from 'jquery';
  import {$USDT} from '../../api/BTC/USDT';
  import {Validator} from '../../api/common/validator';
  import {ServerApi} from '../../api/BTC/serverApi';
  // import trans from '../../api/BTC/myUsdtWallet';

  export default {
    name: 'genWallet',
    data() {
      return {
        text: '',
        balance: '',
      };
    },
    methods: {
      create() {
        this.userName = $('#username').val();
        this.text = $('#pwdPrompt').val();
        this.password = $('#password').val();

        this.test();
      },
      test() {
        var _this = this;

        // 创建钱包
        // _this.btcCommon.BtcWallet.genAddress(_this.password,_this.userName,_this.text,function (err,btcWallet) {
        //   console.log(btcWallet.address);
        //   console.log(_this.password);
        //   console.log(_this.userName);
        // });

        // 通过私钥导入
        // _this.btcCommon.BtcWallet.importByPrivate(_this.password,"KxkZaxX97nyLFkuhcXiyJv6JtE7fZumwsZeqB3EsdEn42egUuD9D",function (err,wallet) {
        //   console.log(wallet.address);
        // });

        // 通过助记词导入
        // _this.btcCommon.BtcWallet.importByMnemonic(_this.password, "crime invite cactus change ensure deputy suit vivid mutual elder property auto",function (err,wallet) {
        //   console.log(wallet.address);
        // })

        // 通过keystore导入
        // var key = {"address":"79ca005b2ac34d87757c59606fa96a22d17ce988","crypto":{"cipher":"aes-128-ctr","ciphertext":"ef89f5f9c280fe30c55f2aeee82197621bc1e0c1ca217f8a475ce9c8ea0eda11","cipherparams":{"iv":"837dcfa90f99b01334da935bd67ede83"},"mac":"0cb336753515795de313d14e4b9bd88646da0b7f23a6746168c5806294014a85","kdf":"pbkdf2","kdfparams":{"c":262144,"dklen":32,"prf":"hmac-sha256","salt":"ccf57562c0a043fa378504e2bf2f41cdc127ff0a711f9b1b8ffef2f68e68cbba"}},"id":"4c9b826b-f56e-495d-91c5-2513f7858b03","version":3}
        // _this.btcCommon.BtcWallet.importFromKeyStore(_this.password, key,function (err,wallet) {
        //   console.log(wallet.address);
        // })

        // 查询utxo---正式环境
        // _this.btcCommon.BtcWallet.getUtxoMainnet("1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY");    // prototype is not a function
        // _this.btcCommon.BtcWallet.getUtxoMainnet("1MoxemSasRDVMKPJpYu97u2kH8k7RLde1J");    // unpent 0

        // 交易---正式环境
        // _this.btcCommon.BtcWallet.transtionCopy("L5nvefhBaDXdpxHacx7WgGLpxFtif6LPin7cuZaDZJbCguXfgU17","1BRG6GZBQgmeuZxxiidaB7RNSuu82jeQhT",1200);
        //
        // 导出 助记词
        // var wallet = _this.btcCommon.BtcWallet.getCurrWallet();
        // var mmm =_this.btcCommon.BtcWallet.genMnemonic("","1QAHcZ4FdpY77Zuh4jWxcAXFBNLnf2v2xL",function(err, mnemonic){});
        // localStorage.setItem('btc_backups_s',mmm)

        // 导出私钥
        // var wif = _this.btcCommon.BtcWallet.getPrivateKey("aa","19sLofNhsw2RUaajzJ1cb7Qts1puegcnKP",function (err, aa) { });
        // console.log("成功了吗？===",wif);

        // 修改密码
        // _this.btcCommon.BtcWallet.setPassword("aa","aaaa","19sLofNhsw2RUaajzJ1cb7Qts1puegcnKP",function (err,aa) {
        //
        //  })
        //  console.log("成功了吗？===");

        // 删除钱包
        // _this.btcCommon.BtcWallet.delete("19sLofNhsw2RUaajzJ1cb7Qts1puegcnKP");
        //  console.log("成功了吗？===");

        // _this.btcCommon.BtcWallet.trans();

        // console.log(Validator.isValidAdderssBtc("mpV6c9gUH647Q76Rjbn4U5etD7WLdK7KtY"));
      },
      getAddr() {
        // TODO 获取用户的地址对应的余额
        $USDT.sendHttp('https://api.omniwallet.org/v1/address/addr', 'post', {
          addr: '1FoWyxwPXuj4C6abqwhjDWdz6D4PZgYRjA',
        }, (res) => {
          console.log(res);
        });
      },
      //    返回多个地址的余额信息
      getAddrV2(){
        // $USDT.getAddrV2()
      },
      getDetails() {
        // TODO 返回给定地址的余额信息和交易历史记录列表/transaction/address
        $USDT.sendHttp('/v1/transaction/address', 'post', {
          addr: '1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P',
        }, (res) => {
          console.log(res);
        });
      },

      // 测试环境余额
      // http://10.10.212.187:8097/usdt/getBalanceTestnet?address=addresString

      getBalanceUsdt(){
        $USDT.sendHttp('/usdt/getBalanceTestnet','post',{address:"mx652Ais2SAwQYtC641uViyR99hs8EKzCh"},function (err,res) {
          if(err){
            console.log(err);
            return;
          }else {
            console.log(res);
          }
        });
      },

      // 历史记录 （测试环境）
      // http://10.10.212.187:8097/usdt/getBalanceTestnet?address=addresString
      getUtxo() {
        $USDT.sendHttp('/usdt/getTransactionTestnet','post',{address:"mx652Ais2SAwQYtC641uViyR99hs8EKzCh",page:"0"},function (err,res) {
          if(err){
            console.log(err);
            return;
          }else {
            console.log(res);
          }
        })
      },

      // 转账 旷工费 （测试环境）
      // BTC 查询 utxo, 旷工费 为 btc 的
      calBtcGasFee(address, gasFee, value, callback) {

        ServerApi.getBtcUnspent(address /*"1KFHE7w8BhaENAswwryaoccDb6qcT6DbYY"*/, function(err, response) {
          if (err) {
            callback(err, null);
            return;
          }
          console.log('response===', response.data.unspent_outputs);

          var unspent = response.data.unspent_outputs;
          console.log('unspent===', unspent);
          if (unspent.length <= 0) {
            console.log('无可用的 unspent');
            callback('无可用的 unspent', null);
            return;
          }

          // value *= 100000000;   // 转账金额格式化

          var money = value;
          var totalMoney = 0;

          var inputNum = 0;
          var outputNum = 0;

          console.log(money);

          for (var i = 0; i < unspent.length; i++) {
            if (unspent[i].value < money) {
              money -= unspent[i].value;
              totalMoney += unspent[i].value;
              console.log('value===', money);
              inputNum++;
            } else {
              totalMoney += unspent[i].value;
              console.log('totalMoney===', totalMoney);
              inputNum++;
              outputNum += 2;

              // 旷工费：148 * 输入数量 + 34 * 输出数量 + 10
              gasFee = gasFee * (148 * inputNum + 34 * outputNum + 10);
              console.log('旷工费', gasFee);

              // console.log('success fee');
              break;
            }
          }
          console.log(gasFee);
          callback(null, gasFee);
        });
      },

      // 转账 签名 （测试环境）
      usdttransition(){
        // trans();
      }


  },
    mounted() {
      // this.getAddr();
      // this.getDetails();
      // this.getDetails();
      // this.getAddrV2()
      // this.getBalanceUsdt();
      // this.getBalanceUsdt();
      // this.getUtxo();
      // this.calBtcGasFee("mtFLhMr1ybZJ1XrS9MNFivqL3NiGasVW5k","35","100",function (res) {
      //   console.log(res);
      // })
      // this.usdttransition();
      // console.log(this.$Tool.$getRanNum());
      // this.$Tool.$Toast("hhh");
    },
  };
</script>

<style scoped>

</style>
