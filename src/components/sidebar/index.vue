<template>
    <div class="sidebar" @click="maskcallback">
        <div class="sidebar-main">
            <ul class="sidebar-scroll">
                <li v-for="(item,index) in list" :key="index" @click.stop="toWallet(item)"
                    :class="{'walletActive':currentWallet && currentWallet.address === item.address }">
                    <i class="icon" :class="['icon-'+currencyType]"></i> {{item.walletName}}
                </li>
                <li v-if="list.length <1">
                    <i class="icon" :class="['icon-no']"></i> Not created
                </li>
            </ul>
            <ul class="sidebar-menu">
                <li @click="toMessageCenter">
                    <span class="readIcon" v-show="readStatus"></span>
                    <i class="icon icon-message"></i> 消息中心
                </li>
                <router-link tag="li" :to="{path: '/create', query: {type:currencyType,wallet:'wallet'}}">
                    <i class="icon icon-create"></i> 创建{{currencyType}}钱包
                </router-link>
                <router-link tag="li" :to="{path: '/import', query: {type:currencyType,wallet:'wallet'}}">
                    <i class="icon icon-import"></i> 导入{{currencyType}}钱包
                </router-link>
            </ul>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'index',
    props: {
      list: {
        required: true,
        type: Array,
        default: function(val) {
          console.log('传的数据' + val);
          return val || [];
        },
      },
      currencyType: {
        type: String,
      },
      currentWallet: {
        type: Object,
      },
      readStatus: {
        type: Boolean,
        default: function() {
          return false;
        },
      },
      balance: '',
    },
    watch: {
      currencyType: function(val) {
        if (val === 'ETH') {

        } else if (val === 'BTC') {

        } else if (val === 'USDT') {

        }
      },
    },
    data() {
      return {
        isApp: true,
      };
    },
    methods: {
      browserType() {
        let u = global.navigator.userAgent;
        return {
          trident: u.indexOf('Trident') > -1, //IE内核
          presto: u.indexOf('Presto') > -1, //Opera内核
          webKit: u.indexOf('AppleWebKit') > -1, //苹果/谷歌内核
          gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1, //火狐内核
          // ||!!u.match(/AppleWebKit/)&&u.indexOf('QIHU')&&u.indexOf('Chrome')<0
          mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
          ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //iOS终端
          android: /Android/i.test(u), //Android终端或者UC浏览器
          iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
          iPad: u.indexOf('iPad') > -1, //是否iPad
          webApp: u.indexOf('Safari') === -1, //是否Web应该程序，没有头部与底部
        };
      },

      toWallet(val) {
        this.$emit('toWallet', val);
      },
      maskcallback() {
        this.$emit('maskcallback');
      },
      toMessageCenter() {
        // :to="'/'+currencyType+'/'+'message_center'"
        switch (this.currencyType) {
          case 'ETH':

            // localStorage.setItem('eth_readStatus', false);
            this.$router.push({
              path: '/ETH/message_center',
            });
            break;
          case 'BTC':

            // localStorage.setItem('btc_readStatus', false);
            this.$router.push({
              path: '/ETH/message_center',
            });
            break;
        }
      },
    },
    mounted() {
      this.isApp = this.browserType().mobile;
      console.log(this.isApp + '设备类型');
    },
  };
</script>

<style scoped>
    .sidebar {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1040;
        background-color: rgba(0, 0, 0, 0.5);

    }

    .walletActive {
        background: rgba(246, 246, 246, 1);
    }

    @keyframes slideInRight {
        from {
            transform: translate3d(100%, 0, 0);
            visibility: visible;
        }

        to {
            transform: translate3d(0, 0, 0);
        }
    }

    .sidebar-main {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 4.94rem;
        background: #fff;
        max-height: 100%;
        overflow-y: scroll;
        animation: slideInRight 400ms ease-in-out both;
    }

    .sidebar-scroll {
        /*max-height: 2.5rem;*/
        /*overflow-y: scroll;*/
        border-bottom: 1px solid #E8E8E8;
    }

    .sidebar-main li {
        padding-left: 0.33rem;
        line-height: 1.25rem;
        /*color: rgba(74, 74, 74, 1);*/
        font-size: 0.3rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        position: relative;
        font-weight: 600;
        color: rgba(25, 27, 31, 1);
    }

    .sidebar-scroll {
        padding-top: 0.6rem;
        padding-bottom: 0.3rem;
    }

    .sidebar-main li i.icon {
        width: 0.4rem;
        height: 0.34rem;
        display: inline-block;
        margin-right: 0.3rem;
        vertical-align: -5%;
    }

    .sidebar-main li .readIcon {
        position: absolute;
        width: 8px;
        height: 8px;
        top: 0.37rem;
        left: 0.47rem;
        background-color: red;
        border-radius: 8px;
    }

    .sidebar-menu {
        padding-top: 0.3rem;
    }

    .sidebar-main li i.icon-ETH {
        background: url("../../assets/common/img/icon_caidan_qianbao@2x.png") no-repeat;
        background-size: contain;
    }

    .sidebar-main li i.icon-BTC {
        background: url("../../assets/common/img/icon_caidan_qianbao_2@2x.png") no-repeat;
        background-size: contain;
    }

    .sidebar-main li i.icon-no {
        background: url("../../assets/common/img/icon_caidan_qianbao_weichuangjian@2x.png") no-repeat;
        background-size: contain;
    }

    .sidebar-main li i.icon-message {
        background: url("../../assets/common/img/icon_caidan_tongzhi@2x.png") no-repeat;
        background-size: contain;
    }

    .sidebar-main li i.icon-scan {
        background: url("../../assets/common/img/icon_caidan_saoyisao@2x.png") no-repeat;
        background-size: contain;
    }

    .sidebar-main li i.icon-create {
        background: url("../../assets/common/img/icon_caidan_chuangjian@2x.png") no-repeat;
        background-size: contain;
    }

    .sidebar-main li i.icon-import {
        background: url("../../assets/common/img/icon_caidan_daoru@2x.png") no-repeat;
        background-size: contain;
    }

    .sidebar-main li i.icon-setting {
        background: url("../../assets/common/img/icon_caidan_shezhi@2x.png") no-repeat;
        background-size: contain;
    }

</style>
