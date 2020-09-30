---
title: 日常整理 手写面试题～
tags: JavaScript
categories: Interview
date: 2020-09-29
index_img: /img/about_js_4.jpg
---

## 封装一个请求函数
可以设置最大请求次数，请求成功则不再请求，请求失败则继续请求，直到超过最大次数。

```js
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
