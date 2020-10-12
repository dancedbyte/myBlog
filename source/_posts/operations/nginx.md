---
title: Nginx 学习指南
tags: Nginx
categories: 运维
date: 2020-10-09
index_img: /img/nginx_1.jpg
---

## 代理分类

<img src='/img/nginx_1_1.png' width=700 />

1. 正向代理：代理的是客户端。一般是客户端明确知道要访问的是哪台服务器，通过正向代理做中转。例如客户端想访问谷歌需要借助梯子工具，这个梯子就起到了正向代理的作用。

2. 反向代理：代理的是服务器。用户始终认为它访问的是目标服务器而不是代理服务器，但实用际上反向代理服务器做了层中转，但用户却不知道。

## 反向代理

### 常见用途
1. https加密
2. 负载均衡
3. 缓存静态内容
4. gzip压缩
5. 对于文件上传等进行限速，例如百度网盘。
6. 增强安全性，例如黑客想要攻击服务器，必须先跨过代理服务器，变向增加了他想要攻击所花费的时间。
7. 对返回结果进行错误页（404）跳转，异常判断等。

### 负载均衡
nginx提供负载均衡的策略有两种，内置策略（轮询、加权轮询、ip hash 、热备四种）和拓展策略（拓展的先不去考虑，随着学习的深入再去了解）。

#### 轮询
<img src='/img/nginx_1_2.png' width=450 />

```js
# 服务器处理请求的顺序为 ABABABA
upstream firstHttp {
    server 81.70.41.254:3000; # 服务器A
    server 81.70.41.253:4000; # 服务器B
}
```

#### 加权轮询
<img src='/img/nginx_1_3.png' width=450 />

```js
upstream firstHttp {
    server 81.70.41.254:3000 weight=1;
    server 81.70.41.255:4000 weight=2;
    server 81.70.41.256:5000 weight=3; # weight配置权重
}
```

#### ip hash
对客户端请求的ip做hash处理，然后根据hash结果，让相同的客户端去请求相同（同一台）的服务器。**可以解决session不共享的问题**。

<img src='/img/nginx_1_4.png' width=450 />

```js
upstream firstHttp {
    server 81.70.41.254:3000;
    server 81.70.41.255:4000;
    ip_hash; # 配置 ip_hash
}
```

#### 热备（预留的备份机器）
如果有两台服务器A和B，将B设为热备机器，则只有A挂了，B才会去处理请求。
```js
upstream firstHttp {
    server 81.70.41.254:3000;
    server 81.70.41.255:4000 backup; # 热备
}
```

#### 额外的状态参数
1. down: 表示当前server不参与负载均衡。
2. max_fails: 该机器允许请求失败的次数，默认为1。
3. fail_timeout: 配合max_fails使用，当请求该机器失败后，该机器暂停服务的时间。以分钟为单位。
```js
upstream firstHttp {
    server 81.70.41.254:3000 weight=2 max_fails=2 fail_timeout=1;
    server 81.70.41.255:4000 weight=1 max_fails=1 fail_timeout=2;
}
```

## Location 匹配规则
通过配置 location 指令块，可以决定一个请求 url 如何处理。

那么当 url 命中多个匹配规则时，nginx 是如何分配的呢？

### Location 配置语法

```js
// [ ] 中的是修饰符
location [ = | ~ | ~* | ^~ | 空 ] url { … }
```

1. = 表示精准匹配（完全相等时，才会命中规则）。

2. ~ 表示区分大小写的正则匹配。

3. ~* 表示不区分大小写的正则匹配。

4. ^~ 表示最佳匹配。可以理解最佳匹配介于 【=】 和 【空】 之间。

5. 空，匹配以 url **开头**的字符串，只能是普通字符串。

### Location 匹配过程
1. nginx 先根据 url 检查**最长匹配前缀字符串**，即会判断【=】、【^~】、【空】修饰符定义的内容。

```
①  如果能匹配到 最长前缀字符串

    i. 如果最长匹配前缀字符串被【=】修饰符匹配，则立即响应。
   ii. 如果没有被【=】修饰符匹配，则执行第 2 步判断。

②  如果没有匹配到 最长前缀字符串，则执行第3步判断
```
    
2. nginx 继续检查最长匹配前缀字符串，即判断【^~】、【空】修饰符定义的内容。

```
①  如果最长匹配前缀字符串被【^~】修饰符匹配，则立即响应。

②  如果被【空】修饰符匹配，则将该匹配保存起来，并执行第 3 步判断。
```

3. nginx 找到 nginx.conf 中定义的所有正则匹配修饰符【～】、【～*】，并按顺序进行匹配。

```
①  如果有任何正则修饰符匹配成功，则立即响应。

②  如果没有任何正则修饰符匹配成功，则响应第 2 步中存储的【空】匹配。
```

>   可以简要概括为：

    ① 先找到最长前缀字符串，然后根据优先级：【=】>【^~】>【空】进行判断
    ② 如果没有匹配到任何最长前缀字符串：则直接去找正则匹配修饰符。
    ③ 如果走到最后【空】这一步：则直接拿匹配结果去找正则匹配修饰。
    
    
### 匹配规则小练习

**练习1：访问 /abcd 会匹配到哪个 config？**

```
# 匹配到 config3 
# 最长匹配字符串为 abc，且有 ^~ 匹配，故结果为 config3

server {
  location ~ /abc {
      #config 1
  }

  location /abc {
      #config 2
  }

  location ^~ /abc {
      #config 3
  }
}
```

**练习2：访问 /abcd 会匹配到哪个 config？**

```
# 匹配到 config1 
# 最长匹配字符串为 abc，被【空】匹配，则继续查询正则匹配，匹配到正则 ~ /abc，故结果为 config1

server {
  location ~ /abc {
      #config 1
  }

  location /abc {
      #config 2
  }

  location ^~ /ab {
      #config 3
  }
}
```

**练习3：访问 /abcd 会匹配到哪个 config？**

```
# config2
# 最长匹配字符串为 abc，被【空】匹配，则继续查询正则匹配，没有匹配到任何正则，故使用【空】匹配到的结果 config2

server {
  location /abc {
      #config 2
  }

  location ^~ /ab {
      #config 3
  }
}
```

## 项目中配置
<img src='/img/nginx_1_5.png' width=550 />

## 踩坑记录

### nginx -s reload 重启nginx时报错
nginx: [error] open() "/home/wm/nginx/nginx/logs/nginx.pid" failed (2: No such file or directory)

1. 进到logs文件发现的确没有nginx.pid文件。

2. 使用nginx -c的参数指定nginx.conf文件的位置。
    ```
    sudo nginx  -c /usr/local/etc/nginx/nginx.conf
    ```
    
3. 然后进入log目录，发现有了nginx.pid文件。再执行nginx -s reload则正常重启。

## 参考链接
[Nginx Location 匹配规则](https://lmjben.github.io/blog/operation-nginx-match.html#nginx-location-%E7%9A%84%E5%8C%B9%E9%85%8D%E8%BF%87%E7%A8%8B)
