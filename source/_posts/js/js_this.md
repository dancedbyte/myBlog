---
title: This 使用心得
tags: JavaScript
categories: JavaScript
date: 2020-10-16
index_img: /img/js_this.jpg
---

## 介绍
1. js 中的 this 与其他大多数编程语言中的不同，js 中的 this 可以用于任何函数。

2. this 的值是在**代码运行**时计算出来的，它取决于**代码上下文**。即一个函数在声明时就用到了 this，但这个 this 只有在函数被调用时才会有值。

3. 在没有对象调用的情况下，this 在严格模式下是 undefined。非严格模式下是全局对象（浏览器中的window）。 

4. 如果在一个函数内部有 this，**那么通常意味着它是在对象上下文环境中被调用的**。

5. 箭头函数没有自己的 this。它的 this 从外部上下文中获取。**后面会深入介绍**。

    ```js
    // 当不想让某函数有自己的this, 而是继承外部的时，可以用箭头函数
    const user = {
           name: "draw",
           sayHi() {
                // 如 arrow 没有自己的 this。就向上找 sayHi 中的this。sayHi 的 this 指向的是 user
                const arrow = () => alert(this.name);
                arrow();
           }
    };
    user.sayHi(); // draw
    ```

## 箭头函数中的 this
js 中最方便的就是可以创建一个函数，然后将这个函数放到任何想执行的地方。这样的函数中，我们通常不想离开当前上下文。便可以利用箭头函数。

>   箭头函数 和 bind 的区别？

    1. bind(this)： 创建了一个该函数的“绑定版本”。
    
    2. 箭头函数：没有创建任何绑定。箭头函数只是没有 this。this 的查找与常规变量的搜索方式完全相同：在外部词法环境中查找。

### 箭头函数没有自己 this
箭头函数中 如果访问 this，则会从外部获取。

```js
const group = {
  title: "Our Group",
  students: ["John", "Pete", "Alice"],
  showList() {
    this.students.forEach(
      // this 和外部方法 showList 的 this 一样。都是 group
      student => console.log(this.title + ': ' + student)
    );
  },

  normalShowList() {
    this.students.forEach(function(student) {
      // Error 会报错 因为 this 指向 undefined
      console.log(this.title + ': ' + student)
    });
  }  
};

group.showList();
```

### 不能用作构造器，不能进行 new 操作
因为箭头函数没有 this。也就意味着不能用作构造器，不能进行 new 操作。因为 new 的本质是需要将内部的 this 指向实例。

```js
function _new(Func, ...args) {
    const obj = {};
    obj.__proto__ = Func.prototype; // 创建实例对象，将实例的__proto__指向函数的显式原型
    
    // 执行方法，改变this指向，接收返回值
    const result = Func.call(obj, ...args);
    
    // 分析返回值，如果是函数或者对象，则直接return，否则return实例对象
    if(result !== null && ['function', 'object'].includes(typeof result)) return result;
    
    return obj;
}
```

### 箭头函数没有自己的 arguments
这个**自己的**限定语很重要。不是没有 arguments，而是没有自己的 arguments。他和 this 一样，也继承自上下文。

**案例1**
```js
function foo() {
  setTimeout(() => {
    console.log(arguments); // [1, 2, 3] arguments 参数其实来自于父级 foo
  }, 0)
};
foo([1, 2, 3]);
```

**案例2**
```js
// 当想用 setTimeout 做一个包装器时，用箭头函数让我们省去了自己去获取 this 和 参数 的过程。
function defer(f, ms) {
  return function() {
    setTimeout(() => f.apply(this, arguments), ms)
  };
}

function sayHi(name) {
  console.log('Hello, ' + name)
}

let sayHiDeferred = defer(sayHi, 500);
sayHiDeferred("Draw"); // 500 秒后显示：Hello, Draw
```

### 箭头函数没有 super
如果被访问，则会从外部函数中获取。

```js
class Parents {
  stop() {
    console.log('被调用！');
  }
}
class Test extends Parents {
  start() {
    setTimeout(() => super.stop(), 1000); // 1 秒后调用父类的 stop
  }
}

const test = new Test();
test.start(); // 1s 后输出 被调用！ 
```

## 练习

### 练习1
访问 ref 的结果是？ **会报错**。

因为 makeUser 是被作为函数调用的，而不是通过点符号被作为方法调用。所以 makeUser() 中的 this 的值是 undefined。取 undefined 的 name 则会报错。

因为 this 的值是对于整个函数的，user 这个对象字面量对它没有影响。所以 ref: this 实际上取的是当前函数的 this。 

```js
function makeUser() {
  return {
    name: "draw",
    ref: this
  };
};

let user = makeUser();

alert( user.ref.name ); // 会报错
```

>   如果想正常访问 name 呢？

```js
function makeUser() {
  return {
    name: "draw",
    ref() {
        return this;
    }   
  };
};

let user = makeUser();

alert( user.ref().name ); // 因为 user.ref() 是一个方法。this 指向点符号 . 前的这个对象 user。
```

## 参考链接

- [现代 JavaScript 教程](https://zh.javascript.info/)
