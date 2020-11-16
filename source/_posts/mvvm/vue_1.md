---
title: Vue 原理分析（一）
tags: Vue
categories: MVVM
date: 2020-10-18
index_img: /img/vue_1_2.png
---

## 目录结构

<img src='/img/vue_1_1.png' width=800 />

真正的代码实现在 src 目录下。**Vue.js 是由 core + 对应的“平台”补充代码构成**。

1. /compiler：模板编译。将 template 模版编译成js。 [模版在线编译工具](https://template-explorer.vuejs.org/#%3Cdiv%20id%3D%22app%22%3E%0A%20%20%7B%7B%20msg%20%7D%7D%0A%20%20%3Cp%3E1234%3C%2Fp%3E%0A%3C%2Fdiv%3E)

    ```js
    // template => render() => vdom(虚拟dom)
    function render() {
        // with 限定包裹函数的作用域为this。即 vue 实例。
        with(this) {
            return _c('div', {
                id: 'app',
                disabled: true,
            }, children)
        }
    }
    ```

2. /core：vue 的核心、重点。包括双向绑定的实现等。

3. /platforms：针对核心模块的‘平台’模块，操作dom、创建节点等。即跨平台的实现。目前有 web，weex。

4. /server：处理服务器端渲染。

5. /sfc：处理单文件 .vue，包括文件拆分（如哪里是template，哪里是script）。

6. /shared：提供全局用到的工具函数。

7. /entries：生产上线打包的入口。

## 模版编译阶段

### 在线编译
1. 运行到浏览器时编译并展示。

2. 通过 js 正则去循环遍历 template 模板，找出标签名及属性。正则会有一个性能问题，因为正则匹配本质就是回溯算法，导致反复递归遍历。**所以 vue3 对这块进行了优化**。

```js
// 组件名：counter
Vue.component("counter",{ 
	data: function() {
	    return { count: 0}
	},

	template:'<button v-on:click="count++">点击计算点击次数：{{count}}次</button>'
})
```

### 离线编译
上线前编译，在浏览器端展示前就已经被编译成 js（render函数） 了。

① .vue(template) => ② webpack 的 vue-loader(内置render方法)  =>  ③ js

## 双向绑定（响应式原理）

### 所涉及到的技术

<img src='/img/vue_1_2.png' width=600 style="margin-bottom: 10px" />

1. Object.defineProperty
2. Observer
3. Watcher
4. Dep
5. Directive

### Object.defineProperty
1. ES5 中的对象方法，可以监听或修改对象的属性，这里主要用来自定义 get 和 set 方法。**但是 defineProperty 无法监听通过改变 length 而新增加的元素**。

    ```js
    const arr = [1, 2, 3];
    arr[10] = 10; // defineProperty 是无法监听到10的
    ```


2. **初始化过程**就需要去监听对应的key。

    ```js
    const obj1 = {};
    Object.defineProperty(obj1, 'property1', {
          value: 42,
          writable: false,
          get: function() {
               console.log('获取时触发get!')
          }
    });   
    obj1.property1 = 77; // throws an error in strict mode
    console.log(obj1.property1); // 42
    ```

3. 例如向数组头部插入 unshift 了一个元素，因为数组是按下标来移动的，这就会导致反复触发 defineProperty 的 get 和 set。**所以 vue 才会需要重写数组方法**。

    >   注意：vue 对于嵌套对象要通过 defineProperty 递归。
    
    ```
    const obj = {
        a: {
            b: 1
        }
    }
    ```
4. 属性必须在 data 属性上存在，vue 才能通过 defineProperty 将它转化为响应式的，这也就造成了 vue **无法检测**到对象属性的添加或删除。

   所以 vue 提供了 Vue.set(object, propertyName, value) / vm.$set(object, propertyName, value) **来解决这一问题**。 


### Observer
1. **把数据处理成响应式数据**。一个目标对象管理所有相依于它的观察者对象，并且在它本身的状态改变时主动发出通知。

2. Observer 会观察两种类型的数据，**Object 与 Array**。由于 js 的限制， Vue 不能检测到 Array 的变化，会重写数组的原型方法。但是只重写了 push unshift splice shift sort **这些会影响数组 index 的方法**。

3. 以保证当 Array 发生变化时，直接触发 notify。
如果是 push，unshift，splice 这些添加新元素的操作，则会使用 observer 观察新添加的数据。

4. 对于 Object 类型的数据，则遍历它的每个 key，使用 defineProperty 设置 getter 和 setter，当触发 getter 的时候，observer 则开始收集依赖，而触发 setter 的时候，observer 则触发 notify。

### Watcher

<img src='/img/vue_1_3.png' width=600 />

1. Watcher 是将模板指令和 Observer 对象结合在一起的纽带。在执行 render 函数时会在组件层面创建一个 watcher。

2. 是订阅者模式中的**订阅者**。订阅指 将哪个模板指令依赖哪个数据，这种关系通过 addDep 添加到 Dep 中。Dep 即是发布者，当哪些数据变了就 notify 通知依赖项，Watcher 就会订阅到从而重新生成虚拟dom。

### Dep
1. 用于依赖收集，它实现了一个发布订阅模式。**在响应式过程中所存在的**，每生成一个 Observer 就会生成一个 Dep。 通过 Dep.addSub 将 订阅者（Watcher）搜集起来。

2. **是在 oberver 中维护的**。通过 notify 通知订阅者（watcher）更新视图。

### Directive
1. vue 的内置指令，如 v-model v-if 等。 这些指令都会抛出两个接口 bind 和 update。

2. 这两个接口的作用是，**编译的最后一步**是执行所有用到的指令的 bind 方法。而 update 方法则是当 watcher 触发 notify 时， Directive 会触发指令的 update 方法。

<img src='/img/vue_1_4.png' width=600 />

## 整体流程分析

<img src='/img/vue_1_5.png' width=600 style="margin-bottom: 10px" />

```html
<div id='app'> {{times}} </div> 
```

```js
new Vue({
    data: {
        times: 1
    }
})
```

1. 先创建 Vue 实例， observer 通过 defineProperty 的 get 和 set 去监听 data 中对应的 times 等数据，使 data 中数据变成响应式数据。**并建立与 Dep 的对应关系，因为每新建一个 observer 就会创建一个对应的 Dep**。

2. 编译模板，在有使用 v-model 等双向数据的地方，new Watcher，建立 DOM 和 observer 的对应关系。

3. 在 new Watcher 中，进行依赖收集，把使用到的 data 记录到 Dep 中。**即订阅**。

4. 每当数据变更，便会触发 set 方法，然后调用 Dep.notify 通知使用到 data 的 watcher，去更新 DOM。**即发布**。

>   vue 异步更新？

    Vue 异步执行 DOM 更新。只要观察到数据变化，Vue 将开启一个异步队列，并缓存在同一事件循环中发生的所有数据改变。
    
    如果同一个 watcher 被多次触发，只会被推入到队列中一次（这在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作上非常重要）。
    
    Vue 在内部尝试对异步队列使用原生的 setImmediate 和 MessageChannel（基于 postMessage），如果执行环境不支持，会采用 setTimeout(fn, 0) 代替。
    
    然后，在下一个的事件循环“tick”中，Vue 刷新队列并执行实际 (已去重的) 工作。
    
    修改数据 -> 触发 set-> 执行同步代码，如果有数据更新，则开启异步队列。
    
    -> 异步队列中进行去重操作，并注入 nextTick 回调函数。
    
    -> 异步操作执行完毕，即 DOM 成功渲染，触发 nextTick 回调函数。
    
>   nextTick ?
    
    在改变 data 中数据之后，需要获取 dom 节点中最新的数据。
    
    例如需要在视图更新之后，基于新的视图进行操作。例如通过 v-if 将一个隐藏的 input 显示，并在显示后获取 input 的焦点。       

```js
new Vue({
  el: "#app",
  data: {
   inputShow: false
  },
  methods: {
    show() {
      this.inputShow = true
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    }
  }
})
```
    
## keep-alive
vue 的 keep-alive 保存的是**虚拟dom**。而不是状态。

>   一旦一个页面保存大量的虚拟dom，内存会溢出，则整个页面会变卡，vue 对于 keep-alive 是如何优化的？

    1. 当内存不够时，对于内存中已有的vdom和新添加进来的vdom如何取舍。这种取舍算法叫 LRU。
    2. 会将栈底、不常用的vdom删除掉。如果一个vdom的使用率比较频繁，则会将这个vdom先从栈中拿出来在推进去（即提升它的位置）。

## Vue 所做的优化

### Vue2
1. 在编译时进行优化，给静态节点打 static: true 的标签，那么在dom diff 时就会跳过这些节点。

    ```html
    <template>
      <div>{{ message }}</div>
      <p>123</p> {/* 静态节点 */}
    </template>
    ```
    
    ```html
    const message = 123;
    <template>
      <div>{{ message }}</div> {/* 静态数据也会被标记 */}
    </template>
    ```
    
    ```html
    <template>
      <div v-for="i in 10">{{ i }}</div> {/* 静态循环也会被标记 */}
    </template>
    ```

### Vue3 
1. **首先版本3延续了上面版本2所做的优化**。并充分利用 js 的新特性，如用 Proxy 重写 vue。不再去用 defineProperty 监听某一个 key，而是直接通过 Proxy **拦截某个对象**。这样就可以不用再去遍历整个对象的 key。

    **但是不能识别深层嵌套对象。即只能代理一层**。
    
    >   vue3 中通过 reactive 判断当前值是否是对象，如果是对象则继续代理！如 a: {b: {c: 1}}。代理到 b 时发现 b 还是对象，则继续代理 b。术语叫**懒代理**。
    
    ```js
    const obj = {
      a: 1,
    }
    // 这样就可以实现监听整个对象，而不用去遍历
    const p = new Proxy(obj, {
          get(target, key, receiver) {
                console.log('get key', key);
                return Reflect.get(target, key, receiver);
          },
          set() {
                console.log('set key', key);
                return Reflect.set(target, key, receiver);
          }
    });
    console.log(p.a); 
    // get key a 
    // 1
    ```

2. 优化了 vue2 的架构设计。vue3 实现拆包，各个功能可拿出来独立使用，减少耦合度。例如 vue2 中 $set 直接挂载到大对象上，但并不是所有地方都要用到 $set。

3. 弃用 vue2 中的正则编译，启用状态机机制（即定义多种状态规则，便于拓展新语法）。

4. 静态节点字符串化。

5. Block Tree 动态标记。编译时优化，将动态属性节点提升到顶部，这样就避免了没有用的逐层遍历。**但是增删节点的操作是无法使用 Block Tree 的**，因为无法定位到哪些节点增加或删除。则继续使用 dom diff

    <img src='/img/vue_1_6.png' width=300 />

6. 新增 setup API。组件挂载前执行。可以将一些函数实现的某个功能用 setup 包装起来，然后返回模板所需要用的状态。

## react 与 vue 对比分析
1. vue 是编译时优化。react 是运行时优化。

    ```
    ① 所以vue严格限制了模板语法，必须按照规定的去写，只有这样才能编译成功。
    ② react 的语法写起来比较简单， 这也导致了他无法做编译时优化，所以才会有fiber等机制来做运行时优化。
    ```

2. vue 实现一个组件一个 Watcher，在组件层面进行 dom diff。
    
    react 则无法知道哪个组件的哪个数据发生了变化，没有做双向映射、没有 watch 的过程，所以需要从头到尾进行 diff，这会造成阻塞。所以 react 会在运行时去做优化。
