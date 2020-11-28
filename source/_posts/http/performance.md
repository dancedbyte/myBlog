---
title: 前端中的性能优化
tags: 性能优化
categories: 浏览器
date: 2020-11-15
index_img: /img/performance_2.jpg
---

## 流程图
先上张浏览器从 准备——建立连接——渲染 全流程图！！

每个阶段的用时可以在 performance.timing 里，通过起点和终点之差进行查询。

<img src='/img/performance_1.png' width=700 style="margin-bottom: 10px" />

```js
window.onload = function(){
    setTimeout(function(){
        let t = performance.timing
        console.log('DNS查询耗时 ：' + (t.domainLookupEnd - t.domainLookupStart).toFixed(0))
        console.log('TCP链接耗时 ：' + (t.connectEnd - t.connectStart).toFixed(0))
        console.log('request请求耗时 ：' + (t.responseEnd - t.responseStart).toFixed(0))
        console.log('解析dom树耗时 ：' + (t.domComplete - t.domInteractive).toFixed(0))
        console.log('白屏时间 ：' + (t.responseStart - t.navigationStart).toFixed(0))
        console.log('domready时间 ：' + (t.domContentLoadedEventEnd - t.navigationStart).toFixed(0))
        console.log('onload时间 ：' + (t.loadEventEnd - t.navigationStart).toFixed(0))
 
        if(t = performance.memory){
            console.log('js内存使用占比 ：' + (t.usedJSHeapSize / t.totalJSHeapSize * 100).toFixed(2) + '%')
        }
    })
}
```

## 缓存

### localStorage 本地存储
1. 对于一些资源，包括远程加载的静态资源、以及接口数据。可以充分利用本地存储实现数据的缓存。

2. localStorage 最大5M，一般不要超过2.5M，不然在性能低的机器上就会卡顿。

3. 可以缓存的资源一般有些特征，可以总结为：该资源很少更新（如jquery.js等静态资源）、该资源按一定的规律去更新（如日榜单）。

4. 例如，页面上有一个日更新的榜单，每天定时更新一次，所以可以做一个当日缓存。

```js
// 当用户加载站点中的榜单组件时，可以通过该方法获取榜单数据
async function readListData() {
    const info = JSON.parse(localStorage.getItem('listInfo'));
    
    // 如果当前时间减去上一次记录的时间，大于一天，则该更新了
    if (isExpired(info.time, +(new Date))) {
        const list = await fetchList();
        
        localStorage.setItem('listInfo', JSON.stringify({
            time: +(new Date),
            list: list
        }));
        return list;
    }
    return info.list;
}
```

