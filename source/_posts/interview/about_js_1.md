---
title: js中栈与队列的互相模拟实现
tags: JavaScript
categories: Interview
date: 2020-09-26
index_img: /img/about_js_1.jpg
---

## 用两个栈模拟队列
1. 栈是后进先出，只能从栈顶取元素。用数组模拟的话只能借用数组的pop()方法。

2. 当outStack有值时则取出。当inStack有值时，则取出push到outStack。

```js
class Queue {
  constructor() {
    this.inStack = []; // 存储插入队列的数据
    this.outStack = []; // 从队列中取数据
  }

  // 入队
  append(it) {
  	this.inStack.push(it);
  }

  // 出队
  quit() {
  	const {inStack, outStack} = this;

  	if (outStack.length) {
  		return outStack.pop();
  	} else {
		while(inStack.length) {
			outStack.push(inStack.pop());
		}  			

		return outStack.pop() || -1;
  	}
  }
}

const queue = new Queue();
queue.append(1);
console.log(queue.quit()); // 1
queue.append(2);
queue.append(3);
console.log(queue.quit()); // 2
```

## 用两个队列模拟栈
1. 入栈：q1为空，放入q2。q2为空，放入q1。都为空默认放入q1。

2. 出栈：

    q1为空，依次取出q2中的元素（除了最后一个）放入q1中，然后返回q2的最后一个。

    q2为空，依次取出q1中的元素（除了最后一个）放入q2中，然后返回q1的最后一个。
    
```js
class Stack {
    constructor() {
        this.q1 = [];
        this.q2 = [];
    }

    // 入栈 要保持有一个队列是空的
    push(it) {
        const {q1, q2} = this;

        if (!q1.length && !q2.length) q1.push(it);
        if (!q1.length) q2.push(it);
        if (!q2.length) q1.push(it);
    }

    // 出栈 可以理解为两个盘子一堆瓜子，每次交换瓜子，瓜子数每次减1，即永远保持有一个盘子是空的
    pop() {
        const {q1, q2} = this;

        if (!q1.length) {
            while (q2.length !== 1) q1.push(q2.shift());

            return q2.shift();
        }

        if (!q2.length) {
            while (q1.length !== 1) q2.push(q1.shift());

            return q1.shift();
        }
    }
}

const stack = new Stack();
stack.push(1);
console.log(stack.pop()); // 1
stack.push(2);
stack.push(3);
console.log(stack.pop()); // 3
console.log(stack.pop()); // 2
```
