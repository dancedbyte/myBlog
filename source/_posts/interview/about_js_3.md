---
title: 隐式类型转换 触发规则
tags: JavaScript
categories: Interview
date: 2020-09-27
index_img: /img/about_js_3.jpg
---

# 隐式类型转换
非严格匹配: 会类型转换，一共有六种情况（示例以x == y说明）

## x 和 y 都是 null 或 undefined
规则: 没有隐式类型转换,无条件返回true
```js
console.log (null == undefined); // true
console.log (null == null); // true
console.log (undefined == undefined); // true
```

## x 或 y 有一方是 null 或 undefined
规则: 没有隐式类型转换,无条件返回false
```js
console.log (null == []); // false
console.log (null == 123); // false
console.log (undefined == ''); // false
console.log (undefined == {a: 123}); // false
```

## x 或 y 是 NaN 
规则：NaN与任何类型都不相等，没有隐式类型转换，无条件返回false
```js
console.log (NaN == NaN); // false
```

## x 和 y 都是 string、boolean、number 等基本数据类型
规则：有隐式类型转换

1. string => number

    会默认调用Number()方法将string类型的数据转成number

2. boolean => number

    先默认调用Boolean()，再调用Number()
    
```js
console.log(1 == true); // true 
(1) 1 == Number(true)

console.log(1 == "true"); // false
(1) 1 == Number('true')
(2) 1 == NaN

console.log(1 == !"true"); // false
(1) !运算符会将变量转换为Boolean类型
(2) 1 == !Boolean('true')
(3) 1 == false
(4) 1 == Number(false)
(5) 1 == 0 

console.log(true == 'true') // false
(1) Number(Boolean(true)) == Number('true')
(2) 1 == NaN
```

## x 或y 有一方是复杂数据类型
规则：有隐式类型转换，会先获取复杂数据类型的原始值之后再做比较

获取原始值：先调用valueOf()，在调用toString()方法
```js
// 注意转换特殊情况
console.log([].valueOf().toString()); // 空字符串 ''
console.log({}.valueOf().toString()); // [object Object]
console.log({} == '[object Object]'); // true

console.log([1,2,3] == '1,2,3'); // true
(1) [1,2,3].valueOf().toString() == '1,2,3';
(2) '1,2,3' == '1,2,3'

console.log([] == true); // false
(1) [].valueOf().toString() == Boolean(true)
(2) Number('') == Number(true)
(3) 0 == 1

console.log([1] == 1); // true
(1) [1].valueOf().toString() == 1；
(2) '1' == 1;
(3) Number('1') == 1;
```

## x和y都是复杂数据类型
规则：只比较地址，如果地址一致则返回true，否则返回false
```js
const arr1 = [10,20,30];
const arr2 = [10,20,30];
const arr3 = arr1; // 将arr1的地址拷贝给arr3

console.log (arr1 == arr2); // 虽然arr1与arr2中的数据是一样，但是它们两个不同的地址
console.log (arr3 == arr1); // true 两者地址是一样

console.log([] == []); // false
console.log({} == {}); // false
```

## 转换特殊情况
转换为布尔值时的假值有：undefined、null、空字符串、0、-0、NaN。其余如 {}、[] 都是真值
```js
console.log([] == ![]) // true
(1) [] == !Boolean([])
(2) [] == false
(3) [].valueOf().toString() == Number(Boolean(false))
(4) '' == 0
(5) Number('') == 0
(6) 0 == 0

console.log({} == !{}) // false
(1) {} == !Boolean({})
(2) {} == false
(3) {}.valueOf().toString() == Number(Boolean(false))
(4) '[object Object]' == 0;
(5) Number('[object Object]') == 0
(6) NaN == 0

// 数组元素为null或undefined时，该元素被当做空字符串处理
[null] == false // true
[undefined] == false // true
```
## 常用特殊运算符

### 加号运算符（+）
若+两边存在一个字符串，将另一个也转为字符串进行字符串拼接。

其他情况下，都转为数值类型
```js
console.log(1 + '2'); // 12
console.log(1 + + '2') // 3 一元加法运算符把操作数转换为数字（或者NaN），并返回这个转换后的数字  +'2'转换为数值2

console.log([1,2,3] + []); // "1,2,3"
(1) "1,2,3" + "" 
(2) "1,2,3"

console.log([] + {}); // "[object Object]"
(1) "" + "[object Object]"
(2) "[object Object]"
```

### 减号运算符（-）
减号 - 将两边都转换成数值类型，不能连接字符串
```js
console.log('aaa' - 11); // NaN
console.log(11 - 'aaa'); // NaN
console.log(1 - - '2'); // 3 相当于 1 - (-2)
console.log(-'1' - '2'); // -3 相当于 -1 - 2
```

## 补充
1. 任何数字与NaN相加都会变成NaN
```
100 + 1 + NaN // NaN
```

2. Number(null) 与 Number(undefined)
```
Number(null) => // 0
Number(undefined) => // NaN
```

3. 字符串与 []、 null、 数字、undefined 等相加时
```
'123' + [] + null + undefined + 10 => '123' + '' + 'null' + '10' // 123nullundefined10
```
```js
'123' + [] + Number(undefined) + null + 10 // 123NaNnull10
```


4. parseInt(val)转化时 会先把val转化为字符串
```
parseInt(null); // parseInt('null') => NaN
```