### 浏览器端缓存
具体可参考 [浏览器运行机制](https://www.ghmwin.com/categories/)

1. **内存缓存（Memory Cache）**:当访问一个页面及其子资源时，有时候会一个资源会被使用多次（如图标）。由于该资源已经存储在内存中，再去请求反而多此一举，浏览器则会直接去内存缓存中读取。

2. **强缓存**：与其相关的响应头则是 Expires 和 Cache-Control，读取本地硬盘（disk Cache）中的数据。

3. **协商缓存**：与其相关的响应头则是 Last-Modified 和 ETag，一般会用文件的 MD5 作为 ETag。

4. **主动推送（Push Cache）**：这是http2带来的特性，叫缓存检查。

    ```
    1. 简言之，过去一个 HTTP 的请求连接只能传输一个资源，而现在是在请求一个资源的同时，服务端可以“推送”一些其他资源（可能在之后就会用到一些资源）
    2. 例如，在请求 www.sample.com 时，服务端不仅发送了页面文档，还一起推送了关键 CSS 样式表。这也就避免了浏览器反复建立http连接所带来的资源消耗。
    ```

## 代码资源优化
**浏览器端的缓存只有在第二次去请求资源时才会生效**，如果想要第一次访问时有较好的性能，则需要对我们的代码资源进行优化。

### webpack打包压缩
具体可参考 [webpack学习路线](https://www.ghmwin.com/categories/)

### 图片优化
1. 200 * 200 的图片缩放后并不会比 100 * 100 的图片清楚多少，所以需要多大图片就准备多大图片就可以了。

2. 使用雪碧图（CSS Sprite），将多张图片合成到一张图片上，减少请求数，奇妙的是，多张图片聘在一块后，总体积会比之前所有图片的体积之和小。

    推荐生成雪碧图的网站：www.toptal.com/developers/

3. 使用字体图标（iconfont），字体图标只是往 html 里插入字符和 css 样式而已，资源占用和图片请求比起来小太多了。

## 请求阶段
一个请求走过了各级缓存阶段后，就开始真正发起请求了。

### DNS 预解析
具体可参考 [浏览器运行机制](https://www.ghmwin.com/categories/)

1. 根据域名解析出ip是一个非常耗时的过程，所以预解析是很有必要的。

2. dns-prefetch 是浏览器提供给我们的一个 API。它可以告诉浏览器：过会我就可能要去 yourwebsite.com 上下载一个资源，帮我先解析一下域名吧。这样之后用户点击某个按钮，触发了 yourwebsite.com 域名下的远程请求时，就略去了 DNS 解析的步骤。

3. 当然，浏览器并不保证一定会去解析域名，可能会根据当前的网络、负载等状况做决定。

```js
<link rel="dns-prefetch" href="//yourwebsite.com">
```

### 使用 CDN 技术
对于静态资源，我们可以考虑通过 CDN 来降低延时。CDN 工作流程如下：

1. 对于使用 CDN 的资源，DNS 解析会将该资源的域名解析到 CDN 服务的负载均衡器上。

2. 负载均衡器可以通过请求的信息获取用户对应的地理区域。

3. 从而通过负载均衡算法选择一台距离请求区域较近、负载较低的服务器来提供服务。

执行以下命令查看当前与目标服务器之间经过的所有路由器：

```js
# linux
traceroute baidu.com

# windows
tracert baidu.com
```

## 响应阶段
只讨论总结 nodejs 作为服务端的情况。

### 使用流进行响应
现代浏览器都支持根据流的返回形式来逐步进行页面内容的解析、渲染。这就意味着，即使请求的响应没有完全结束，浏览器也可以从手里已有的响应结果中进行页面的解析与渲染。

<img src='http://note.youdao.com/yws/res/10814/WEBRESOURCE9e877fc9a867f6b95dceb017cdfc8595' width=500 />

#### 示例1

```js
const Router = require('@koa/router');
const fs = require('fs');
const path = require('path');

const router = new Router();

router.get('/', async (ctx, next) => {
  const filename = path.resolve(__dirname, 'index.html');
  const stream = fs.createReadStream(filename); // 根据某个文件 创建可读流
  
  // 需要手动修复下状态，否则404
  ctx.status = 200;
  ctx.type = 'html';
  
  stream.on('data', (chunk) => {
    ctx.res.write(chunk);
  });
  
  ctx.res.end(); // 要手动关闭
});
```

#### 示例2

```js
const stream =  require('stream');

async actionBooksCreatePage(ctx) {
    const html = await ctx.render('books/pages/create'); 
    
    function createSSRStreamPromise() {
        return new Promise((resolve, reject) => {
          const htmlStream = new stream.Readable(); // 创建一个空的可读流
          
          htmlStream.push(html);
          htmlStream.push(null); // 必须push一个null，表示文件已经写入完成
          
          ctx.status = 200;
          ctx.type = 'html';
          ctx.res.setHeader('content-encoding', 'gzip'); // 设置gzip响应头
          
          const gz = createGzip(); // 这里的gzip和nginx的gzip不同，nginx的gzip只能对静态资源压缩，而这里的可以对任何请求资源进行压缩。
          
          htmlStream
            .on('error', (err) => {
              reject(err);
            })
            .pipe(gz)
            .pipe(ctx.res);
        });
      }
      await createSSRStreamPromise();
}
```

### BFF 业务聚合
简单定义就是 node 做中间层，聚合后端服务。让 node 去请求真实的服务器，处理数据后把前端想要的数据返回给前端，这样做的好处是：

1. 让前端专注于业务，接口数据处理逻辑放到node层，node只返回给前端想要的、干净的数据。

2. 如果前端需要进行两个请求，且第二个请求依赖于第一个请求的返回结果。这个业务逻辑如果放在前端处理将会串行发送两个请求。假设每个请求 200ms，那么就需要等待 400ms。如果引入BFF，这一层可以放在 NodeJS 中实现。NodeJS 部署的位置一般离其他后端服务“更近”（如同一个局域网）。这类服务间的请求耗时显然更低，可能只需要 200(浏览器) + 30(NodeJS) * 2 = 260ms。

## 浏览器解析与渲染

### 注意资源在页面文档中的位置
具体可参考 [css与js是否会影响dom的解析与渲染？](https://www.ghmwin.com/categories/)

### 使用 defer 和 async
当dom遇到js脚本时就停止解析，并去下载js，等js下载完成再继续解析dom。如果解析dom和下载资源可以并行就好了，当然也提供了两种方案：

1. **defer**：dom解析的同时下载脚本资源，等dom解析完成，再按脚本出现的顺序依次执行。

2. **async**：dom解析的同时下载脚本资源，脚本一旦下载完成就去执行该资源，同时阻塞dom的解析，不保证脚本间的执行顺序。

    ```html
    与主业务无关的脚本可以使用 async，如广告脚本等。这类资源一般不需要外部依赖，也不需要访问dom。这些脚本上使用 async 可以有效避免非核心功能的加载影响页面解析速度。
    ```

### GPU 硬件加速
1. GPU 加速一般指触发多个发生重排重绘的渲染层，让 gpu 分担更多的渲染工作。

2. 重排重绘是影响页面渲染性能的重要指标。所以我们可以把那些发生大量重排重绘的元素**单独触发一个渲染层**，避免影响其他渲染层。

3. video 元素、canvas、css3d、css 滤镜、z-index 大于某个相邻节点的元素都会触发新的渲染层，最常用的方法，就是给某个元素加上下面的样式：
    
    ```css
    transform: translateZ(0);
    backface-visibility: hidden; /* 隐藏被旋转元素的背面 */ 
    ```

## 参考链接
- [前端性能优化](https://alienzhou.github.io/fe-performance-journey/#%E5%89%8D%E7%AB%AF%E9%9C%80%E8%A6%81%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E4%B9%88%EF%BC%9F)
- [前端日志](https://lmjben.github.io/blog/)
