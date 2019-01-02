### 生成 cordova 项目
```javascript
//cordova create  项目名称 项目id  app名称
cordova create hello com.example.hello HelloWorld  
```
### 安装 平台
```javascript
cordova platform add android —save
```
### 打包app 测试环境
```javascript
cordova build android
```
### 生成 .keystore 文件
```javascript
keytool -genkey -v -keystore wallet-release.keystore -alias wallet -keyalg RSA -validity 4000

(执行命令之后会提示你输入密码，设置一些公司名称之类的，密码要记住，其他随意)
{
  XXX-release.keystore ：签名文件的名称（左边一个空格）
  
  YYY ：签名文件的别名（左右一个空格）
  
  4000：有效天数
}
(命令执行完之后，应该会在当前目录下创建一个名为XXX-release.keystore)
```
### 在 当前目录 文件夹内 创建 build.json 文件
```javascript
{
  "android": {
      "release": {
        "keystore": "release-key.keystore",
        "alias": "cordova-demo",
        "storePassword": "testing",
        "password": "testing2"
      }
    }
}
```
### 打包app 正式环境
```javascript
cordova build android --release
```
# 现有项目 mac 环境可以直接在 项目原目录执行
> 打包 dev
```javascript
make buildApp
```
> 上传 web 测试服务器
```javascript
make upload_dev
```
> 打包 app
```javascript
cd cordova/
// 测试包
make build
// 正式包
make buildRelease
```
> 上传 app 下载 地址
```javascript
1. 进入 app 所在路径
/Users/cheng/Desktop/blockchain-wallet-client/cordova/platforms/android/app/build/outputs/apk/armv7/
2. 修改 文件名已作区分
mv app-armv7-release.apk app-20181116-03.apk
3. 上传至服务器
scp -r app-20181116-03.apk  root@10.10.212.187:/wallet/install/android
```
> 查看release发布版本的信息，其中包括md5、SHA1等等字符串
```javascript
keytool -list -v -keystore ./xxx-release.keystore -storepass "你设置的密码"
```
