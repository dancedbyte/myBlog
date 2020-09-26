---
title: 百变 Promise
tags: Promise
categories: JavaScript
date: 2020-09-25
index_img: /img/promise.jpg
---

## 设计任务队列，要求分别在1 3 4 秒后打印出 '1' '2' '3'
```js
class Queue {
  constructor() {
    this.queue = [];
  }
  task(time, fn) {
    this.queue.push({time, fn});
    
    console.log(this); // Queue {queue: Array(1)}
    return this; // 返回当前类 确保链式调用
  }
  start() {
    let res = Promise.resolve();
    
    this.queue.forEach(it => {
      res = res.then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(it.fn())
          }, it.time)
        })
      })
    })
    
    return res;
  }
}
new Queue()
    .task(1000, () => console.log('1'))
    .task(2000, () => console.log('2'))
    .task(1000, () => console.log('3'))
    .start()
```
