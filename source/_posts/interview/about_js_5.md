---
title: 易错面试题汇总
tags: JavaScript
categories: Interview
date: 2020-10-20
index_img: /img/about_js_5.jpg
---

## 如下 console 打印什么？

```js
var a = 0;

for(var i = 0; i < 2; i++) {
  setTimeout(function() {
    a = a + i; // 执行到此时 i 跳出循环变为 2
    console.log(a); // 间隔200s 分别输出 2 和 4
  }, 200)
}
console.log(a); // 先输出 0
```

## 如下执行结果？
当函数名称与外部变量名称重名时，则变量永远指向该函数。
```js
var a = 1;

(function a() {
    a = 2;
    console.log(a); // IIFE 创建一个独立作用域，当函数名称与内部变量名称一样时，会永远指向函数本身；
    /*
        ƒ a() {
            a = 2;
            console.log(a);
        }
    */ 
})();
```

## 如下输出？
变量赋值顺序从右向左。
```js
(function () {
    var a = b = 5; // 相当于 b = 5; 则 b 变成了全局变量
})();

console.log(b); // 5
console.log(a); // Error a is not defined
```

## 如下输出？
1. delete 是不能删除从原型上继承而来的属性。

2. 如果用 delete **删除数组**的某个元素，则数组长度不会变，只会将该元素变成 undefined

```js
var company = {
    address: 'beijing'
};
var yideng = Object.create(company);
console.log(yideng); // {__proto__: {address: "beijing"}}。通过 prototype 继承了 company的 address

delete yideng.address;
console.log(yideng.address); // beijing
```

**变形 1**
```js
x = 1;
var output = (function(){
    delete x; // 变量 x 沿作用域向上查找，找到全局的 x
    return x; // 报错 全局上的 x 已经被删除
})();
console.log(output);
```

## 如下输出？
```js
var foo = function bar(){ return 12; };

console.log(typeof foo()); // number
console.log(typeof bar()); // 报错。将函数赋给变量 foo。所以函数 bar 名称就会失效，相当于匿名函数
```

## 创建一个装饰者 spy(func)
spy(func)，应该返回一个包装器，该包装器将所有对函数的调用保存在其 calls 属性中。
```js
// work 是一个任意的函数或方法
function work(a, b) {
    alert(a + b); // 分别弹出 3 9
}
function spy(func) {
    function inner(...args) {
        func.call(null, ...args);

        inner.calls.push(args); // 将调用函数的参数偷偷保留了下来，所以 spy 也叫间谍装饰者，在执行传入函数的同时保留了参数。
    }
    inner.calls = [];

    return inner;
}

work = spy(work);

work(1, 2);
work(4, 5);

for (let args of work.calls) {
    console.log(args.join()); // "1, 2",    "4, 5"
}
```

## 执行结果是什么？
当（基本类型）变量 和 参数重名时，内部对参数进行操作是否会影响到该变量。
```js
let a = 1;
function test(a) {
  a = 12; // 当（基本类型）变量 和 参数重名时，内部操作形参不会对变量产生影响
}
test(a); // 传入的 a 是基本数据类型
console.log(a); // 1
```

```js
let a = {};
function test(a) {
  a.name = 'draw'; // 当（复杂类型）变量 和 参数重名时，内部操作形参会对变量产生影响
}
test(a); // 复杂数据类型

console.log(a); // {name: "draw"}
```

## 如下打印结果？
考察静态方法 和 属性方法的优先级，如果构造函数被实例化，则属性方法的优先级高于静态方法。
```js
function Foo(){
    // Foo 的属性方法 a
    Foo.a = function(){
        console.log(1);
    }
    this.a = function(){
        console.log(2)
    }
}
 
Foo.prototype.a = function(){
    console.log(3);
}

// Foo 的静态方法 a 
Foo.a = function(){
    console.log(4);
}
  
Foo.a(); // 4
let obj = new Foo();
obj.a(); // 2
Foo.a(); // 1

/*
   ① Foo.a() 这个是调用 Foo 函数的静态方法 a，虽然 Foo 中有优先级更高的属性方法 a，但 Foo 此时没有被调用，所以此时输出 Foo 的静态方法 a 的结果：4
   ② 实例化后，此时 Foo 函数内部的属性方法初始化，原型链建立。有两个 a 方法，分别是内部 this 上的方法和原型上的方法。则内部 this 上的优先级高。
   ③ Foo.a() 根据第2步可知 Foo 函数内部的属性方法已初始化，覆盖了同名的静态方法，所以输出：1
*/
```

