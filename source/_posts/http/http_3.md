---
title: 记录将博客协议升级到 HTTPS
tags: HTTPS
categories: 网络协议
date: 2020-10-15
index_img: /img/http_3_1.png
---

大体可分为三步：证书购买、证书认证、证书下载并安装

## 证书购买
1. 我用的是阿里云的一年免费证书。[地址](https://yundun.console.aliyun.com/?spm=a2c6h.12873639.0.0.4ec422a7XCw8Nb&&p=cas#/overview/cn-hangzhou) 

2. 点击“选购证书”，选择证书类型：免费版（个人）DV。**一定要先购买证书，才能进行下一步认证过程**。

## 证书认证
1. **购买完的SSL证书是未签发状态**，还要提交证书申请，阿里云系统会将请求发送给CA机构审核。

2. 登录到阿里云SSL [控制台](https://yundun.console.aliyun.com/?spm=a2c6h.12873639.0.0.4ec422a7ZO7LcW&&p=cas#/overview/cn-hangzhou)。

3. 在列表中可以看到刚才的免费版SSL，选择**证书申请按钮**，在右侧会拉出浮框，按提示填写即可。

4. 在点击下一步按钮后，会有一个核验按钮，如果你买的是阿里云域名会自动帮你核验。**如果买的是腾讯云域名（譬如我）。就需要登录到腾讯云域名控制台，手动添加一条解析**。

    <img src="/img/http_3_2.png" width="800px" /> 

5. 一般 10 分钟即可下发证书，会给你绑定的手机发一条成功的通知短信。

## 证书下载并安装
1. 前往 [证书控制台](https://c.tb.cn/I3.EDNm) 下载对应的证书并配置到服务器上。

2. 参考阿里云[官方文档](https://help.aliyun.com/document_detail/98728.html?spm=a2c4g.11186623.2.17.6e611854wzXsy5#concept-n45-21x-yfb)即可，这个文档写的还是挺详细的。

## 踩坑记录
第一次配可能也是不太了解的缘故，在一些问题上花了很长时间，记录下来。

1. 当想通过一级域名和二级域名都可以访问自己的网站时？ 

    例如我的域名是 ghmwin.com（一级域名），但我想通过 www.ghmwin.com（二级域名） 也可以访问自己的网站时，需要去自己的域名控制台添加解析记录。 

    <img src="/img/http_3_3.png" width="800px" /> 

2. 当想通过访问 http 自动转到 https 时？

    如果按上面官方文档对于这个问题的配置，会导致页面反复 301 重定向，则页面无法加载。
    
    所以为了访客安全我们需将 http 强制转为 https。可以在 **nginx** 中做如下配置。[参考链接](https://cloud.tencent.com/developer/article/1599905)
    
    ```
    server {
        listen 80 default_server; # 监听http
        server_name www.ghmwin.com; # 域名
        return 301 https://$host$request_uri; # 重定向到https
        # rewrite ^(.*) https://$server_name$1 permanent; # 上面的return也可以用rewrite代替   
    }
    server {
        listen       443 ssl http2 default_server; # 监听https 使用http2协议传输
        server_name  www.ghmwin.com;
        root         /root/blog;
    }   
    ```
   
