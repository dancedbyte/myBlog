---
title: TCP 协议分析
tags: TCP
categories: 网络协议
date: 2020-11-06
index_img: /img/tcp_1.jpg
---

## 建立 TCP 连接
http 协议是基于 tcp 协议的。所以要发起一次 http 请求必须要先建立 tcp 连接。

<img src='/img/http_2_5.png' width=400 />

### 常用标志位
SYN: 发起连接； seq: 顺序号； ACK: 确认应答； FIN: 关闭连接

### 三次握手
握手过程中传送的包里**不包含数据**，三次握手完毕后，客户端与服务器才**正式开始传送数据**。理想状态下，TCP 连接一旦建立，只要通信双方不主动关闭连接，则 TCP 连接都将被一直保持下去。

1. 客户端发起连接，并向服务端发送一个顺序号(x)，这个 x 是由客户端自己维护的。

2. 服务端接收到客户端的 x 之后，给加 1 并返回给客户端，同时也要发送一个顺序号(y)给客户端，即 SYN + ACK 包， 这个 y 是由服务端自己维护的。

3. 客户端接收到 y 之后，给加 1 再传回给服务端作为应答码。此包发送完成则开始建立连接。

>   为什么客户端和服务端要各自维护一个顺序号呢？

    1. 因为 TCP 是面向连接的稳定的协议，所以他需要知道对方有没有接收到，以此用加1来判断。
    2. 一旦对方接收到数据包的话，那么传回来顺序号一定加1，否则按连接失败处理。

>   为什么三次握手就可以了？

    1. 因为在服务端给出响应时（如标注1）做了两件事。
    2. 告诉客户端我接收到了你传来的 x，并且同时向客户端发送了一个顺序号，一次握手干了两件事，再多握一次就浪费了。      

### 四次挥手
1. 主动关闭方会先发送一个 FIN 并附带序列号，表示告诉被关闭方，我已经不会再给你发数据了，**但是此时主动关闭方还可以接受数据**。

2. 被关闭方收到 FIN 信号后，发送一个确认应答码（收到的序列号加1），告诉客户端你这个关闭连接的请求我收到了。

3. 被关闭方发送一个 FIN 并附带序列号，用来关闭 被关闭方到主动关闭方的数据传输，即告诉对方我不会再给发数据了。

4. 主动关闭方发送一个确认应答码（收到的序列号加1），至此完成四次挥手。

> 注意点：

    1. 发送 FIN 信号只是代表不能继续发送数据，但是可以接受数据。
    2. 在很多时候，TCP连接的断开都会由TCP层自动进行，例如CTRL+C终止程序，TCP连接依然会正常关闭。

> 为什么需要四次挥手？三次不行吗

    1. 因为在第二次和第三次之间必须要有一个空闲时间（如标注2）。服务端需要利用这个空闲时间去处理后事，去清除释放资源。
    2. 还有一点就是，被关闭方虽然收到了 FIN 通知，但是自己向对方发送的数据未必发完，所以需要再发一次 FIN，表示我的数据也都传完了，同意关闭连接。

>   第四次挥手后为什么要等待 2MSL 时间才能转换为 closed 状态?

    1. MSL 指的是一段报文的最大生存时间，2MSL也就是这个时间的2倍即2-4分钟，表示主动关闭的一方将继续等待2-4分钟。
    2. 首先网络是不可靠的，即不能保证最后一次 ACK 对方一定能收到，所以一旦收不到还需要继续发，在这个 2MSL 时间段内会重新发。
    3. 在一个，避免报文被混淆，就是说避免其他时候的连接被当成本次的连接。

### 滑动窗口机制
参考链接：[理解滑动窗口](https://labuladong.gitbook.io/algo/labuladong-he-ta-de-peng-you-men/30-zhang-tu-jie-tcp-zhong-chuan-hua-dong-chuang-kou-liu-liang-kong-zhi-yong-sai-kong-zhi-fa-chou)

>   为什么要引入滑动窗口？

    1. TCP 建立连接成功后，开始传输数据，在这一过程中，每发送一次数据，都要等待确认应答，只有收到应答了才开始发下一段数据。
    2. 所以这种传输模式效率是比较低的，比如我收到你的数据了，但是我去做别的事了，一直没有应答你，那么你就需要一直等着。所以显然这是不合。
    3. 所以这种传输的缺点就是数据包往返时间越长，则效率越慢，所以才有了滑动窗口概念。

>   什么是窗口？什么是窗口大小？由谁来决定窗口大小？
    
    1. 窗口：实际上是指操作系统开辟的一个缓存空间，发送方在等到确认应答返回之前，必须在缓冲区中保留已发送的数据。如果按期收到确认应答，此时数据就可以从缓存区清除。
    2. 窗口大小就是指：无需等待确认应答，而可以继续发送数据的最大值。
    3. 接收方来决定窗口大小。TCP 头里有一个字段叫 Window，这个字段是接收方告诉发送方我还能接受多少数据，于是发送端就可以根据这个接收端的处理能力来发送数据。  

假设窗口大小为 3 个 TCP 段，那么发送方就可以连续发送 3 个 TCP 段，并且中途若有 ACK 丢失，可以通过下一个确认应答进行确认。如下图：

<img src='/img/http_2_12.png' width='400' style="margin-bottom: 10px" />

>   发送方的滑动窗口

    1. 如下图。通过三个标注的指针，划分四块区域 #1 #2 ...
    2. 仔细看黄色部分，如果发送方把数据都发完了，即可用窗口变为 0 了，那么就只能等待确认应答，才能继续向右移动滑动窗口。
    3. 绝对指针 1 指向的是已发送但未收到确认的第一个字节的序列号。绝对指针 2 指向的是未发送但在可发送范围的第一个字节的序列号。
    4. 为什么说 #4 区域那个是相对指针，因为他会被滑动窗口慢慢吞食掉，因为 #1 会不断增加（已发送且已确认）。就会使滑动窗口向右移动。
    
<img src='/img/http_2_13.png' width='550' style="margin-bottom: 10px" />    

>   接收方的滑动窗口

    1. 如下图。由两个指针划分三块区域。#3 接受窗口会不断向右移动直到数据全部接收完成。
    2. 接收窗口大小和发送窗口大小并不是完全相等，接收窗口的大小是约等于发送窗口的大小的。
    3. 因为滑动窗口并不是一成不变的。比如，当接收方的应用进程读取数据的速度非常快的话，这样接收窗口可以很快的就空缺出来。
       那么新的接收窗口大小是通过 TCP 报文中的 Windows 字段来告诉发送方。在这个传输过程是存在时延的，所以接收窗口和发送窗口是约等于的关系。

<img src='/img/http_2_14.png' width='550' style="margin-bottom: 10px" />