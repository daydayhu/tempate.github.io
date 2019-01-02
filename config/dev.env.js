'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')


module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_ROOT: '"http://10.10.212.187:8087"',  // 这是本地开发的 url 如果 开启了代理则地址无效
  NODE_URL: '"http://10.10.212.187:8087/node"',
  BTC_NET: '"testnet"',
})
