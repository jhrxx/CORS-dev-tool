欢迎使用 CORS dev tool 浏览器扩展
=======

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

**CORS dev tool** 可以让你自定义规则到 HTTP 响应头，你可以添加 `Access-Control-Allow-Origin：http://localhost:3000` 规则到响应头，允许CORS本地开发，规避浏览器的跨域请求拦截。

用户可以设置不同的返回值，让用户在被准许访问来自不同源服务器上的指定的资源。
用户可以自定义 HTTP 响应头的值
 - Access-Control-Allow-Origin 参数的值指定了允许访问该资源的外域 URI
 - Access-Control-Expose-Headers 头让服务器把允许浏览器访问的头放入白名单
 - Access-Control-Max-Age 头指定了preflight请求的结果能够被缓存多久
 - Access-Control-Allow-Credentials 头指定了当浏览器的credentials设置为true时是否允许浏览器读取response的内容。
 - Access-Control-Allow-Methods 首部字段用于预检请求的响应。其指明了实际请求所允许使用的 HTTP 方法。
 - Access-Control-Allow-Headers 首部字段用于预检请求的响应。其指明了实际请求中允许携带的首部字段。

需要注意的是再设置了 Access-Control-Allow-Origin 为 “*” 的时候不能附带身份凭证
当然你可以指定唯一的 Origin 比如 http://localhost:3000

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

`$ gulp`
打包


License
---
[反 996 许可证](LICENSE)