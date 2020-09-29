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

