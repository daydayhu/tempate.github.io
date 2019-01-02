<template>
    <div style="height: 100%;">
        <div class="top_nav">
            <div class="back_icon" @click="back"></div>
            <p>{{currentWallet && currentWallet.walletName}}</p>
        </div>
        <div class="content_color">
            <div class="content_list">
              <router-link :to="{path:'/wallet_name',query:{type: this.$route.query.type, wname: currentWallet}}">
                <div class="w_div">
                  <span>钱包名</span>
                  <span class="floatr">{{currentWallet && currentWallet.walletName}}</span>
                  <img class="img_jt" src="../../assets/common/img/jiantouyou@2x.png">
                </div>
              </router-link>
              <router-link :to="{path:'/modify',query:{type: this.$route.query.type}}">
                <div class="w_div">
                  <span>修改密码</span>
                  <img class="img_jt" src="../../assets/common/img/jiantouyou@2x.png">
                </div>
              </router-link>
              <div class="w_div" @click="resetInput(1)">
                <span>导出私钥</span>
                <img class="img_jt" src="../../assets/common/img/jiantouyou@2x.png">
              </div>
              <div class="w_div" @click="resetInput(2)">
                <span>导出Keystore</span>
                <img class="img_jt" src="../../assets/common/img/jiantouyou@2x.png">
              </div>
              <div class="w_div" v-if="zjc ==='y' || zjc =='4'" @click="resetInput(3)">
                <span>备份助记词</span>
                <img class="img_jt" src="../../assets/common/img/jiantouyou@2x.png">
              </div>
            </div>

            <button v-if="zjc === '1'" @click="resetInput(3)">备份助记词</button>
            <!--<button :class="{btn_last:!back_zjc}" class="del" @click="resetInput(5)">删除钱包</button>-->
            <button class="del" @click="resetInput(5)">删除钱包</button>
        </div>

        <prompt :promptType="3" v-show='privateShow' @maskcallback="privateFun" @confirmcb="privatecb"></prompt>
        <prompt :promptType="3" v-show="promptShow" @maskcallback="maskcallback" @confirmcb="confirmcb"></prompt>
        <prompt :promptType="3" v-show="mnemonic" @maskcallback="mnemonicFun" @confirmcb="mnemoniccb"></prompt>
        <prompt :promptType="5" v-show="propShow" @maskcallback="propFun" @confirmcb="propcb"></prompt>

    </div>
