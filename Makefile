MY_TIME := $(shell date "+%Y%m%d%H%M%S")

build:
	npm run build

dev:
	npm run dev

buildApp:
	npm run build
	cp -rf dist/ cordova/www

upload_dev:
	scp -r dist root@10.10.212.187:/wallet/

upload_pro:
	scp -r dist root@47.94.196.11:/mnt/svc/web/
echo:
	echo ${MY_TIME}
