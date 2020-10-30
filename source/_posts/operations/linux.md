---
title: Linux 学习指南
tags: Linux
categories: 运维
date: 2020-10-08
index_img: /img/linux_1.jpg
---

## 常用命令

1. 登录到某台机器上，root是用户名

```
ssh root@81.70.41.254
```

2. 查看当前目录下的内容

```
# -l 横向模式，可以看到更多内容(文件数量、文件大小、创建时间等)
ls -l

# 查看隐藏文件
ls -a 
```

3. 修改文件名

```
# 修改index.js 为 test.js
mv index.js test.js
```

4. 修改文件或者目录的时间属性，包括存取时间和更改时间。若文件不存在，系统会新建一个文件

```
touch index.js
```

5. 复制某文件、复制某目录

```
# 复制文件 index.js，在当前目录下生成index1.js
cp index.js index1.js

# 复制目录 test， 加 -R 参数 表示复制的是文件夹
cp -R test test1
```

6. 获取当前所在目录

```
# /etc/nginx
pwd 
```

7. 删除某个目录及其下的子目录、删除某个文件

```
rm -r build # 删除目录

rm package.json # 删除文件
```

8. 查看某文件并编辑、将某文件打印到命令行中

```
cat nginx.conf # 将该文件打印到命令行中

vim index.js # 查看某文件并编辑
i # 开启编辑模式
esc # 退出编辑模式
:w # 保存
:q # 退出
:wq # 保存并退出
```

9. 在某文件中查找关键字

```
grep "server" nginx.conf
```

10. 查找某文件的具体路径

```
whereis nginx.conf
```

11. 搜索某文件，输出该文件所在的具体地址

```
# 文件搜索 find [搜索范围] [搜索条件]
find /etc -name nginx.conf
```

12. 压缩 或 解压缩

```
zip -r book.zip book # 压缩book文件夹到book.zip

unzip book.zip # 解压缩
```

13. 显示登陆的用户名

```
whoami
```

14. 查看端口占用、杀死某个进程

```
lsof -i :3000 # 查看 3000 端口占用

kill -9 3599 // 3599是进程对应的 PID
```

15. 修改某个文件夹的读写执行等权限。更多可参考 [Linux chmod命令](https://www.runoob.com/linux/linux-comm-chmod.html)

```
chmod 777 /etc/blog
```

## 常用目录

```
/bin // 常用指令

/boot // 放置开机会用到的档案

/dev // 在这个目录下存取某个档案就等于存取某个装置，比较重要的有/dev/null

/etc // 放置配置文件，例如nginx.conf

/home // 当新建账户时，账户的档案都会放到这里

/lib // 存放一些函式库(外挂)，可以理解为某系指令必须依赖这些外挂才可执行

/opt // 自行安装额外的第三方软件，可以放大这个目录下。

/sbin // 放置开机、修复、还原所需要的档案，只有root才能访问

/var // ⽤于存放运行时需要改变数据的文件，也是某些⼤文件的溢出区，比如说各种服务的日志文件
```

## Linux 配置免密远程登陆

### 原理
使用非对称加密算法进行信息交换。

1. 持有公钥的一方（甲）在收到持有私钥的一方（乙）的请求时，甲会在自己的公钥列表中查找是否有乙的公钥，如果有则将随机字串使用公钥加密后并发送给乙。

2. 乙收到加密的字串使用自己的私钥进行解密，并将解密后的字串发送给甲。

3. 甲接收到乙发送来的字串与自己的字串进行对比，如过通过则验证通过，否则验证失败。

### 步骤
    
1. 在本地客户端生成秘钥对
    
    ```
    # 注意 会生成两个文件 .pub后缀的是公钥。
    ssh-keygen -t rsa -C "你自己的名字" -f "你自己的名字_rsa"
    ```

2. 上传生成的公钥
    
    ```
    # 上传公钥到服务器对应账号的home路径下的 .ssh/ 目录中
    # 并且公钥会放到 .ssh/ 目录下的 authorized_keys 文件中
    ssh-copy-id -i "公钥文件名" 用户名@服务器ip或域名
    ```
    
3. 配置本地（客户端）私钥
    
    ```
    # 把第1步生成的私钥复制到 你本地home目录下的.ssh/ 路径下
    cp gKing_rsa ~/.ssh/gKing_rsa
    ```

4. 配置本地文件。在本地 ~/.ssh 下新建 config 文件

    ```
    # 单主机配置
    Host gKing # 主机的别名 例如我执行 ssh gKing 就可以直接登陆到服务器上
    User root # 指定的用户
    HostName 81.70.41.254 # 主机或域名。域名的话不要加协议
    IdentityFile ~/.ssh/gKing_rsa # 本地私钥地址
    Protocol 2
    Compression yes
    ServerAliveInterval 60
    ServerAliveCountMax 20
    LogLevel INFO
    ```

## 随笔

1. linux对于文件名严格区分大小写。

2. 复制目录要加 -R 参数。删除目录要加 -r 参数（一般情况下需要删除该目录下所有文件，则加 -r）。

