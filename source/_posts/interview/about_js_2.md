---
title: 手写 js 中重要的 API
tags: JavaScript
categories: Interview
date: 2020-09-27
index_img: /img/about_js_2.jpg
---

## 模拟实现new关键字
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

## 实现 JSON.stringify 和 JSON.parse
1. Boolean | Number| String 类型会自动转换成对应的原始值
2. undefined、任意函数以及symbol，会被忽略（出现在非数组对象的属性值中时），或者被转换成 null（出现在数组中时）
3. 不可枚举（enumerable为false）的属性、循环引用的属性都会被忽略

### JSON.stringify
```js
function jsonStringify(obj) {
    let type = typeof obj;

    if (type !== "object" || obj === null) {
        if (/string|undefined|function/.test(type)) obj = `"${obj}"`;

        return String(obj);
    } else {
        const json = [];
        const isArr = (obj && obj.constructor === Array);

        for (let k in obj) {
            const v = obj[k];
            const type = typeof v;

            if (/string|undefined|function/.test(type)) {
                v = `"${ov}"`;
            } else if (type === "object") {
                v = jsonStringify(v);
            }

            json.push((isArr ? "" : `"${k}":`) + String(v));
        }
        
        return (isArr ? "[" : "{") + String(json) + (isArr ? "]" : "}")
    }
}

jsonStringify({x : 5}) // "{"x":5}"
jsonStringify([1, "false", false]) // "[1,"false",false]"
jsonStringify({b: undefined}) // "{"b":"undefined"}"
```

### JSON.parse
```js
function jsonParse(opt) {
    return eval('(' + opt + ')');
}
jsonParse(jsonStringify({x : 5})) // { x: 5}
jsonParse(jsonStringify([1, "false", false])) // // [1, "false", false]
```

## 实现call
```js
Function.prototype.myCall = function(...args) {	
  const thisArg = args.shift(); // 修改后的this指向
  const fn = Symbol('fn');

  thisArg[fn] = this; // this指的是testFunc，将这个函数赋值给第一个参数（{name: 1}）的一个属性
 
  const result = thisArg[fn](...args);
  
  delete thisArg[fn]; // 用完后将新添加的属性给删掉
  
  return result;
};

function testFunc(...values) {
  console.log(this.name); // 3
  console.log(values); // [1, 2]
};

testFunc.myCall({name: 3}, 1, 2);
```

## 实现bind
```js
Function.prototype.myBind = function(...args) {
  const thisArg = args.shift();
  const func = this; // 函数test
  
  return function() {
    return func.call(thisArg, ...args);
  }
};

const obj = {
  name: 'dell'
};

function test(...values) {
  console.log(this.name); // dell
  console.log(values); // [1, 2]
}

const func = test.myBind(obj, 1, 2); 
func();
```

## es5 方式实现继承
继承的目标是继承父类的属性和方法，且子类可以在this上添加自己的属性和方法，且不会影响到父类。
```js
// inherits的目的是将子类的prototype指向父类的prototype，但是不能直接child.prototype = parent.prototype。因为对象引用传递的原因，子类修改或添加方法，父类也会跟着改变。
function inherits(child, parent) {
  const _prototype = Object.create(parent.prototype); // 浅拷贝一份父类的原型

  _prototype.constructor = child.prototype.constructor; // 主要看这句话，也为了规范化，同时将父类原型的constructor指向子类原型的constructor
  
  child.prototype = _prototype;
};

function People(name, age) {
  this.name = name;
  this.age = age;
}

People.prototype.getName = function() {
  return this.name;
}

function English(name, age, language) {
  People.call(this, name, age);
  this.language = language;
}

// 写法1，inherits有一个缺点，就是用户可以随意改变constructor的指向
inherits(English, People);

// 写法2 
English.prototype = Object.create(People.prototype, {
    constructor: {
        value: English,
        writeable: false,
    },
  	// test是方法名，value是test方法的具体实现，是固定写法。
    test: {
        value: function() {console.log('test是English原型上挂载的方法')}
    }
})

English.prototype.introduce = function() {
  console.log(this.getName());
  console.log(this.language);
};

const en = new English('ghm', 24, 'english');
en.introduce(); // ghm english
```

## 通用的柯里化函数
函数柯里化，是固定部分参数，返回一个接受剩余参数的函数。

