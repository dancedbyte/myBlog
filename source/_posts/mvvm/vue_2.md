---
title: Vue 深入源码（二）
tags: Vue
categories: MVVM
date: 2020-10-19
index_img: /img/vue_2_1.png
---

# Vue 深入源码
vue2的主要核心就是双向绑定、响应式原理这一块。通过上一节 vue 原理分析我们大致了解了整个过程是通过：模板渲染（_render）、observer、 dep、 watcher 等的相互协作来完成。

所以我们在代码层面来看下具体是怎么实现的？主要讨论以下两方面。

>   ① Vue 初始化到第一次渲染生成 Dom 。

>   ② Vue 数据更新到页面重新生成 Dom 。

## 初始化到第一次生成 DOM
先写一段很常用的代码，一点点分析。

```js
<template>
  <div>
    {{ message }}
  </div>
</template>

<script>
new Vue({
  data: {
    message: "hello world",
  },
});
</script>
```


### Observer 将数据处理成响应式
1. 通过 Object.defineProperty 监听并修改 data 的属性。

2. Dep 对象用于依赖收集，它实现了一个发布订阅模式，完成了数据 Data 和渲染视图 Watcher 的订阅。**下文会继续分析 Dep**。

```js
/**
 obj: {message: 'hello world'}。即我们定义的 data 属性
*/
function walk(obj) {
    Object.keys(obj).forEach(function (key) {
        defineReactive(obj, key, obj[key]);
    })
}

function defineReactive(obj, key, val) {
    var dep = new Dep(); // 初始化依赖收集的过程。创建一个电话本。实现发布订阅模式
 
    Object.defineProperty(obj, key, {
        get: function () {
            // 依赖收集。Dep.target 通过后文我们会发现指的是 watcher
            if (Dep.target) {  
                dep.depend();
            }
            
            return val;
        },
        set: function (newVal) {
            if (newVal === val) return;
            
            val = newVal;
            dep.notify(); // 修改数据时，通知watcher，页面重新渲染
        }
    })
}
```

### Dep 实现发布订阅模式
1. Dep 通过简短的代码实现了发布订阅模式。通过 addSub 完成订阅，notify 实现发布。

2. **所有涉及 watcher 相关的会在下文继续分析**。

```typescript
class Dep {
    static target: ?Watcher; // 根据 ts 类型提示，可以看出 Dep.target 是一个 Watcher 类型。
    subs: Array<Watcher>; // subs 存放搜集到的 Watcher 对象集合

    constructor() {
        this.subs = [];
    }

    addSub(sub: Watcher) {
        this.subs.push(sub); // 在 watcher 中会调用该方法。搜集所有使用到这个 data 的 Watcher 对象。
    }

    depend() {
        if (Dep.target) {
            // 调用 watcher 的 addDep 方法。搜集依赖，最终会调用上面的 addSub 方法
            Dep.target.addDep(this); // 将 dep 实例传给 watcher
        }
    }

    notify() {
        const subs = this.subs.slice();
        
        for (let i = 0, l = subs.length; i < l; i++) {
            // 调用对应的 Watcher，更新视图
            subs[i].update();
        }
    }
}
```

### Watcher 将 _render 和 Dep 关联
Watcher 实现了模板渲染方法 _render 和 Dep 的关联，初始化 Watcher 的时候，打上 Dep.target 标识，然后调用 get 方法进行页面渲染。


```typescript
class Watcher {
    constructor(vm: Component, expOrFn: string | Function) {
        this.getter = expOrFn; // 这里的 expOrFn 其实就是 vm._render，后文会讲到。
        this.value = this.get();
    }

    get() {
        Dep.target = this; // 给 Dep.target 标识为当前 Watcher 对象
        const value = this.getter.call(this.vm, this.vm); // this.getter 其实就是 vm._render。用来生成虚拟 dom、执行 dom-diff、更新真实 dom。

        return value;
    }

    addDep(dep: Dep) {
        dep.addSub(this); // 将当前的 Watcher 添加到 Dep 中。即我们在上文 Dep 中提及的 depend 中调用该方法。
    }

    update() {
        queueWatcher(this); // 将当前 watcher 加入到异步队列，实现批量更新
    }

    run() {
        const value = this.get(); // 和初始化一样，会调用 get 方法，更新视图。在下文讨论数据更新时会调用 run 方法。
    }
}
```

