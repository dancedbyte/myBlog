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

2. 如果用 delete 删除数组的某个元素，则数组长度不会变，只会将该元素变成 undefined

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
    delete x;
    return x; // 报错 全局上的 x 已经被删除
})();
console.log(output);
```