## 如下输出？
考察 this 指向、变量提升、运算符号优先级。
```js
function fn() {
    // getValue 没有用 var 声明，所以实际上是将外层的 getValue 给修改了
    getValue = function () {
        console.log(1);
    };
    return this; // 定义时 This 是确定不了的，需要看是谁调用的。
}

fn.getValue = function () {
    console.log(2);
};

var getValue = function () {
    console.log(4);
};

function getValue() {
    console.log(5);
}

// 函数声明，变量会提升。所以 4 会覆盖掉 5
getValue(); // 4

//  有()则先执行了 fn 方法，修改了全局的 getValue 方法，而 fn 内部返回了 this。这里调用的话 this 指向了 window。即 window.getValue 输出 1
fn().getValue(); // 1

// 在上一步中，因为先执行了 fn 函数，全局的 getValue 已经被修改了，所以输出 1
getValue(); // 1

// 考察运算符 new 和 . 的优先级。相当于执行了 new (fn.getValue())
new fn.getValue(); // 2
```

## 如下输出？
考察 import 与 require 的区别。

import 是编译阶段就先去加载了。而 require 是运行时才去加载。
```js
// index.js。import只能放到最顶级，且import会提上到作用域的顶部
console.log('running index.js');
import { sum } from './sum.js';
console.log(sum(1, 2));

// sum.js
console.log('running sum.js');
export const sum = (a, b) => a + b;


/*
    所以 import 的话：running sum.js、running index.js、3
    如果 require 的话：running index.js、running sum.js、3
*/
```

## 如下输出？
实例上方法的优先级是高于原型链上的方法的。且通过等号 = 声明的方法是被直接挂载到实例上的。

```js
class Yd {
    static str = 'static str'; // 静态属性

    // 通过等号 = 声明，表示这个方法是直接挂载到实例上的。它的优先级高于原型链上方法的优先级。
    sayStr = () => {
        throw new Error('Need to implement');
    }
}

class Student extends Yd {
    constructor() {
        super();
    }

    // 原型链上的方法
    sayStr() {
        console.log(Student.str);
    }
}

const laoyuan = new Student();
console.log(Student.str); // static str
laoyuan.sayStr(); // throw new Error('Need to implement'); 读取时，会先去实例上找，没有的话再去原型链上找。
```

## 执行结果？
正则的 test 方法会强制将传入的数据转化为：字符串

```js
const lowerCaseOnly =  /^[a-z]+$/;

console.log(lowerCaseOnly.test('draw')); // true
console.log(lowerCaseOnly.test(null)); // -> 'null' true
console.log(lowerCaseOnly.test()); // -> 'undefined' true
```

## 如下输出？
变量的查找是在**函数定义**的地方去开始查找的。直接打印 length 指的是页面中 iframe 的数量。
```js
function foo(){
    console.log(length); // 页面中 iframe 数量为0
}
function bar(){
      var length = "京程一灯";
      foo(); // 虽然是在 foo 函数里面去调用的 bar。但是 bar 中变量的查找是在 bar 函数内去找的 
}
bar();
```

## 对于扩展运算符，如下输出？
如果在对象内展开**非复杂数据类型**，则对象会将它们（如 null undefined 1 'abc'）忽略。

如果在数组内展开**非复杂数据类型**，则对象会报错。
```js
let ydObject = { ...null, ...undefined, ...1 };
console.log(ydObject); // {}

let ydObject1 = { ...['a', 'b'], ...2 };
console.log(ydObject); // {0: 'a', 1: 'b'}

let ydArray = [...null, ...undefined];
console.log(ydArray); // 报错
```

## ⽤不同⽅式对对象 A 进⾏改造
实现当 A.name 发⽣变化时，能够⽴即执⾏ A.getName。


```js
// 方式 1 监听属性的 getter 和 setter 方法
const A = {
    name: 'sfd',
    getName: function(){
        console.log(this.name)
    },
    get name() {
        return this.value;
    },
    set name(name) {
        this.value = name;
        this.getName();
    }
};

A.name = 'draw'; // draw
```

```js
// 方式 2 Proxy
const _A = {
    name: 'sfd',
    getName: function () {
        console.log(this.name)
    }
};
// Proxy 的第二个参数是个对象，包含 get 和 set 两个属性方法
const A = new Proxy(_A, {
    // receiver 代表 proxy 实例
    get(target, key, receiver) {
        return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
        const res = Reflect.set(target, key, value, receiver); // 先设置 才能保证 getName 拿到最新的

        target.getName(); // 执行

        return res;
    }
});
A.name = 'draw';
```