### 模板渲染
1. 通过上文发现数据已经关联起来并且处理差不多了，先简单梳理下上文提到的整个流程。

    ① Vue 通过 defineProperty 完成了 data 中所有数据的代理，当数据触发 get 查询时，会将当前的 Watcher 对象加入到依赖收集池 Dep 中。
    
    ② 当数据 data 变化时，会触发 Dep.notify 通知所有使用到这个 data 的 Watcher 对象去 update 视图。

2. 接下来就是模板渲染的阶段了。其实 new Vue 执行到最后，会调用 mount 方法，将 Vue 实例渲染成 dom。

3. 通过如下步骤梳理 new Vue 的整个流程。可以发现 **Watcher 在 生命周期beforeMounted 阶段建立**。

```typescript
// 1. Vue.prototype._init(option)
// 2. vm.$mount(vm.$options.el) 挂载到具体的某个节点如 el: "#app",
// 3. render = compileToFunctions(template) ，编译 Vue 中的 template 模板，生成 render 方法。
// 4. Vue.prototype.$mount 调用上面的 render 方法挂载 dom。
// 5. mountComponent

// 6. 创建 Watcher 实例
const updateComponent = () => {
    vm._update(vm._render());
};
new Watcher(vm, updateComponent); // 通过上文分析watcher，我们可以发现 updateComponent 就是传入 Watcher 内部的 getter 方法。

// 7. new Watcher 会执行 Watcher.get 方法
// 8. Watcher.get 会执行 this.getter.call(vm, vm) ，也就是执行 updateComponent 方法
// 9. updateComponent 会执行 vm._update(vm._render())

// 10. 调用 vm._render 生成虚拟 dom
Vue.prototype._render = function (): VNode {
    const vm: Component = this;
    const {render} = vm.$options;

    let vnode = render.call(vm._renderProxy, vm.$createElement);
    return vnode;
};

// 11. 调用 vm._update(vnode) 渲染虚拟 dom
Vue.prototype._update = function (vnode: VNode) {
    const vm: Component = this;
    
    if (!prevVnode) {
        // 初次渲染
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false);
    } else {
        // 更新
        vm.$el = vm.__patch__(prevVnode, vnode);
    }
};

// 12. vm.__patch__ 方法就是做的 dom diff 比较，然后更新 dom。
```

## 数据更新到重新生成 DOM

### 源码分析
Vue 中的数据更新是异步的，意味着我们在修改完 Data 之后，并不能立刻获取修改后的 DOM 元素。

1. 但是在 Vue 的 nextTick 回调中能拿到真正的 DOM 元素。

```js
<template>
  <div>
    <span id="text">{{ message }}</span>
    <button @click="changeData">
      changeData
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "hello",
    };
  },
  methods: {
    changeData() {
      this.message = "hello world";
      
      const textContent = document.getElementById("text").textContent;
      
      console.log(textContent === "hello world"); // false 直接获取，不是最新的
	  
	  // $nextTick 回调中，是最新的
      this.$nextTick(() => {
        const textContent = document.getElementById("text").textContent;
        console.warn(textContent === "hello world"); // true
      });
    },
  },
};
</script>
```

2. 我们知道更新会将所有用到这个数据的 watcher 加入到异步更新队列。具体如何实现的呢？

    通过以下代码可以发现会将需要更新的 watcher 添加到队列中，然后把具体更新方法 flushSchedulerQueue 交给 nextTick 去执行。

```js
// 当一个 Data 更新时，会依次执行以下代码
// 1. 触发 Data.set
// 2. 调用 dep.notify
// 3. Dep 会遍历所有相关的 Watcher 执行 update 方法

class Watcher {
  // 4. 执行更新操作
  update() {
    queueWatcher(this);
  }
}

const queue = [];

function queueWatcher(watcher: Watcher) {
  // 5. 将当前 Watcher 添加到异步队列
  queue.push(watcher);
  
  // 6. 执行异步队列，并传入回调
  nextTick(flushSchedulerQueue);
}

// 更新视图的具体方法
function flushSchedulerQueue() {
  let watcher;

  // 排序，先渲染父节点，再渲染子节点。这样可以避免不必要的子节点渲染，如：父节点中 v-if 为 false 的子节点，就不用渲染了
  queue.sort((a, b) => a.id - b.id);
  
  // 遍历所有 Watcher 进行批量更新。
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];

    watcher.run(); // 更新 DOM
  }
}
```

