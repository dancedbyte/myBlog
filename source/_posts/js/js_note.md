---
title: js零散笔记 没事翻一翻～
tags: JavaScript
categories: JavaScript
date: 2020-09-29
index_img: /img/js_note.jpg
---

## 跳出多层嵌套的 for 循环
break <labelName> 语句跳出循环至标签处。

```js
outer: for (let i = 0; i < 10; i++) {

  for (let j = 0; j < 3; j++) {

    // 如果大于5，则中断并跳出指定的某个循环。
    if (i + j >= 5) break outer; 
  }
}
alert('Done!');
```

## Number.toPrecision() 方法
返回指定长度的**数值字符串**。转换时会四舍五入

```js
const num = 13.3714;
const n = num.toPrecision(3); // 长度 3 包括小数点前的整数部分

console.log(n, typeof n); // 13.4 string
```

## Symbol.toPrimitive
对象有一个叫 Symbol.toPrimitive 的内建 symbol。他可以修改对象返回的原始值。

```typescript
const user = {
  name: "John",
  money: 1000,

  [Symbol.toPrimitive](hint) {
    console.log(hint); // string | number | default 中的一个

    return hint == "string" ? `{name: "${this.name}"}` : this.money;
  }
};

// 转换：
alert(user); // hint: string -> {name: "John"}
alert(+user); // hint: number -> 1000
alert(user + 500); // hint: default -> 1500
```

重写 Symbol.toPrimitive 使之能打印出 1。

```js
var num = 1;
var a = {
    // 创建立即执行函数，并返回一个自增的函数。
	[Symbol.toPrimitive]: (i => () => ++i)(0)
};
if(a == 1 && a== 2 && a== 3) {
 	console.log(1); 
}
```

## 可迭代对象
1. 可以应用 for..of 的对象被称为 可迭代的。

2. 技术上来说，可迭代对象必须实现 Symbol.iterator 方法。

3. obj[Symbol.iterator] 的结果被称为 迭代器（iterator）。一个迭代器必须有 next() 方法，它返回一个 {done: Boolean, value: any} 对象，这里 done:true 表明迭代结束，否则 value 就是下一个值。

4. 如下练习，为了让 range 变成可迭代，我们手动添加一个 [Symbol.iterator] 方法。

```js
let range = {
  from: 1,
  to: 5
};

// 1. for..of 调用首先会调用这个：
range[Symbol.iterator] = function() {
  // 2. 他返回一个迭代器。接下来，for..of 仅与此迭代器一起工作，要求它提供下一个值
  return {
    current: this.from,
    last: this.to,

    // 3. next() 在 for..of 的每一轮循环迭代中被调用
    next() {
      // 4. 它将会返回 {done:.., value :...} 格式的对象
      if (this.current <= this.last) {
        return { done: false, value: this.current++ };
      } else {
        return { done: true };
      }
    }
  };
};

for (let num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

## WeakMap
1. WeakMap 与 map 的不同是，WeakMap 存储的 key **必须是对象**。[参考链接](https://zh.javascript.info/weakmap-weakset)

2. WeakMap 主要目的是帮我们释放那些已经没有用的数据，减少内存占用。如果我们在 weakMap 中使用一个对象作为键，并且没有其他对这个对象的引用，那么该对象将会被从内存中自动清除。

### 使用场景 1
额外的数据存储。当我们处理一个对象时，需要存储一些数据只能用于该对象，即该对象消失，则存储的数据也没用了，也应该消失，那么就可以用 WeakMap。

```js
let weakMap = new WeakMap();

// 如果 john 消失，hello 将会被自动清除
weakMap.set(john, "hello");
```

例如做一个记录访客操作记录（即点击了哪些按钮等）的需求。访客的姓名电话等作为 key，操作记录作为 value。 如果这个访客退出了，那么其实这个访客在我们记录的对象中应该删掉。

```js
let john = { name: "John", phone: 18888888888 };
let visitsCountMap = new WeakMap(); 

// 记录用户的一些行为，如点击次数
function recordUser(user) {
  const info = visitsCountMap.get(user) || {};
  let {clickTimes = 0} = info;

  visitsCountMap.set(user, {...info, clickTimes: clickTimes + 1});
}

recordUser(john);

// 可在退出的方法中，将该用户重置为 null
john = null;
 // 当 john 对象变成不可访问时，即便它是 WeakMap 里的一个键，它也会连同它作为 WeakMap 里的键所对应的信息一同被从内存中删除。
```

### 使用场景 2
保存某条消息是什么时候被阅读的，并且当某条消息被删除时，这条存储的记录应该也被从内存中删除。
```js
const messages = [
  {text: "Hello", from: "John"},
  {text: "How goes?", from: "John"},
  {text: "See you soon", from: "Alice"}
];
const weakMap = new WeakMap();

weakMap.set(messages[0], Date.now());

messages.shift(); // 该条消息被删除，则 weakMap 中存储的该条记录也将被删除。
```

## 尾递归 优化
1. 尾递归在普通递归的基础上做了优化，尾递归的判断标准是在函数的最后一步是否调用自身。做到这一点的方法，就是把所有用到的内部变量改写成函数的参数。

2. 按道理尾递归永远是在调用栈只中更新当前帧，**但是并不是所有的浏览器都支持**。

3. 所以我们可以将递归展平，用 while 去实现，叫蹦床函数。

```js
function trampoline(f) {  
  // 将递归展平。当 f 还是函数时就一直执行  
  while (f && f instanceof Function) {
    f = f()
  }

  // 当 f 执行完成则 f 不再是函数，就返回结果  
  return f;
}

