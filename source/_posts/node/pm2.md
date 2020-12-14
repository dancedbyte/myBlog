---
title: 使用 pm2 管理 node 进程 
tags: pm2
categories: node
date: 2020-11-01
index_img: /img/pm2_1.jpg
---

## 前置知识

### node cluster
js 是单线程的，当然 node 也不例外，但是 node 采用的是**多进程单线程**的模式。

node 由于单线程的限制，在多核服务器上，往往需要启动多个进程才能让服务器性能最大化。所以 node 引入了 cluster 模块，通过一个主进程 (master) 管理多个子进程 (worker) 的方式实现集群。 

**官网示例**
```js
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length; // 获取系统 cpu 核数

// 如果是主进程
if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork(); // fork 出子进程
  }

  // 子进程被‘杀死’时  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // 子进程创建服务  
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);

  // 子进程已启动
  console.log(`Worker ${process.pid} started`);
}
```

>   如上只用了一套代码，是怎样通过 cluster.isMaster 判断代码是在主进程执行还是子进程执行的呢？ 
    
    1. 通过 cluster 代码实现上可以看出：只需要判断当前进程有没有环境变量 “NODE_UNIQUE_ID” 就可知道当前进程是否是主进程。
    2. 而变量 “NODE_UNIQUE_ID” 则是在主进程 fork 子进程时传递进去的参数。因此采用 cluster.fork 创建的子进程是一定包含 “NODE_UNIQUE_ID” 的。
    
```js
module.exports = ('NODE_UNIQUE_ID' in process.env) ?
                  require('internal/cluster/child') :
                  require('internal/cluster/master');
```

>   必须通过 cluster.fork 创建的子进程才有 NODE_UNIQUE_ID 变量.

### 进程通信
node 中主进程和子进程之间通过 (**IPC**) **实现进程间的通信**。进程间通过 send 方法发送消息，监听 message 事件收取信息。

这是 node 中 cluster模块 通过集成 EventEmitter 事件监听实现的。

**官网示例**
```js
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length; // 获取系统 cpu 核数

if (cluster.isMaster) {
  // 记录请求次数。通过计时器轮询
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);

  // fork 出子进程
  for (let i = 0; i < numCPUs; i++) {
     cluster.fork();
  }

  for (const id in cluster.workers) {
    // 通过 on 给每个子进程绑定 message 事件进行监听
    cluster.workers[id].on('message', function(msg) {
        if (msg.cmd && msg.cmd === 'notifyRequest') {
            numReqs += 1;
        }
    });
  }

} else {
  // 子进程创建服务
  http.Server((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');

    // 通过 send 发送信息
    process.send({ cmd: 'notifyRequest' });
  }).listen(8000);
}
```

### 负载均衡
通过上面进程通信可以看出，主进程通过 cluster.fork 的方式创建子进程。

其实在 linux 系统中内置了 fork 方法。**为什么 node 还需要自己去实现 cluster 模块呢**？

#### 内置 fork 方法缺点
1. linux 内置的 fork 方法，fork 出来的子进程 listen 绑定同一端口会导致端口占用错误。

2. fork 出来的子进程之间没有负载均衡。

#### cluster 模块如何解决
1. cluster 模块中，针对第一个问题，通过判断当前进程是否为 master 进程，若是则监听主进程端口。若不是则表示为 fork 出来的 worker 子进程，cluster 模块**不关心子进程的端口**。**即只监听主进程的端口**。

2. 针对第二个问题，cluster 模块内置了负载均衡功能，master 进程负责监听端口接收请求，然后通过调度算法（默认为 Round-Robin，可以通过环境变量 NODE_CLUSTER_SCHED_POLICY 修改调度算法）**分配给对应的 worker进程**。

## pm2 机制
**pm2 基于 cluster模块 进行了封装**。能自动监控进程状态、重启进程、停止不稳定进程、日志存储等。

所以 pm2 可以通过协调各个进程间的关系来实现负载均衡，比如 pm2 restart app.js 重启一个项目时，pm2 不会直接关闭之前的所有进程，而是一个个的去关闭，并在关闭的过程中去 restart 新的项目，等新项目完全启动后那么旧程序的进程也全部被关闭了。

### 架构简述
**pm2 中有两个重要的进程和一个远程调用协议**：Satan进程（撒旦可理解为邪恶魔鬼）、God Deamon守护进程、RPC 协议。

Satan 进程中 Satan.js 提供程序的退出、杀死等方法。

Deamon 守护进程 中 God.js 负责维持进程的正常运行，当有异常退出时能保证重启。**Deamon 进程启动后一直运行，相当于 cluster 中的 Master进程**，维持 worker 子进程的正常运行。

RPC 指远程过程调用协议，在 pm2 中用于同一机器上的不同进程之间的方法调用。 

### 执行流程

<img src="/img/pm2_2.png" style="width: 500px" /> 

1. 每次在命令行输入命令(pm2 restart ...)时，都会先去执行一次 Satan 程序，因为只有通过 Satan.js 才能调用 Deamon 进程中的 God.js。

    >   个人理解：既然 Satan 负责‘杀死’程序，那么启动程序理应也从 Satan 发起，所以输入命令时才会先去执行 Satan.js   

2. 如果 Deamon 进程不在运行，首先需要通过 God.js 启动 Deamon 进程。

3. 启动后，Satan 进程通过 rpc 协议与 Deamon 进程建立联系。

4. 解析用户输入的指令，然后调用 prepare 方法。prepare 方法会调用 cluster.fork，完成集群的启动。

