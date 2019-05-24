欢迎使用 CORS dev tool 浏览器扩展
=======

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

**CORS dev tool** 可以让你自定义规则到 HTTP 响应头，你可以添加 `Access-Control-Allow-Origin：http://localhost:3000` 规则到响应头，允许CORS本地开发，规避浏览器的跨域请求拦截。

使用方法
---
安装插件后点击右上角图标，启用  "跨源资源共享" 即可。

自定义配置
---
安装插件后点击右上角图标， 点击 "自定义" 进入配置页面

 - "HTTP 响应头" 页面允许你添加自定义 `Access-Control-*` 头信息到 HTTP 响应头
 - "Url 模式" 页面允许你自定义应用规则的网站

兼容浏览器
---
Firefox v48+

本地开发
---
`$ npm install`
打开浏览器开发模式，载入扩展程序目录

License
---
[反 996 许可证](LICENSE)