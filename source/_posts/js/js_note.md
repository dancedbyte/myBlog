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
