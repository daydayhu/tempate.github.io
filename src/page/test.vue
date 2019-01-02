<template>
    <div style="background:rgba(246,246,247,1);">

        <button type="button" class="btn" @click="pll">扫描二维码</button>
        success:
        <hr/>
        <textarea >{{result}}</textarea>
        error:
        <hr/>
        <textarea >{{error}}</textarea>
    </div>
</template>
<script>

  export default {
    data() {
      return {
        result: {},
        error: {},
      };
    },
    components: {},
    methods: {
      pll() {
        cordova.plugins.barcodeScanner.scan(
            (result) => {
              this.result = result;
              alert('We got a barcode\n' +
                  'Result: ' + result.text + '\n' +
                  'Format: ' + result.format + '\n' +
                  'Cancelled: ' + result.cancelled);
            },
            (error) => {
              this.error = error;
              alert('Scanning failed: ' + error);
            },
            {
              preferFrontCamera: false,  // iOS and Android 设置前置摄像头
              showFlipCameraButton: false, // iOS and Android 显示旋转摄像头按钮
              showTorchButton: false, // iOS and Android 显示打开闪光灯按钮
              torchOn: false, // Android, 默认打开手电筒
              saveHistory: true, // Android, save scan history (default false)
              prompt: '在扫描区域内放置条形码', // Android
              resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
              formats: 'QR_CODE,PDF_417', // default: all but PDF_417 and RSS_EXPANDED
              orientation: 'portrait', // Android only (portrait|landscape), default unset so it rotates with the device 显示方向
              disableAnimations: false, // iOS 是否禁止动画
              disableSuccessBeep: true, // iOS and Android  禁止成功后提示声音 “滴”
            },
        );
      },

    },
    mounted() {

    },
    computed: {},
  };
</script>
<style scoped>
    .btn {
        display: block;
        margin: 50% auto;
        border: 1px solid yellow;
    }
</style>