3. nextTick 中做了什么呢？

    nextTick 将传入的 flushSchedulerQueue 更新视图方法添加到 callbacks 数组中，然后执行 timerFunc 方法。

```typescript
const callbacks = [];
let timerFunc;

function nextTick(cb?: Function, ctx?: Object) {
  // 1. cb 指具体更新视图的方法：flushSchedulerQueue。将传入的更新方法添加到回调数组
  callbacks.push(() => {
    cb.call(ctx);
  });
  
  // 2. 执行异步任务。此方法会根据浏览器兼容性，选用不同的异步策略
  timerFunc();
}
```

4. 进一步分析 timerFunc 如何进行异步处理？

    timerFunc 是根据浏览器兼容性创建的一个异步方法，它执行完成之后，会调用 flushSchedulerQueue 方法进行具体的 DOM 更新。

```
let timerFunc;

// 判断是否兼容 Promise
if (typeof Promise !== "undefined") {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  };
  // 判断是否兼容 MutationObserver（在指定dom发生变化时调用）
} else if (typeof MutationObserver !== "undefined") {
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  // 判断是否兼容 setImmediate。该方法存在一些 IE 浏览器中
} else if (typeof setImmediate !== "undefined") {
  // 这是一个宏任务，但相比 setTimeout 要更好
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  // 如果以上方法都不知道，兜底 使用 setTimeout 0
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

// 异步执行完后，执行所有的回调方法，也就是执行 flushSchedulerQueue
function flushCallbacks() {
  for (let i = 0; i < copies.length; i++) {
    callbacks[i]();
  }
}
```

5. 最后总结下为什么 this.$nextTick 能够获取更新后的 DOM？

    ① 调用 this.$nextTick 其实就是调用了上文分析的 nextTick 方法，在异步队列中执行传入的回调函数。
    
    ② 根据队列先来先执行的原则，修改 data 触发的更新异步队列会先得到执行（即插队），执行完成后就生成了新的 DOM ，所以在 this.$nextTick 的回调函数中，就能获取到更新后的 DOM 元素了。
    
    ③ 通过上文可以看出nextTick只是通过 Promise、setTimeout 简单的实现了异步任务。所以我们也可以手动执行一个异步任务实现相同的效果。
    
```js
this.message = "hello world";
const textContent = document.getElementById("text").textContent;

// 手动执行一个异步任务，也能获取最新的 DOM
Promise.resolve().then(() => {
  console.log(textContent === "hello world"); // true
});

setTimeout(() => {
  console.log(textContent === "hello world"); // true
}, 0);
```

### 异步更新总结
1. 修改 Vue 中的 Data 时，就会触发所有和这个 Data 相关的 Watcher 进行更新。

2. 先将所有的 Watcher 加入到队列 Queue。然后调用 nextTick 方法执行异步任务。

3. 在异步任务的回调中，对 Queue 中的 Watcher 进行排序，然后执行对应的 DOM 更新。

## 总结
1. 从 new Vue 开始，首先通过 defineProperty 遍历 data 并监听其中的数据变化，同时创建 Dep 用来搜集使用该 data 的 Watcher。

2. 模板渲染阶段，创建 Watcher，并将 Dep.target 标识为当前 Watcher。

3. 模板渲染时，如果使用到了 data 中的数据，就会触发 data 的 get 方法，然后调用 Dep.addSub 将 Watcher 搜集起来。

4. 数据更新时，会触发 data 的 set 方法，然后调用 Dep.notify 通知所有使用到该 data 的 Watcher 去更新 DOM。

## 参考链接
- [图解 Vue 响应式原理](https://lmjben.github.io/blog/library-vue-flow.html#vue-%E5%88%9D%E5%A7%8B%E5%8C%96)
- [Vue源码之双向数据绑定](http://www.wclimb.site/2020/03/15/vue-source-code-data-bind/)