目的是为了缩小适用范围，创建一个针对性更强的函数。

**es5**
```js
function curry(fn, ...args) {
  // fn.length 表示fn的形参个数。如add的参数a b c     
  const len = fn.length;

  return function(...innerArgs) {
    const allArgs = [...args, ...innerArgs];
    
    if(len > allArgs.length) {
      return curry.call(this, fn, ...allArgs);
    } else {
      return fn.call(this, ...allArgs); // 参数够了 直接执行 fn
    }
  }
}
function add(a,b,c){
    return a + b + c;
}
 
const curryAdd = curry(add, 1);
console.log(curryAdd(2)(3));
console.log(curry(add)(1)(2)(3));
```

**es6**
```js
const curry = (fn, arr = []) => (...args) =>
  // 参数和arg指 [...arr,...args]
  (arg => (arg.length === fn.length ? fn(...arg) : curry(fn, arg)))([
    ...arr,
    ...args
  ]);

let curryTest = curry((a, b, c, d) => a + b + c + d);
curryTest(1, 2, 3)(4); //返回10
curryTest(1, 2)(4)(3); //返回10
curryTest(1, 2)(3, 4); //返回10
```

**练习**
```js
// 实现add函数，使之满足：
// 加了一个 sumOf 方法，只需让 sumOf 执行 fn.toString 即可。
add(1)(2).sumOf() // 3
add(1, 2, 3)(10).sumOf() // 16
add(1)(2)(3)(4)(5).sumOf() // 15

function add(...args) {
  const fn = (...innerArgs) => {
    const allArgs = [...args, ...innerArgs];
    
    return add.apply(null, allArgs);
  }

  fn.sumOf = function() {
    return fn.toString(); // 执行 fn.toString 即可
  }
  fn.toString = function() {
    return args.reduce((prev, cur) => prev + cur)
  }
  
  return fn;
}
```

## 实现 compose 组合函数
将层层嵌套的函数展平，使函数间可以组合，增强灵活性。

即 将f(g(h(x))) 这种嵌套函数转化为 compose(f, g, h)(x)

const operate = compose(f, g, h);

operate(0)
```js
const add1 = (x) => x + 1;
const mul3 = (x) => x * 3;
const div2 = (x) => x / 2;

function compose(...funs) {
  return function(...args) {
    if(!funs.length) return args;
    if(funs.length === 1) return funs[0](...args);
    
    return funs.reduce((a, b, idx) => {
      if(idx === 1) return b(a(...args)); // 因为第一次执行时，需要将上一次的返回结果作为参数传给第二个函数，而以后每次执行，a代表的是上一次的返回结果，所以不需要在传递args;
      
      return b(a)
    })
  }
}

const res = compose(add1, mul3, div2)(1); // 3 
```

## 手写深拷贝

>   通过 JSON.parse(JSON.stringify(obj))、Object.assign(target, source1, source1) 可以实现浅拷贝。

>   浅拷贝指：只能拷贝一层，如果改变第二层的数据，则源对象和拷贝出来的对象的值都会改变。

    const user = {
      age: {
        test: 30
      }
    };
    const clone = Object.assign({}, user);
    user.age.test = 30000;
    
    console.log(user); // user:{age:{test: 30000}} 
    console.log(clone); // user:{age:{test: 30000}} 同时被改变

### 拷贝数组、对象、防止循环引用
```js
const deepClone = (target = {}, map = new WeakMap()) => {
    if(typeof target !== 'object' || target == null) return target;

    let result = target instanceof Array ? [] : {};
    
    if(map.has(target)) return map.get(target);
    
    map.set(target, result);

    for(const key in target) {
        // hasOwnProperty 保证key不是原型上的属性
        if(target.hasOwnProperty(key)) {
            result[key] = deepClone(target[key])
        }
    }

    return result;
}
```

### 拷贝正则
```js
const cloneReg = (target, isDeep) => {
    const regFlag = /\w*$/g;
  
    // target.source => 只读。指正则中的文本字符串 ghmghm
    // regFlag.exec(target) => 匹配修饰符号，如 g i 等
    const res = new RegExp(target.source, regFlag.exec(target));
    
    if(isDeep) {
        // 深拷贝时，将lastIndex归为0。
        // lastIndex指存储在该字符串中下一次检索开始的位置，exec()和test()会用到。
        res.lastIndex = 0;
    } else {
        res.lastIndex = target.lastIndex;
    }
    
    return res;
}
const regx = /ghmghm/gi;
const copyReg =  cloneReg(regx, true);
```

