---
title: 百变 Promise
tags: Promise
categories: JavaScript
date: 2020-09-25
index_img: /img/promise.jpg
---

## 设计任务队列
要求分别在1 3 4 秒后打印出 '1' '2' '3'
```js
class Queue {
  constructor() {
    this.queue = [];
  }
  task(time, fn) {
    this.queue.push({time, fn});
    
    console.log(this); // Queue {queue: Array(1)}
    return this; // 返回当前实例 确保链式调用
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

## 红绿灯交替亮灯
红灯3秒亮一次，绿灯2秒亮一次，黄灯1秒亮一次；如何让三个灯不断交替重复亮灯？三个亮灯函数已经存在。
```js
function red() {
    console.log('red');
}
function green() {
    console.log('green');
}
function yellow() {
    console.log('yellow');
}

function light(fn, later) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(fn());
    }, later)
  })
}
function start() {
  Promise.resolve()
    .then(() => {
      return light(red, 3000);
    })
    .then(() => {
      return light(green, 2000);
    })
    .then(() => {
      return light(yellow, 1000);
    })
    .then(() => {
      start();
    })
}
start();
```

## 实现 mergePromise 函数
把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组 data 中
```js
const timeout = ms => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, ms);
});
const ajax1 = () => timeout(1000).then(() => {
    return 1;
});
const ajax2 = () => timeout(500).then(() => {
    return 2;
});
const ajax3 = () => timeout(1000).then(() => {
    return 3;
});

const mergePromise = ajaxArray => {
  let links = Promise.resolve();

  const data = [];

  ajaxArray.forEach(it => {
    links = links.then(it).then(res => {
      data.push(res);

      return data; // 易错点 抛出data 确保链式调用
    })
  })   
  
  return links;
};

mergePromise([ajax1, ajax2, ajax3]).then(data => {
    console.log(data); // data 为 [1, 2, 3]
});
```

## 实现 Promise.race()
```js
const toPromise = (fn, timer) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(fn())
    }, timer)
  })
}
const p1 = toPromise(() => 1, 2000);
const p2 = toPromise(() => 2, 100);

Promise.myRace = (arr) => {
  return new Promise((resolve, reject) => {
    arr.forEach(it => {
        if(it !== null && typeof it === 'object') {
        it
          .then(res => resolve(res))
            .catch(err => reject(err))
      } else {
        resolve(it);
      }
    })
  })
}
Promise.myRace([p1, p2]).then(res => {
  console.log(res); // 2
});
```

## 实现 Promise.all()
```js
const toPromise = (fn, timer) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(fn())
    }, timer)
  })
}
const p1 = toPromise(() => 1, 2000);
const p2 = toPromise(() => 2, 0);
const p3 = toPromise(() => 3, 1000);

Promise.myAll = function(allReq){
  let count = 0;
  let res =  new Array(allReq.length); // 保证输出结果的顺序，用下标赋值，而不是push
  
  return new Promise((resolve, reject) => {
    allReq.forEach((req, idx) => {
      req.then(val => {
        count++;
        res[idx] = val;
        
        if(count === res.length) resolve(res);
      }, (err) => {
        reject(err);
      })		  	  
    })
  })
};
Promise.myAll([p1, p2, p3])
    .then(res => console.log(res))
    .catch(err => console.log(err))
```

## 实现允许 max 个请求并发的函数
该函数可以批量请求数据，所有的url地址在urls参数中，同时可以
通过max参数控制请求的并发度，当所有请求结束之后，需要执行callback回调函数。
```js
const requestFunc = (urls, max, callback) => {
    const result = [];

    const start = (cur) => {
        const allPromise = [];

        cur.forEach(url => {
            // fetch 直接 返回 promise
            allPromise.push(
                fetch(url)
                    .then(res => res.json())
                    .then(data => data.answer)
            )
        });
        Promise.all(allPromise).then(res => {
            result.push(...res);

            if (urls.length) {
                start(urls.splice(0, max));
            } else {
                callback(result)
            }
        });
    };

    start(urls.splice(0, max));
};

requestFunc([
    'https://yesno.wtf/api',
    'https://yesno.wtf/api',
    'https://yesno.wtf/api'
], 2, (res) => {
    console.log(res)
})
```

## 实现带并发限制的类
实现带并发限制的类，保证同时运行的任务最多有n个。
```js
class Scheduler {
    constructor(count) {
        this.count = count;
        this.curQueue = [];
        this.areaQueue = [];
    }
    add(task) {
        return new Promise((resolve) => {
            task.resolveFunc = resolve;

            if(this.curQueue.length < this.count) {
                this.curQueue.push(task);
                this.runTask(task);
            } else {
                this.areaQueue.push(task);
            }
        })
    }
    runTask(task) {
        task().then(task.resolveFunc).then(() => {
            const idx = this.curQueue.indexOf(task);
            this.curQueue.splice(idx, 1);

            if (this.areaQueue.length) {
                const curTask = this.areaQueue.shift(); // 取出剩余队列的第一个任务

                this.curQueue.push(curTask);
                this.runTask(curTask);
            }
        });
    }
}

const timeout = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    })
};
const scheduler = new Scheduler(2);
const addTask = (time, order) => {
    scheduler
        .add(() => timeout(time))
        .then(() => console.log(order));
}; // 输出 2 3 1 4

addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');
```
