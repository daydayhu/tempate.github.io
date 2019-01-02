<template>
    <div class="prompt">
        <div @click="maskcallback" class="mask"></div>
        <div class="prompt-main">
            <div v-if="promptType === 1" class="prompt-select">
                <ul class="prompt-select-main">
                    <li v-for="(item,index) in selectList" :key="index" @click.stop="selectcb(item,index)"
                        :class="{'active':item.checked}">{{item.name}}
                    </li>
                </ul>
            </div>
            <div v-if="promptType ===2" class="prompt-miner">
                <ul class="prompt-miner-select">
                    <li @click.stop="minercb(35)">常规：35 sat/b <i :class="{'icon':miActive ===35}"></i></li>
                    <li @click.stop="minercb(45)">优先：45 sat/b <i :class="{'icon':miActive ===45}"></i></li>
                </ul>
                <input type="number" v-model="Amount" autocomplete="off" placeholder="自定义手续费（sat/b）"
                       class="prompt-miner-input">
            </div>
            <div v-if="promptType ===3" class="prompt-password">
                <p class="prompt-password-title">请输入密码</p>
                <input type="password" v-model="vspassword" autocomplete="off" placeholder="输入密码"
                       class="prompt-password-input">
                <div class="prompt-password-event">
                    <button @click="maskcallback">取消</button>
                    <button @click="confirmcb">确认</button>
                </div>
            </div>
            <div v-if="promptType ===4 ||  promptType ===5" class="prompt-prop">
                <div v-if="promptType ===4">
                    <p class="prompt-prop-title">请勿拍照</p>
                    <div class="prompt-prop-maim">
                        如果有人获取您的助记词，将直接获取您的资产！钱包平台无法为您存储、找回或拦截，请务必抄写下助记词并存放在安全的地方。
                    </div>
                    <div class="prompt-password-event">
                        <button @click="maskcallback">知道啦</button>
                    </div>
                </div>
                <div v-else>
                    <p class="prompt-prop-title">免责声明</p>
                    <div class="prompt-prop-maim">
                        请确保您已将钱包备份至安全的地方，ForYoung平台不承担任何因丢失、盗窃、忘记密码等引起的财产损失。
                    </div>
                    <div class="prompt-password-event">
                        <button @click="maskcallback">取消</button>
                        <button @click="confirmcb">确认</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'index',
    props: {
      promptType: {
        type: Number,
        default: function(val = 5) {
          return val;
        },
      },
      selectActive: {
        type: Number,
        default: function(val) {
          return val;
        },
      },

      minerActive: {
        type: Number,
        default: function(val) {
          return val || 35;
        },
      },
      selectList: {
        type: Array,
        default: function(val) {
          return val || [];
        },
      },
    },
    data() {
      return {
        vspassword: '',
        Amount: '',
        seActive: this.selectActive,
        miActive: this.minerActive,
      };
    },
    methods: {
      maskcallback() {
        if (this.promptType == 2) {
          this.$emit('maskcallback', this.Amount);
          console.log(this.Amount);
        } else {
          this.$emit('maskcallback');
          this.vspassword = '';
        }

      },
      selectcb(item, index) {
        item.checked = true;
        // this.seActive = index;
        this.$emit('selectcb', item);
      },
      confirmcb() {
        this.$emit('confirmcb', this.vspassword);
      },
      minercb(val) {
        this.miActive = val;
        this.$emit('minercb', val);
        console.log(val);

      },
    },
  };
</script>

<style scoped>
    .prompt {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.3);
    }

    .mask {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }

    .prompt-main {
        position: absolute;
        width: 6.8rem;
        left: 50%;
        margin-left: -3.4rem;
        bottom: 0.55rem;
    }

    .prompt-select {
        max-height: 4rem;
        width: 100%;
        border-radius: 0.14rem;
        overflow: hidden;
    }

    .prompt-select-main {
        overflow-y: scroll;
        max-height: 4rem;
        background-color: #fff;
    }

    .prompt-select-main li {
        text-indent: 0.42rem;
        line-height: 1.23rem;
        font-size: 0.32rem;
        font-weight:600;
        color:rgba(25,27,31,1);
    }

    .prompt-select-main li.active {
        background-color: #eee;
    }

    /*密码验证*/
    .prompt-password {
        height: 3.94rem;
        width: 100%;
        border-radius: 0.14rem;
        overflow: hidden;
        background: #fff;
    }

    .prompt-password-title {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        line-height: 1.2;
        font-size: 0.38rem;
        text-align: center;
        color: #000;
        font-weight: bold;
    }

    .prompt-password-input, .prompt-miner-input {
        width: 6.3rem;
        height: 0.85rem;
        background-color: #F0F0F0;
        font-size: 0.3rem;
        margin: 0 auto;
        border-radius: 0.14rem;
        border: none;
        text-indent: 0.11rem;

    }

    .prompt-password-input::placeholder {
        color: #9B9B9B;
    }

    .prompt-password-event {
        text-align: center;
    }

    .prompt-password-event button {
        margin-top: 0.45rem;
        width: 3.06rem;
        height: 0.8rem;
        background: linear-gradient(90deg, rgba(51, 153, 235, 1) 0%, rgba(47, 124, 243, 1) 100%);
        border-radius: 0.5rem;
        font-size: 0.36rem;
        color: #fff;
        border: none;
    }

    .prompt-password-event button + button {
        margin-left: 0.12rem;
    }

    /*矿工费 选择*/
    .prompt-miner {
        width: 100%;
        height: 4.5rem;
        overflow: hidden;
        border-radius: 0.14rem;
        background-color: #fff;
        padding-top: 0.32rem;
    }

    .prompt-miner-select li {
        line-height: 1.2rem;
        font-size: 0.32rem;
        color: #191B1F;
        text-indent: 0.48rem;
    }

    .prompt-miner-select li i.icon {
        float: right;
        margin-right: 0.29rem;
        margin-top: 0.35rem;
        width: 0.44rem;
        height: 0.44rem;
        background: url("../../assets/common/img/icon_xuanze_pre@2x.png") no-repeat;
        background-size: 100% 100%;
    }

    /**/
    .prompt-prop {
        width: 100%;
        max-height: 6.67rem;
        overflow: hidden;
        border-radius: 0.14rem;
        background-color: #fff;
        padding-top: 0.32rem;
        padding-bottom: 0.32rem;
    }

    .prompt-prop-maim {
        max-height: 3rem;
        overflow-y: scroll;
        padding: 0 0.45rem;
    }

    .prompt-prop-title {
        margin-top: 0.1rem;
        margin-bottom: 0.5rem;
        line-height: 1.2;
        font-size: 0.4rem;
        text-align: center;
        color: #000;
        font-weight: bold;

    }
</style>
