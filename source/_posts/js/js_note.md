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

## 对象中 方法声明的区别 TODO
在对象继承方面会有细微差别。

```js
const obj = {
    hello: function() {}
}

const obj1 = {
    hello(){}
}
```

## Number.toPrecision() 方法
返回指定长度的**数值字符串**。转换时会四舍五入

```js
const num = 13.3714;
const n = num.toPrecision(3);

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

// 转换演示：
alert(user); // hint: string -> {name: "John"}
alert(+user); // hint: number -> 1000
alert(user + 500); // hint: default -> 1500
```
