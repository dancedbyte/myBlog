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

```js
var a = 1;

(function a() {
    a = 2;
    console.log(a); // IIFE 创建一个独立作用域，当函数名称与内部变量名称冲突，就会永远执行函数本身；
    /*
        ƒ a() {
            a = 2;
            console.log(a);
        }
    */ 
})();
```

**变形 1**
```js
var a = 1;

(function b() {
    a = 2;
    console.log(a); // 沿作用域向上查找，找到 2 
})();
```

## 如下输出？

```js
(function () {
    var a = b = 5; // b 变成了全局变量
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
```js
let a = 1;
function test(a) {
  a = 12; // 当传入基本数据类型时，内部操作形参不会对传入变量产生影响
}
test(a); // 传入的 a 是基本数据类型
console.log(a); // 1
```

```js
let a = {};
function test(a) {
  a.name = 'draw'; // 传入复杂数据类型时，内部操作会修改掉传入的变量
}
test(a); // 复杂数据类型

console.log(a); // {name: "draw"}
```

## 如下打印结果？
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
分析：
   ① Foo.a() 这个是调用 Foo 函数的静态方法 a，虽然 Foo 中有优先级更高的属性方法 a，但 Foo 此时没有被调用，所以此时输出 Foo 的静态方法 a 的结果：4
   ② 实例化后，此时 Foo 函数内部的属性方法初始化，原型链建立。有两个 a 方法，分别是内部 this 上的方法和原型上的方法。则内部 this 上的优先级高。
   ③ Foo.a() 根据第2步可知 Foo 函数内部的属性方法已初始化，覆盖了同名的静态方法，所以输出：1
*/
```
