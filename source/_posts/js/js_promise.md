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
  // 题目说不断交替，那么需要用 promise 链式调用来确保顺序。想要实现 重复亮灯 就需要在最后一个 then 去执行 start
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
      start(); // 再次执行
    })
}
start();
```

## 实现 mergePromise 函数
把传进去的**数组按顺序先后执行**，并且把返回的数据先后放到数组 data 中。

该题目与实现一个 Promise.all 的区别是：该题要求传入的数组元素要先后执行，有个先后顺序。而 Promise.all 中数组元素不一定是按先后执行的。
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
  let links = Promise.resolve(); // 创建链式调用

  const data = [];

  ajaxArray.forEach(it => {
    links = links.then(it).then(res => {
      data.push(res);

      return data; // 易错点 抛出data
    })
  });   
  
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
    // 直接遍历即可，因为都是异步任务，先执行完的就直接 resolve 了，这个 promise 就结束了
    arr.forEach(it => {
      if(it !== null && typeof it === 'object') {
        it
          .then(res => resolve(res))
          .catch(err => reject(err))
      } else {
        resolve(it); // 如果不是对象类型 则直接 resolve
      }
    })
  })
}
Promise.myRace([p1, p2]).then(res => {
  console.log(res); // 2
});
```

## 实现 Promise.all()
Promise.all 的规则是：传入一个数组，并且需要保证输出数组中结果的顺序与传入时一致。

但传入的数组中各个异步任务的执行顺序可以打乱。所以才需要按数组索引去将结果赋值。

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

Promise.myAll = function(allReq) {
  let count = 0;
  let res =  new Array(allReq.length); // 保证输出结果的顺序，用下标赋值，而不是push
  
  return new Promise((resolve, reject) => {
    allReq.forEach((req, idx) => {
      req.then(val => {
        count++;
        res[idx] = val;
        
        if(count === res.length) resolve(res); // 计数 === 结果长度时 resolve
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

## Promise.all 演变
Promise.all 中任何一个 Promise 出现错误的时候都会执行 reject，**导致其它正常返回的数据也无法使用。如何解决**？

1. 把单个 reject 操作换成 resolve(new Error("自定义的error"))

2. 在单个的 catch 中对失败的 promise 请求做处理，如进行重新请求等。

3. 使用 Promise 提供的 api。Promise.allSettled，他可以返回所有 promise 的结果是失败还是成功，以及具体的返回数据。
   
```js
const promises = [
    fetch('/api1'),
    fetch('/api2'),
    fetch('/api3'),
];
  
Promise.allSettled(promises)
    .then(res => res.forEach((it) => console.log(it.status)));

/*
"fulfilled"
"fulfilled"
"rejected"
*/
```

## 实现允许 max 个请求并发的函数
该函数可以批量请求数据，所有的url地址在urls参数中，同时可以通过max参数控制请求的并发度，当所有请求结束之后，需要执行callback回调函数。
```js
// 模拟异步任务
const ajax = (num, delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(num)
        }, delay)
    })
};
const a1 = ajax(1, 2000);
const a2 = ajax(2, 1000);
const a3 = ajax(3, 5000);

const requestFunc = (urls, max, callback) => {
    const result = [];

    const start = (cur) => {
        Promise.all(cur).then(res => {
            console.log(res, 'res'); // 通过打印可发现：3s 后打印 [1, 2]。再过 5s 打印 [3]
            result.push(...res);

            if (urls.length) {
                start(urls.splice(0, max)); // 还有异步 则继续截取 继续执行
            } else {
                callback(result)
            }
        });
    };

    start(urls.splice(0, max));
};

requestFunc([
    a1,
    a2,
    a3,
], 2, (res) => {
    console.log(res); // [1, 2, 3]
})
```

## 实现带并发限制的类
实现带并发限制的类，保证同时运行的任务最多有n个。
```js
class Scheduler {
    constructor(count) {
        this.count = count;
        this.curQueue = []; // 当前队列
        this.areaQueue = []; // 剩余队列 存储多余的添加进来的任务
    }
    add(task) {
        return new Promise((resolve) => {
            task.resolveFunc = resolve;

            if(this.curQueue.length < this.count) {
                this.curQueue.push(task); // push 与 runTask 同步执行
                this.runTask(task);
            } else {
                this.areaQueue.push(task); // 有多余的就 push 到剩余队列中
            }
        })
    }
    runTask(task) {
        // 如下标注 1。因为需要执行 console。需要手动调用 resolve 保证向下执行。
        task().then(task.resolveFunc).then(() => {
            const idx = this.curQueue.indexOf(task); // 因为引用地址一样
            this.curQueue.splice(idx, 1); // 先删除掉 已经执行完的

            if (this.areaQueue.length) {
                const curTask = this.areaQueue.shift(); // 取出剩余队列的第一个任务

                this.curQueue.push(curTask);
                this.runTask(curTask); // 手动调用 runTask
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
        .then(() => console.log(order)); // 标注 1 
}; // 输出 2 3 1 4

addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');
```
