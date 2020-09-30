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
