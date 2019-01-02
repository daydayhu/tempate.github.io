<template>
    <div style="height: 100%">
      <v-nav>帮助</v-nav>
      <div class="content_color cbg">
        <div class="question">{{ques}}</div>

        <div class="answer" v-show="index === 0">
          <p>若您想导入ETH钱包：<p><br/>
          <p>1. 在钱包首页的钱包体系切换处，将钱包体系切换为ETH体系。</p><br/>
          <img src="../../assets/common/img/answer/ans1_1.png" alt="">
          <img src="../../assets/common/img/answer/ans1_2.png" alt="">
          <p>2. 在功能侧栏选择导入ETH钱包，进入导入ETH钱包页面。</p>
          <img src="../../assets/common/img/answer/ans1_3.png" alt="">
          <img src="../../assets/common/img/answer/ans1_4.png" alt="">
          <p>3. 在导入ETH钱包页面，切换选择导入钱包的方式：助记词、Keystore或私钥。</p><br/>
          <p>4.  按照要求填写信息，若信息正确，即可成功导入。</p><br/>

          <p>若您想导入BTC钱包：</p><br/>
          <p>1.在钱包首页的钱包体系切换处，将钱包体系切换为BTC体系。</p><br/>
          <p>2.在功能侧栏选择导入BTC钱包，进入导入BTC钱包页面。</p><br/>
          <p>3.在导入BTC钱包页面，切换选择导入钱包的方式：助记词、Keystore或私钥。</p><br/>
          <p>4.按照要求填写信息，若信息正确，即可成功导入。</p><br/>
        </div>
        <div class="answer" v-show="index === 1">
          <p>1. 在钱包首页，点击钱包名称或“请备份”按钮，进入钱包管理页面。</p><br/>
          <img src="../../assets/common/img/answer/ans2_1.png" alt="">
          <img src="../../assets/common/img/answer/ans2_2.png" alt="">
          <p>2.在钱包管理页面，点击“备份助记词”按钮，弹窗输入密码，若密码输入正确，即可开始备份助记词。</p><br/>
          <img src="../../assets/common/img/answer/ans2_3.png" alt="">
          <p>3. 同理，点击“导出私钥”或“导出keystore”栏，弹窗输入密码，若密码输入正确，即可开始备份私钥或Keystore。</p><br/>
          <p>4. 助记词、Keystore和私钥，您可以选择仅仅备份助记词（助记词必须备份），也可以选择将三者都备份。为了您的资产安全，请务必将您的钱包备份到安全的地方。</p><br/>
        </div>
        <div class="answer" v-show="index === 2">
          <p>
            1. Keystore虽然是加密过后的私钥，但是不方便抄写，一般情况下都需要通过网络传输进行存储。而且Keystore往往会给用户带来安全的错觉，曾经出现过很多使用微信收藏Keystore或者邮件传输Keystore导致代币被盗的事件。
          </p><br>
          <p>
            2. 明文私钥的安全等级和助记词是一样的，都是未经加密的私钥，但是明文私钥非常不便于用户进行抄写记忆，私钥一旦出现抄写错误，那么就会发生丢币的现象，所以我们不建议备份或者传输明文私钥。
          </p><br>
          <p>
            3. 助记词便于用户抄写备份。我们推荐用户在备份的时候使用物理介质备份，即抄写助记词备份。这样的备份方式是安全系数最高的，完全隔离网络，可以有效防止黑客的专业攻击。
          </p>
        </div>
        <div class="answer" v-show="index === 3">
          <p>1.在钱包首页，点击钱包名称进入钱包管理页面。</p><br/>
          <img src="../../assets/common/img/answer/ans2_1.png" alt="">
          <img src="../../assets/common/img/answer/ans2_2.png" alt="">
          <p>2.在钱包管理页面，点击“删除钱包”按钮，弹出免责申明窗口，点击“确认”按钮，即可删除钱包。为避免资产损失，请务必备份好钱包之后再删除。</p><br/>
          <img src="../../assets/common/img/answer/ans4_3.png" alt="">
        </div>
        <div class="answer" v-show="index === 4">
          <p>1.在钱包首页，点击币种模块，进入币种模块详情页，进行转账或收款。</p><br/>
          <img src="../../assets/common/img/answer/ans5_1.png" alt="">
          <img src="../../assets/common/img/answer/ans5_2.png" alt="">
          <p>2.在币种详情页面，点击“转账”或“收款”按钮，进入转账或收款页面。</p><br/>
          <p>3.在钱包首页，点击钱包地址，可以直接进入收款页面</p><br/>
          <img src="../../assets/common/img/answer/ans5_3.png" alt="">
        </div>
        <div class="answer" v-show="index === 5">
          <p>1.目前只有ETH生态链可以添加代币。</p><br/>
          <p>2.在ETH生态链下的钱包首页，点击新增代币按钮，进入新增资产页面。</p><br/>
          <img src="../../assets/common/img/answer/ans6_1.png" alt="">
          <img src="../../assets/common/img/answer/ans6_2.png" alt="">
          <p>3.在新增资产页面，可以在代币列表上查找添加，也可以点击页面右上角的搜索图标，进入代币搜索页面。在输入框中输入代币名称（此处以SPH为例），点击输入框前的搜索按钮或输入法的下一步按钮，均可进行下一步操作，进入搜索结果页面。</p><br/>
          <img src="../../assets/common/img/answer/ans6_3.png" alt="">
          <img src="../../assets/common/img/answer/ans6_4.png" alt="">
          <p>4.在搜索结果页面，点击显示开关添加对应代币即可。</p><br/>
          <img src="../../assets/common/img/answer/ans6_5.png" alt="">
          <img src="../../assets/common/img/answer/ans6_6.png" alt="">
          <p>5.添加完成，返回钱包首页，查看添加的代币是否显示。</p><br/>
          <img src="../../assets/common/img/answer/ans6_7.png" alt="">
        </div>
        <div class="answer" v-show="index === 6">
          <p>ForYoung是跨链钱包，目前支持BTC、ETH、USDT以及其他在以太坊链上的智能合约代币。</p>
        </div>
        <div class="answer" v-show="index === 7">
          <p>
           1. 在一个公有链上，任何人都可以读写数据。读取数据是免费的，但是向公有链中写数据是需要花费一定费用的，这种开销有助于阻止垃圾内容，并通过支付保护其安全性。网络上的任何节点（每个包含账本拷贝连接的设备被称作节点）都可以参与称作挖矿的方式来保护网络。由于挖矿需要计算能力和电费，所以矿工们的服务需要得到一定的报酬，而这些报酬就是矿工费。
          </p><br>
          <p>
            2.一笔交易所产生的转账费是用来奖励给打包包含这笔交易的区块的矿工。区块不是哪个矿工产生的，所有的矿工都会竞争下一个区块的打包权，胜出者可以打包下一个区块。交易不一定会存在一个区块，它被广播出去后，在数秒内全网所有的节点都会接收到这笔交易。矿工会优先打包矿工费高的交易，如果用户交易时所支付的矿工费非常低，那么这笔交易可能不会被矿工打包，从而造成交易失败。
          </p>
        </div>
        <div class="answer" v-show="index === 8">
          <p>
            是安全的。您的助记词、私钥和Keystore都是存储在您的个人设备上，您的资产都是存储在区块链网络上，ForYoung平台不为您存储任何资产。所以，即使ForYoung公司在经营上出现了问题，您仍旧可以凭借助记词、私钥或Keystore，在别的钱包平台提取您的资产。
          </p>
        </div>
        <div class="answer" v-show="index === 9">
          <p>
            ForYoung是去中心化钱包，所有交易都是用户自己借助ForYoung授权签名的，发生在区块链上面。交易一旦发生，区块链本身无法做任何改变，这就是区块链的“不可篡改性”。所以ForYoung完全无法完成【冻结账号】【回滚交易】等操作，您只能自行承担损失。
          </p>
        </div>


      </div>


    </div>
</template>

<script>
    export default {
        name: "help_answer",
        data(){
          return{
            ques: this.$route.query.question,
            index: this.$route.query.index,
          }
        }
    }
</script>

<style scoped>
  .cbg{
    background:rgba(255,255,255,1);
  }
  .question {
    font-size:0.28rem;
    font-weight:600;
    color:rgba(48,48,48,1);
    line-height:0.40rem;
    margin: 0.43rem 0.4rem 0.19rem 0.43rem;
    border-bottom: 0.02rem solid #e6e6e6;
    padding-bottom: 0.2rem;
  }
  .answer {
    font-size: 0.28rem;
    font-weight: 600;
    color: rgba(155, 155, 155, 1);
    line-height: 0.40rem;
    margin-left: 0.39rem;
    margin-right: 0.33rem;
  }
  img{
    width: 100%;
    margin: 0.5rem 0;
  }
</style>