## instanceof 的实现原理
即A 的 隐式原型（__proto__）是否在 B 的 显式原型上 （prototype）。
```js
// 利用链表指针移动的思想。
const instanceof = (A, B) => {
    let p = A; // 定义指针
    
    while(p) {
        if(p === B.prototype) return true;
    
        p = p.__proto__;
    }
    
    return false;
}
```

## setTimeout实现setInterval
1. setInterval存在的问题。

    1. 某些间隔会被跳过。
    2. 多个定时器的代码执行时间可能会比预期小。

2. setTimeout解决的问题

    1. 在前一个定时器代码执行完成之前，不会向队列插入新的定时代码，确保不会有任何的缺失间隔。
    2. 保证在下一次定时器代码执行之前，至少要等待指定的时间间隔。

```js
let timer = setTimeout(function fn(){
    // do Someting
    console.log(111);
  	
    setTimeout(fn, 1000);
}, 1000)
```

## 模拟事件监听触发
注意一个事件可以绑定很多个回调函数。
```js
class EventEmitter {
    constructor() {
        this.map = new Map(); // 存储所有事件
    }

    // 监听
    addEventLister(type, fn) {
        const _map = this.map;

        if (_map.has(type)) {
            _map.set(type, [..._map.get(type), fn]); // 存在该事件则合并新添加进来的回调
        } else {
            _map.set(type, [fn]); // 以数组形式存储，因为可以给一个事件绑定很多回调
        }
    }

    // 触发
    trigger(type, ...args) {
        const fns = this.map.get(type);

        fns.forEach(fn => {
            fn.call(this, ...args); // 依次执行回调
        });
    }
}

const emiter = new EventEmitter();

emiter.addEventLister('say', name => {
    console.log(name); // hello 
});
emiter.addEventLister('say', name => {
    console.log(name + 'draw'); // hello draw
});
emiter.trigger('say', 'hello');
```

## 手写防抖、节流
防抖：在事件被触发 n 秒后再执行回调函数，如果在这 n 秒内又被触发，则重新计时。

    应用场景：当校验名称在数据库中是否存在时，通过防抖来减少请求次数。
    
节流：如果在 n 秒内多次触发事件，那么只有一次回调函数会执行，即回调函数总是会按规律的以 n 秒间隔去执行。

    应用场景：window 的 onresize 事件，不断的调整浏览器窗口大小会不断的触发回调事件，通过节流来限制（每 n 秒才会去执行回调）。    

### 防抖
```js
// 模拟ajax请求
function ajax(e) {
    console.log(e.target.value);
    // this.props.ajax.post('/getParams', params);
}

// 防抖函数
function debounceFunc(fun, delay) {
    let timer = null;

    return function (...args) {
        // 如果存在，则清除定时器。
        // 因为防抖是需要在停止事件触发后的 delay 才去执行回调。如果在 delay 内又去触发了，则不执行然后清除定时器。
        if(timer) clearTimeout(timer);

        timer = setTimeout(() => {
            fun.call(this, ...args)
        }, delay)
    }
}

const name = document.getElementById('name');

// 绑定input事件，当value改变时，会出发input事件
name.addEventListener('input', debounceFunc(ajax, 1000));
```

### 节流
通过剩余时间来保证第一次会立即执行，通过定时器保证停止事件触发后还能执行一次回调函数。
```js
function throttle(func, delay) {
    let timer = null;
    let startTime = Date.now();

    return function (...args) {
        const curTime = Date.now();
        const remaining = delay - (curTime - startTime); // 剩余时间

        clearTimeout(timer);

        // 第一次执行时，remaining 是一定小于 0 的，保证了立即执行。
        if (remaining <= 0) {
            func.call(null, ...args);
            startTime = Date.now(); // 重新计算 开始时间
        } else {
            timer = setTimeout(func, remaining); // 最后一次因为还剩一个计时器，所以最后还会执行一次
        }
    }
}

function handle() {
    console.log(Math.random());
}

window.addEventListener('scroll', throttle(handle, 1000));
```
