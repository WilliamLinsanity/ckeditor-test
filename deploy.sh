#!/usr/bin/env sh
# 當發生錯誤時終止腳本運行
set -e
# 打包

git init 
git add -A
git commit -m 'deploy'
# 部署到 https://github.com/WilliamLinsanity/ckeditor-test.git分支為 gh-pages
git push -f https://github.com/WilliamLinsanity/ckeditor-test.git main:gh-pages

cd -