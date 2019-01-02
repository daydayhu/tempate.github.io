import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
  // mode: 'history', // 访问路径不带井号 需要使用 history模式，才能使用 scrollBehavior
  // base: '', // 配置单页应用的基路径
  routes: [
    {
      path: '/btc',
      // component: resolve=>require(['@/page/index'],resolve),
      component: resolve => require(['@/page/BTC/genWallet'], resolve),
    },
    {
      path: '/sidebar',
      component: resolve => require(['@/components/sidebar/index'], resolve),
    },
    {
      path: '/prompt',
      component: resolve => require(['@/components/prompt/index'], resolve),
    },
    // 公共

    // 启动首页
    {
      path: '/',
      // redirect:"/getIn",
      component: resolve => require(['@/page/common/getIn'], resolve),
    },
    // 登录
    {
      path: '/login',
      component: resolve => require(['@/page/common/login'], resolve),
    },
    // 创建
    {
      path: '/create',
      // redirect:"/create/ETH",
      component: resolve => require(['@/page/wallet_details/chooseCreate'], resolve),
    },
    // 导入
    {
      path: '/import',
      // redirect: '/import/mnemonic',
      component: resolve => require(['@/page/wallet_details/chooseImport'], resolve),

    },
    //钱包主页
    {
      path: '/warp',
      component: resolve => require(['@/page/warp'], resolve),
    },
    //钱包主页
    {
      path: '/index',
      component: resolve => require(['@/page/index'], resolve),
    },

    // 钱包设置
    {
      path: '/wallet_details',
      component: resolve => require(['@/page/wallet_details/wallet_details'], resolve),
    },

    // 钱包名
    {
      path: '/wallet_name',
      component: resolve => require(['@/page/wallet_details/wallet_name'], resolve),
    },
    // 修改密码
    {
      path: '/modify',
      component: resolve => require(['@/page/wallet_details/modify'], resolve),
    },

    // 导出私钥
    {
      path: '/private_key',
      component: resolve => require(['@/page/wallet_details/private_key'], resolve),
    },
    // keystore
    {
      path: '/keystore',
      // redirect:'/keystore/out_K',
      component: resolve => require(['@/page/wallet_details/keystore'], resolve),

    },

    // 消息中心

    {
      path: '/ETH/message_center',
      component: resolve => require(['@/page/ETH/message_center'], resolve),
    },

    {
      path: '/BTC/message_center',
      component: resolve => require(['@/page/BTC/message_center'], resolve),
    },

    // 扫一扫（2【下一步】）

    {
      path: '/ETH/eth',
      component: resolve => require(['@/page/ETH/sweep/eth'], resolve),
    },
    {
      path: '/BTC/eth',
      component: resolve => require(['@/page/BTC/sweep/eth'], resolve),
    },
    {
      path: '/test',
      component: resolve => require(['@/page/test'], resolve),
    },

    // {
    //   path: '/ETH/eth',
    //   component: resolve => require(['@/page/ETH/sweep/eth'], resolve),
    // },

    // 扫一扫（3【确认】）
    {
      path: '/eth_ok',
      component: resolve => require(['@/page/common/sweep/eth_ok'], resolve),
    },
    // 行情
    {
      path: '/quotes',
      component: resolve => require(['@/page/common/quotes'], resolve),
    },
    // 行情搜索
    {
      path: '/quotesSeach',
      component: resolve => require(['@/page/common/quotesSeach'], resolve),
    },
    // 收款码
    {
      path: '/receipt_code',
      component: resolve => require(['@/page/common/receipt_code'], resolve),
    },

    // 交易记录(1)
    // {
    //   path: '/transaction',
    //   component: resolve => require(['@/page/common/transaction'], resolve),
    // },

    {
      path: '/ETH/transaction',
      component: resolve => require(['@/page/ETH/transaction'], resolve),
    },
    {
      path: '/ETH/record',
      component: resolve => require(['@/page/ETH/record'], resolve),
    },

    {
      path: '/BTC/transaction',
      component: resolve => require(['@/page/BTC/transaction'], resolve),
    },
    {
      path: '/BTC/record',
      component: resolve => require(['@/page/BTC/record'], resolve),
    },

    // 重置密码
    {
      path: '/password',
      // redirect:'/password/mnemonic',
      component: resolve => require(['@/page/wallet_details/update_password'], resolve),
    },

    // ETH 新增代币
    {
      path: '/addtoken',
      component: resolve => require(['@/page/common/token/add_token'], resolve),
    },

    // ETH  搜索代币
    {
      path: '/searchtoken',
      component: resolve => require(['@/page/common/token/search_token'], resolve),
    },
    //服务及隐私条例
    {
      path: '/regulation',
      component: resolve => require(['@/components/common/regulation'], resolve),
      // component: resolve => require(['@/page/setting/regulations'], resolve),
    },

    // 备份提醒
    {
      path: '/backWarn',
      component: resolve => require(['@/page/common/back_warn'], resolve),
    },
    {
      path: '/backups',
      component: resolve => require(['@/page/wallet_details/backups'], resolve),
    },
    {
      path: '/backups_ok',
      component: resolve => require(['@/page/wallet_details/backups_ok'], resolve),
    },

    // 设置
    {
      path: '/setting',
      component: resolve => require(['@/page/setting/setting'], resolve),
    },
    // 帮助
    {
      path: '/help',
      component: resolve => require(['@/page/setting/help'], resolve),
    },
    {
      path: '/help_answer',
      component: resolve => require(['@/page/setting/help_answer'], resolve),
    },
    // 反馈
    {
      path: '/feedback',
      component: resolve => require(['@/page/setting/feedback'], resolve),
    },

    // 钱包管理
    {
      path: '/manageWallet',
      component: resolve => require(['@/page/setting/manageWallet'], resolve),
    }

  ],
});

router.beforeEach((to, from, next) => {
  console.log('to================', to);
  // console.log(JSON.stringify(to) +'==================hjhjh=======================');
  if (to.path == '/') {
    document.URL.startsWith('http') ? (() => {
      next();
    })() : (() => {
      var sys = localStorage.getItem('wallet_system') ? localStorage.getItem('wallet_system') : '';
      switch (sys) {
        case 'ETH':
          next({path: '/index', query: {type: sys}});
          break;
        case 'BTC':
          next({path: '/index', query: {type: sys}});
          break;
        default:
          next({path: '/login'});
          break;
      }
    })();
  } else {
    if (document.getElementById('Toast')) {
      document.getElementById('Toast').parentNode.removeChild(document.getElementById('Toast'));
    }
    next();
  }

});
export default router;