// 斐波那契数列：1 1 2 3 5 8 ....
function f(n, a = 1, b = 1) {  
  if(n === 0) return 0;
  if(n === 1) return a;
  if(n === 2) return b;
  
  return f.bind(null, n - 1, b, a + b); // 这也是蹦床函数的缺点，需要我们修改已经写好的递归函数的内部代码
}

const res = trampoline(f(6));
console.log(res); // 8 
```

## js eval 替代方案
js 原生提供的 eval 会有严重的内存泄漏问题。因为 eval 函数支持传入表达式并计算，那么这个表达式可能会产生什么副作用，所以不敢回收 eval。

如有些需求，需要解析用户输入的 js。或我们自己需要用 eval 做大量计算。
```js
function new_eval(arg) {
  return new Function('return ' + arg)(); // 创建一个 Function 对象。
}

new_eval(console.log(1)); // 1
new_eval(2 + 3); // 5
new_eval('2 + 3'); // 5
```

## 获取一个文件在项目内的完整位置
注意是非 node 环境。当然 node 环境可以用 __dirname 来获取。

可以利用 es2020 新特性 import.meta.url 来获取。但是它只能在**模块**内使用。
```
// 声明 type="module"
<script type="module">
    console.log(import.meta.url);
</script>
```

## 在 map 中执行异步函数会如何？
1. map 会先把执行同步操作执行完，就返回，之后再一次一次的执行异步任务。

2. 执行完同步操作之后，就会返回结果，所以 map 返回的值都是 Promise。

3. 所以如果想得到当前异步的结果在进行下一次循环，**可以用 for for-of 代替 map**。
```js
const arr = [1, 2, 3, 4, 5];
function getData() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("data");
        }, 1000);
      });
}
(async () => {
      const result = arr.map(async () => {
        console.log("start");
        const data = await getData();
        console.log(data);
        return data;
      });
      console.log(result);
})();
// 先输出 5 次 start -> 遍历每一项开始
// result -> [Promise, Promise, Promise, Promise, Promise] -> 返回的结果
// 最后输出 5 次 data -> 遍历每一项异步执行返回的结果
```

## import 原理。与 require 不同点
1. import 原理其实就是 es6 module 原理。

    ① 运用闭包，为了创建 module 的内部作用域，会调用一个包装函数，包装函数的返回值也就是 module 向外公开的 API，也就是所有 export 出去的变量.
    ② import也就是拿到module导出变量的引用。

2. 与require的不同：

    ① CommonJS 模块输出的是一个值的拷贝（一旦输出一个值，即使模块内部对其做出改变，也不会影响输出值），ES6 模块输出的是值的引用（内部修改导出的变量会对引用它的产生影响）。
    ② CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。
    ③ 所以 ES6 在 import导入是在 JS 引擎对脚步静态分析时确定，获取到的是一个只读引用。等脚本运行时，会根据这个引用去对应模块中取值。所以引用对应的值改变时，导入的值也会变化。

**require**
```js
// a.js
var a = 1;
function changeA(val) {
    a = val;
}
module.exports = {
    a: a,
    changeA: changeA,
}

// b.js
var modA = require('./a.js');
console.log('before', modA.a); // 输出1
modA.changeA(2);
console.log('after', modA.a); // 还是1
```

**es6 import**
```js
// a.js
var a = 1;
function changeA(val) {
    a = val;
}
export {
    a,
    changeA,
}

// b.js
import {a, changeA} from './a.js';
console.log('before', a); // 输出1
changeA(2);
console.log('after', a); // 输出变成了2
```

## 浅比较
在 js 中深浅比较针对的是复杂数据类型，如数组、对象。

浅比较：指比较对象的**引用**是否相等。应用浅比较的是 React.pureComponent 和 React.memo()，他们会比较**前后 props 的引用地址是否一致**。

在 js 中通过拓展运算符 ... 可以完成**浅拷贝**。
```js
const arr = [
  {a: 1},
];
const brr = [...arr];
brr[0].a = 2;

// 浅拷贝 只拷贝一层。所以 arr 也跟着变了
console.log(arr); // [{a: 2}]
console.log(brr); // [{a: 2}]


// 变形 1。如果直接改变 brr[0] 则不会影响 arr
brr[0] = 2;
console.log(arr); // [{a: 1}]
console.log(brr); // [{a: 2}]
```

## requestAnimationFrame
需要注意的是，requestAnimationFrame会告诉浏览器你将要执行一个动画，并且要求浏览器在**下次重绘之前调用指定的回调函数更新动画**。

所以如果在同一个宏任务中，如果某个 js 任务导致浏览器的重绘，根据前面的定义，在重绘前会先执行requestAnimationFrame ，即使在其之前又创建了一个 setTimeout 的宏任务，requestAnimationFrame 也会早于 setTimeout 执行。

注：有的地方将 requestAnimationFrame 归类于宏任务，**但宏任务是在 UI 重绘之后执行的**，而根据 requestAnimationFrame 的定义，**它是在重绘之前执行的**，但是晚于其它微任务，只是优先级较低。

```html
<body>
<div id="box"></div>
<script>
    const box = document.getElementById('box');

    setTimeout(() => {
        box.setAttribute('random', Math.random()); // 导致 重绘

        requestAnimationFrame(() => {
            console.log('requestAnimationFrame');
        })
    }, 1000);

    setTimeout(() => {
        console.log('宏任务');
        // 延迟时间如果都是 1000 的话，不知道为什么就会先输出 -> 宏任务
        // 延迟时间如果稍微比 1000 大的话。就会先输出 requestAnimationFrame
    }, 1100); 

    new Promise((resolve) => {
        console.log('promise');
        resolve('111')
    }).then(res => {
        console.log(res);
    })

    // promise、 111、 requestAnimationFrame、 宏任务
</script>
</body>
```
