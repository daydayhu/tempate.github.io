const $Tool = {
  $Toast: function(context, cb) {
    if (document.getElementById('Toast')) {
      document.body.removeChild(document.getElementById('Toast'));
    }
    let Span = document.createElement('span');
    Span.innerHTML = `<i>${context}</i>`;
    Span.id = 'Toast';
    Span.setAttribute('class', 'toast');
    document.body.appendChild(Span);
    if (cb) {
      cb();
    }
    if (this.$ToastSetTimeout) {
      clearTimeout(this.$ToastSetTimeout);
      this.$ToastSetTimeout = null;
    }

    this.$ToastSetTimeout = setTimeout(() => {
      if (document.getElementById('Toast')) {
        document.getElementById('Toast').parentNode.removeChild(document.getElementById('Toast'));
      }
    }, 3000);
  },
  // 根据 地址 获取 当前钱包类型下 助记词的状态
  $zjc_backups(address) {
    var wallet_system = localStorage.getItem('wallet_system');
    return localStorage.getItem(wallet_system.toLowerCase() + '_zjc' + address);
  },

  // 生成随机4个字符
  $getRanNum(){
    var result = [];
    for(var i = 0;i < 4; i++) {
      var ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字
      //大写字母'A'的ASCII是65,A~Z的ASCII码就是65 + 0~25;然后调用String.fromCharCode()传入ASCII值返回相应的字符并push进数组里
      // result.push(String.fromCharCode(65+ranNum));
      // console.log(ranNum);
      result.push(String.fromCharCode(97+ranNum));
    }
    return  result.join('');
  },

};

export default $Tool;
