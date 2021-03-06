---
title: 日常整理 手写面试题
tags: JavaScript
categories: Interview
date: 2020-09-29
index_img: /img/about_js_4.jpg
---

## 封装一个请求函数
可以设置最大请求次数，请求成功则不再请求，请求失败则继续请求，直到超过最大次数。

```js
// 主要是在 error 里判断，实际应用中可以理解 maxCount 为重试次数，避免出现死循环
function requestFunc(url, body, successCallback, errCallback, maxCount) {
	return fetch(url, body)
      	.then(res => successCallback(res))
      	.catch(err => {
      		 if(maxCount <= 0) return errCallback('请求超时');

        	  return requestFunc(url, body, successCallback, errCallback, --maxCount); // 每次maxCount自减
    	  })
}

requestFunc('https://everyPath', {}, res => {
  console.log(res.json())
}, err => {
  console.log(err);
}, 3)
```

## 写一个 mySetInterVal(fn, a, b)
每次间隔 a, a+b, a+2b, ..., a+nb 的时间，然后写一个 myClear，停止上面的 mySetInterVal

```js
class MyInterval {
  constructor(fn, a, b) {
    this.fn = fn;
    this.a = a;
    this.b = b;
    
    this.number = 0;
    this.timer = -1;
  }
  
  start() {
    this.timer = setTimeout(() => {
      this.fn();
      this.number++;
      this.start();
    }, this.a + this.number * this.b);
  }
  
  clear() {
    clearTimeout(this.timer);
    this.number = 0;
  }
}
const interval = new MyInterval(() => console.log('test'), 100, 500);
interval.start();
interval.clear();
```

## 实现一个链式调用
在每个函数中返回 this，确保链式调用。

```js
const person = {};

person.say = function(x) {
    console.log(x);
    return this;  
}
person.eat = function(y) {
    console.log(y);
    return this;  
}
person.show = function(z = 3) {
    console.log(z);
    return this;  
}

person.say(1).show().eat(2);
```

## 实现 lodash 的 _.get 方法
接收三个参数：检索的对象、路径（字符串或数组）、不存在时的默认值。

[lodash 官网中关于 _.get 的使用](https://www.lodashjs.com/docs/lodash.get)

```js
const get = (obj, path, defaultVal = '') => {
  if(obj !== null && typeof obj !== 'object') return;
  
  // path 可以是 字符串 或 数组
  const pathArr = typeof path === 'object' ? path : path.split('.');
  let curObj = JSON.parse(JSON.stringify(obj));
  
  for(const k of pathArr) {
    if(k.includes('[')) {
      const res = k.replace(/[ \[\] ]/g, ',').split(',');

      curObj = curObj[res[0]][res[1]]; // 取出 'a[0]' 中的 a 和 0
    } else {
      curObj = curObj[k];	
    }
    if(!curObj) return defaultVal;
  }
  
  return curObj;
}

const object = { 'a': [{ 'b': { 'c': 3 } }] };
console.log(get(object, 'a[0].b.c')); // 3
console.log(get(object, ['a', '0', 'b', 'c'])); // 3
console.log(get(object, 'a.b.c', 'default')); // default
console.log(get(object, 'b', 'default')); // default
```

## Semantic Versioning 是一个前端通用的版本规范
格式为“{MAJOR}.{MINOR}.{PATCH}-{alpha|beta|rc}.{number}”，
要求实现 compare(a, b) 方法，比较 a, b 两个版本大小，
  1. 当 a > b 是返回 1；
  2. 当 a = b 是返回 0；
  3. 当 a < b 是返回 -1；
  4. 其中，rc > beta > alpha，major > minor > patch；
  5. 例子，1.2.3 < 1.2.4 < 1.3.0-alpha.1 < 1.3.0-alpha.2 < 1.3.0-beta.1 < 1.3.0-rc.1 < 1.3.0
  
```js
const compare = (a, b) => {
  const aArr = a.split(/\.|-/); // 类似 ["1", "3", "0", "alpha", "1"]
  const bArr = b.split(/\.|-/);
  const obj = {
    'rc': -1,
    'beta': -2,
    'alpha': -3
  }
  
  for(let i = 0; i < 5; i++) {
    const n1 = +aArr[i] || obj[aArr[i]] || 0; // + 转化为number类型
    const n2 = +bArr[i] || obj[bArr[i]] || 0;
    
    if(n1 > n2) return 1;
    if(n1 < n2) return -1;
  }
  return 0;
}

console.log(compare('1.3.0-rc.1', '1.3.0')); // -1
```

## 实现一个发布订阅模式
1. 发布订阅模式涉及三个对象：订阅者（可能会有多个）、发布者、主题对象（即数据）

2. 每当主题对象状态发生改变，相关订阅者就会得到通知，并主动更新。

```js
// 主题对象
function Dep() {
    this.subs = []; // 订阅者列表
}
// 主题对象通知订阅者
Dep.prototype.notify = function () {
    this.subs.forEach(it => {
        it.update(); // 执行每个订阅者自己的更新方法
    });
};

// 订阅者
function Sub(x) {
    this.x = x;
}
// 订阅者自己的更新方法
Sub.prototype.update = function () {
    this.x = this.x + 1;
    console.log(this.x);
};

const dep = new Dep(); // 主题对象实例
dep.subs.push(new Sub(1), new Sub(2)); // 新增几个订阅者

// 发布者
const pub = {
    publish: function () {
        dep.notify();
    }
};
pub.publish(); // 发布更新 输出 2 3
```

## 实现 LRU cache
LRU 即最近最少使用算法。

1. get / put 有效操作时，均为 先 cache.delete(k) 再 cache.set(k, v)。

2. 当内存不够时，移除最近最少使用项，可借助 Map 通过 cache.keys().next().value 获取第一个 key（即最少使用)

3. 因为 Map 本身具备 LRU 性质。通过 delete(key)、set(key) 就会将该 key 移动到尾部。

```js
class LRUCache {
    constructor(memory) {
        this.cache = new Map(); // 可以把 cache 理解成一个管道，当内存不够时，第一个元素就要被挤出管道。
        this.memory = memory
    }
    get(k) {
        if (!this.cache.has(k)) return -1

        const v = this.cache.get(k)

        this.cache.delete(k);
        this.cache.set(k, v); // 先删除 在推入管道，表示该元素最近被使用过。

        return v
    }
    put(k, v) {
        if (this.cache.has(k)) this.cache.delete(k);

        this.cache.set(k, v);

        if (this.cache.size > this.memory ) {
            this.cache.delete(this.cache.keys().next().value); // keys().next().value 获取管道中第一个 key 
        }
    }
}

const cache = new LRUCache( 2 ); // 缓存容量

cache.put(1, 1);
cache.put(2, 2);
cache.get(1);       // 返回  1
cache.put(3, 3);    // 该操作会使得密钥 2 作废
cache.get(2);       // 返回 -1 (未找到)
cache.put(4, 4);    // 该操作会使得密钥 1 作废
cache.get(1);       // 返回 -1 (未找到)
cache.get(3);       // 返回  3
cache.get(4);       // 返回  4
```