</template>
<script>


  import prompt from '../../components/prompt/index';

  export default {
    components: {
      prompt,
    },
    data() {
      return {
        currencyType: '',
        as: false,
        uname: '',
        zjc: '',
        canBackUp: 'xxx',
        promptShow: false,
        privateShow: false,
        mnemonic: false,
        propShow: false,
        currentWallet: null,
      };
    },
    methods: {
      maskcallback() {
        this.promptShow = false;
      },
      privateFun() {
        this.privateShow = false;
      },
      mnemonicFun() {
        this.mnemonic = false;
      },
      propFun() {
        this.propShow = false;
      },
      confirmcb(val) {
        this.$indicator.open();

        if (val == '') {
          this.$nextTick(()=>{             this.$indicator.close();           });
          this.$Tool.$Toast('请输入密码');
        } else {

          var flag = this.$route.query.type;
          if (flag === 'ETH') {
            setTimeout(() => {
              var wallet = this.common.Wallet.getCurrWallet();
              wallet.getKeystore(val, (err, k) => {
                if (err) {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  this.promptShow = true;
                  this.$Tool.$Toast('密码错误');
                } else {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  localStorage.setItem('keystore_s', k);
                  this.$router.push({path: '/keystore', query: {type: this.$route.query.type}});
                }
              });
            }, 1000);
          } else if (flag === 'BTC') {
            setTimeout(() => {
              var wallet = this.btcCommon.BtcWallet.getCurrWallet();
              wallet.getKeystore(val, (err, k) => {
                if (err) {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  this.promptShow = true;
                  this.$Tool.$Toast('密码错误');
                } else {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  localStorage.setItem('keystore_s', k);
                  this.$router.push({path: '/keystore', query: {type: this.$route.query.type}});
                }
              });
            }, 1000);
          }

        }
      },
      privatecb(val) {
        this.$indicator.open();
        if (val == '') {
          this.$Tool.$Toast('请输入密码');
          this.$nextTick(()=>{             this.$indicator.close();           });
        } else {
          // var flag = localStorage.getItem('wallet_system');
          var flag = this.$route.query.type;
          if (flag === 'ETH') {
            setTimeout(() => {
              var wallet = this.common.Wallet.getCurrWallet();
              console.log('pwd;' + val);
              wallet.exportPrivateKey(val, wallet.getAddress(), (err, data) => {
                if (err) {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  this.$Tool.$Toast('密码错误');
                  this.privateShow = true;
                } else {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  localStorage.setItem('addsa_s', data);
                  this.$router.push({path: '/private_key', query: {type: this.$route.query.type}});
                }
              });
            }, 1000);
          } else {
            setTimeout(() => {
              var wallet = this.btcCommon.BtcWallet.getCurrWallet();
              wallet.getPrivateKey(val, wallet.getAddress(), (err, data) => {
                if (err) {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  this.$Tool.$Toast('密码错误');
                  this.privateShow = true;
                } else {
                  this.$nextTick(()=>{             this.$indicator.close();           });
                  localStorage.setItem('addsa_s', data);
                  this.$router.push({path: '/private_key', query: {type: this.$route.query.type}});
                }
              });
            }, 1000);
          }
        }
      },
      mnemoniccb(val) {
        this.$indicator.open();

        if (val == '') {
          this.$nextTick(()=>{             this.$indicator.close();           });
          this.$Tool.$Toast('请输入密码');
        } else {
          // TODO: 密码获取
          var flag = localStorage.getItem('wallet_system');
          if (flag === 'ETH') {
            setTimeout(() => {
              var wallet = this.common.Wallet.getCurrWallet();
              var addressMnem = wallet.genMnemonic(val, wallet.getAddress(), function(err, mnemonic) {});
              if (!addressMnem) {
                this.$nextTick(()=>{             this.$indicator.close();           });
                this.mnemonic = true;
                this.$Tool.$Toast('密码错误');
              } else {

                this.$store.commit('password', val);
                this.$router.push({path: '/backups', query: {type: this.$route.query.type, backups_text: addressMnem}});
              }
            }, 1000);
          } else if (flag === 'BTC') {
            setTimeout(() => {
              var wallet = this.btcCommon.BtcWallet.getCurrWallet();
              var addressMnem = wallet.genMnemonic(val, wallet.getAddress(), function(err, mnemonic) {});
              console.log(addressMnem);
              if (!addressMnem) {
                this.$nextTick(()=>{             this.$indicator.close();           });
                this.mnemonic = true;
                this.$Tool.$Toast('密码错误');
              } else {
                this.$router.push({
                  path: '/backups',
                  query: {
                    type: this.$route.query.type,
                    backups_text: addressMnem,
                  },
                });

              }
            }, 1000);
          }
        }

      },
      propcb() {
        var wallet_system = localStorage.getItem('wallet_system');
        switch (wallet_system) {
          case 'ETH':
            var wallet = this.common.Wallet.getCurrWallet();
            wallet.delete();
            if (this.common.Wallet.getCurrWallet()) {
              this.$router.push({
                path: '/index',
                query: {
                  type: 'ETH',
                },
              });
            } else {
              if (this.btcCommon.BtcWallet.getCurrWallet()) {
                this.$router.push({
                  path: '/index',
                  query: {
                    type: 'BTC',
                  },
                });
                localStorage.setItem('wallet_system', 'BTC');
              } else {
                this.$router.push({path: '/login'});
                localStorage.removeItem('wallet_system')
              }
            }
            break;
          case 'BTC':
            var wallet = this.btcCommon.BtcWallet.getCurrWallet();
            wallet.delete();
            if (this.btcCommon.BtcWallet.getCurrWallet()) {
              this.$router.push({
                path: '/index', query: {
                  type: 'BTC',
                },
              });
            } else {
              if (this.common.Wallet.getCurrWallet()) {
                console.log(this.common.Wallet.getCurrWallet());
                localStorage.setItem('wallet_system', 'ETH');
                this.$router.push({
                  path: '/index', query: {
                    type: 'ETH',
                  },
                });
              } else {
                this.$router.push({path: '/login'});
                localStorage.removeItem('wallet_system')
              }
            }
            break;
          default:
            this.$router.push({path: '/login'});
            localStorage.removeItem('wallet_system')
        }
      },
      resetInput(val) {
        if (val === 1) {
          this.privateShow = true;
        } else if (val === 2) {
          this.promptShow = true;
        } else if (val === 3) {
          this.mnemonic = true;
        } else if (val === 5) {
          this.propShow = true;
        }
      },
      back() {
        // TODO: 暂时回退
        history.back();
        // this.$router.push({
        //   path: '/index',
        //   query: {
        //     type: this.currencyType,
        //   },
        // });
      },
      getCurrencyType() {
        this.currencyType = this.$route.query.type ? this.$route.query.type : localStorage.getItem('wallet_system')
            ? localStorage.getItem('wallet_system')
            : 'ETH';
      },
      getCurrentWallet() {
        switch (this.currencyType) {
          case 'ETH':
            if (this.common.Wallet.getCurrWallet()) {
              this.currentWallet = this.common.Wallet.getCurrWallet();
              console.log('当前ETH钱包', this.currentWallet);
              // TODO: 获取备份状态
              this.zjc = this.$Tool.$zjc_backups(this.currentWallet.address);
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
              this.zjc = this.$Tool.$zjc_backups(this.currentWallet.address);
            } else {
              this.$router.push({
                path: '/create',
              });
            }
        }
      },
    },
    mounted() {



      //TODO: 判断是否存在当前钱包 没有则跳转到登入页面
      this.removemodals();

      //TODO: 获取当前currencyType
      this.getCurrencyType();

      //TODO: 获取当前钱包
      this.getCurrentWallet();

      //TODO: 用于区分是否导入 待
      var isCanBackUp = localStorage.getItem('isCanBackUp:' + this.currentWallet.address);
      if (isCanBackUp === 'no') {
        this.canBackUp = null;
      }

     //TODO: 备份提醒页面进入直接输入密码备份助记词
      this.mnemonic = this.$route.query.mnemonic;
    },
    computed: {
      username() {
        return this.$store.state.username;
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
<style lang="less" scoped>
    a {
        text-decoration: none;
        outline: none;
    }

    .content_color {
      background: rgba(246,246,246,1);
      .content_list {
        background-color: #ffffff;
        margin-top: 0.4rem;
      }
    }

    .w_div {
        width: 100%;
        height: 1.2rem;
        margin-left: 0.18rem;
        border-bottom: 0.02rem solid #E6E6E6;
        position: relative;
    }

    .w_div span:nth-child(1) {
        font-size: 0.34rem;
        line-height: 1.2rem;
        margin-left: 0.57rem;
        font-weight: 600;
        color: #050505;
    }

    .w_div span:nth-child(2) {
        font-size: 0.26rem;
        color: #9B9B9B;
        line-height: 1.2rem;
        width: 3.8rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 1.06rem;
        text-align: right;
    }

    .img_jt {
        width: .16rem;
        height: .26rem;
        position: absolute;
        top: 0.5rem;
        right: 0.62rem;
    }

    /*.img_jts{  width: .3rem;  height: .3rem;  margin: 0.5rem -1.45rem 0.5rem 0;  }*/
    /*.img_jtd{  width: .3rem;  height: .3rem;  margin: 0 -2rem 0 4.55rem;  }*/
    /*.img_jtk{  width: .3rem;  height: .3rem;  margin: 0 -2rem 0 3.8rem;  }*/
    /*.img_jtb{  width: .3rem;  height: .3rem;  margin: 0 -2rem 0 4.2rem;  }*/
    button {
        position: absolute;
        left: 0.8rem;
        bottom: 2.02rem;
        width: 5.9rem;
        height: 1rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1), rgba(47, 124, 243, 1));
        border-radius: 0.6rem;
        font-size: 0.4rem;
        color: rgba(255, 255, 255, 1);
        /*margin: 2rem 0.8rem 0rem 0.8rem;*/
        border: none;

    }

    button.btn_last {
        margin: 0.52rem 0.8rem;
    }

    button.del {
        bottom: 0.5rem;
        border: 0.03rem solid #616E91;
        background: inherit;
        color: rgba(97, 110, 145, 1);
    }

    .titles {
        width: 100%;
        font-size: 0.38rem;
        text-align: center;
        display: block;
        font-weight: 500;
        color: rgba(0, 0, 0, 1);
    }

    .w_div_o1 {
        width: 7.5rem;
        height: 1rem;
        padding: -2rem 0 0 0;
        background: beige;
        margin: 0 auto;
        opacity: 0;
        position: absolute;
        top: 3.35rem;
    }

    .w_div_o2 {
        width: 7.5rem;
        height: 1rem;
        padding: -2rem 0 0 0;
        background: beige;
        margin: 0 auto;
        opacity: 0;
        position: absolute;
        top: 4.6rem;
    }

    .w_div_o3 {
        width: 7.5rem;
        height: 1rem;
        padding: -2rem 0 0 0;
        background: beige;
        margin: 0 auto;
        opacity: 0;
        position: absolute;
        top: 5.8rem;
    }

    @media screen and (min-width: 768px) {
        .titles {
            margin-top: 0.2rem;
        }
    }

    @media screen and (min-width: 1024px) {

    }
</style>
