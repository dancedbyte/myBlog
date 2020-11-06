---
title: React SSR 原理及实践
tags: React
categories: MVVM
date: 2020-10-30
index_img: /img/react_3_1.png
---

## 常见项目类型
1. **SPA**：单页面应用，如react vue 构建的应用，打包后生成dist目录，通过路由控制页面（即组件）的显示，这种路由叫假路由。通过nginx反向代理完成项目的上线。

    **优点**：切页快、局部刷新（因为已经加载了所有js）。前后端分离开发加快项目进度。
    
    **缺点**：SEO 不友好（SPA 渲染的只是一个空的html）。首屏易白屏（因为需要加载所有的js）。


2. **SSR**：即服务端渲染。服务端直接吐出 html。

    **优点**：SEO 友好（通过服务端渲染出了该页面上所有 html 元素）。首屏直出（不用等待 js 加载）。
    
    **缺点**：服务器压力大。虽然首屏加载较快但是每切换一个页面都需要重新请求资源（没有做到局部刷新）。**可见不一定可操作（因为服务端只是渲染出了html，还需要客户端去请求js、绑定dom事件等）。**部分开发受限（如服务端不能使用ComponentDidMount等函数）。

3. **同构**：融合 SPA 和 SSR 的优点（刷页SSR，切页SPA），如 React-SSR。一套代码既可以在服务端运行又可以在客户端运行。在这套代码或逻辑中，理想状况是在浏览器端进一步渲染的过程中，判断已有的 DOM 结构和即将渲染出的结构是否相同，若相同则不重新渲染 DOM 结构，只需要进行事件绑定即可（即完成了局部刷新）。

## React SSR
- 技术栈：react + koa2 + ts
- 流程图：摘自[一文吃透 React SSR 服务端渲染和同构原理](https://segmentfault.com/a/1190000020417285)

<img src="/img/react_3_2.png" style="width: 700px" />

### 搭建服务器

#### 安装依赖
```
koa @types/koa
```

#### 配置静态资源服务器
koa-static

#### React 组件直出

#### SSR 路由

### 搭建客户端

#### 安装依赖
```
react @types/react 
react-dom @types/react-dom
```

### 配置 webpack 打包
