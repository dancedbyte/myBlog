---
title: 从 零 实现 Redux
tags: Redux
categories: MVVM
date: 2020-11-04
index_img: /img/react_5_1.png
---

## Redux 特点
- 统一的状态管理，一个应用中只有一个仓库（store）
- store 中的 state 数据不能直接修改，修改只能通过派发器（dispatch）派发一个动作（action）。
- 修改 state 的逻辑封装在 reducer 中，reducer 接受旧的 state 和 action，返回新的 state 给到 view。**reducer是纯函数**。
- middleware 中间件用来处理副作用，他可以**增强我们的 dispatch**，将中间件一层层包裹到 dispatch 上。比如包装错误捕获机制、异步处理机制。

<img src="/img/react_5_1.png" style="width: 400px; margin-bottom: 15px" />

1. View 层也就是我们写的组件通过 dispatch 触发一个 action。如果需要处理脏的异步操作，就需要用 applyMiddleware 包装我们可能用到的 middleware。
2. reducer 接受派发过来的 action 和旧的 state，返回一个新的 state。
3. view 层接收到新的 state。更新组件、渲染页面。

## Redux与函数式编程
redux 是比较经典的函数式编程的实现。如 Container 中含有 value 和 map 两个属性，而修改 value 的方法只有 map，在操作完
value 后将新值放回 Container 中。

### 对应关系

- store -> container 容器
- currentState -> 的 _value
- action -> f，map 中接收的 f 函数
- currentReducer -> map，接收函数作用于 _value
- middlerware -> IO函子，处理脏操作

### 概述

1. 创建 store 其实是创建了一个 container 容器。

2. currentState 对应容器中的 _value，而想把容器变强大，变成一个函子，就需要有一个 map 方法（即具有一个 map 方法并且 map 可以接收变形关系 f）。

3. 而 redux 中就有个 currentReducer 的作用类似于 map，接收 action，即我们所说的变形关系 f。可以改变当前的 currentState，也就是函数式编程中的 _value。

4. 因为所有的异步操作是脏的，可以通过 IO 函子去解决，IO 函子即 redux 里的 middleware，middleware 可以自动地向下 next，next 实际上是一个 monad 函子。最后通过函数柯里化、函数组合才完成 middleware 的处理及合并。

## 开始编写

## React-Redux
1. 我们一般会在项目应用的外层包括一层 Provider，它其实只是一个外层容器，原理是通过 react 的 Context API 来实现的。

   同时需要给 Provider 设置好 store，Provider 的作用就是通过配合 connect 来达到组件跨层级传递数据，那么整个项目都可以直接获取这个store。
    
2. connect 的作用是**连接 React 组件与 Redux 中的 store**，它在我们写的组件外包了一层。它接收 store 里面的 state 和 dispatch，经过 reducer 处理后以 props 属性形式传给我们的容器组件。

3. 一般 connect 常用的接受的参数有 2 个，如下：

    mapStateToProps: 将 store 里的 state(数据源) 绑定到指定组件的props中，即当前组件通过 props 可以获取到 store 中的 state 数据。
    
    mapDispatchToProps: 将 store 里的 action(操作数据的方法) 绑定到指定组件的 props 中。

TODO connect 内部如何实现
