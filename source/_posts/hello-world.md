---
title: 算法题整理
tags: JavaScript
categories: JavaScript
---

## 目录
1. 无重复字符的最长子串
2. 比较两个对象中的值是否相等
3. 给定升序整数数组，找出其中连续出现的数字区间，即前后相差1
4. 字符串相加
5. 字符串相乘
6. 排序两个有序数组
7. 二维数组查找
8. 优化后的斐波那契数列
9. 统计一个数字在**已排序**数组中出现的次数
10. 求整数的二进制形式中数字1的个数
11. 表示数值的字符串
12. 字符串全排列
13. 替换空格
14. 有一堆整数，把他们分成3份，并确保每一份的和 尽量相等
15. 获取翻转数组中的最小值

## 无重复字符的最长子串
利用滑动窗格思想，如果当前要累加的字符已经在之前的字符串中存在，则从索引位置向后截取。
```js
let str = 'pwwkewa';

const search = (str) => {
  let i = 0;
  let res = 0;
  let str = '';
  const map = new Map();
  
  for(let j = 0; j < s.length; j++) {
    if(map.has(s[j]) && map.get(s[j]) >= i) i = map.get(s[j]) + 1;
    
    res = Math.max(res, j - i + 1);
    str = s.slice(i, j + 1).length > str.length ? s.slice(i, j + 1) : str;
    
    map.set(s[j], j);
  }
  
  console.log(str);
}

search(str);
```

## 

## 比较两个对象中的值是否相等
```js
const compare = (source, target) => {
  if(!source || !target) return false;
  
  if(typeof target !== 'object') return source === target;
  
  for(let key in target) {
    if(!compare(source[key], target[key])) {
     	return false; 
    }
  }
  
  return true;
};
const source = {
  a: {b: 1}
};
const target = {
  c: {b: 1}
};

console.log(compare(source, target)); // false
```

## 

## 给定升序整数数组，找出其中连续出现的数字区间，即前后相差1
```js
const arr = [0, 1, 2, 4, 5, 7, 13, 15, 16];

const search = (arr) => {
  const res = [];
  
  for(let i = 0; i < arr.length;) {
    let j = i;
    
    while(arr[j] + 1 === arr[j + 1]) {
      j += 1;
    }
    
    j === i ? res.push(arr[j]) : res.push(arr.slice(i, j + 1))

    i = j + 1;
  }
  
  console.log(res);  // [[0, 1, 2], [4, 5], 7, 13, [15, 16]]
 
  return res;
};

search(arr);
```

## 

## 字符串相加
例如 

'125' + '15' = '140'

'198' + '198' = '396'
```js
const multiply = (num1, num2) => {
  let i = num1.length;
  let j = num2.length;
  let area = 0;
  let res = '';
  
  while(i > 0 && j > 0) {
    i--;
    j--;
    
	let sum = Number(num1[i]) + Number(num2[j]) + Number(area);
    
    res = sum % 10 + res;
    
    area = Math.floor((Number(num1[i]) + Number(num2[j])) / 10); // 向上累加的值。例如 9 + 8 = 17  area = 1
  }
  
  if(i > 0) {
    return area > 0 ? (Number(num1.slice(0, i)) + Number(area)) + res : num1.slice(0, i) + res;
  }
  if(j > 0) {
    return area > 0 ? (Number(num2.slice(0, j)) + Number(area)) + res : num2.slice(0, j) + res;
  }
  
  return res;
}

const res = multiply('15', '125');
console.log(res);
```

## 

## 字符串相乘
例如 

'125' * '15' = '1875'

与相加不同的是，相乘需要将第一个字符串的每一位与第二个字符串的每一位相乘。是一对多的关系，而相加是一对一的关系。
```js
var multiply = function(num1, num2) {
  if(num1.startsWith('0') || num2.startsWith('0')) return 0;
  
  const N = new Array(num1.length + num2.length).fill(0);    // 初始化数组，因为相乘后位数会增加，用数组存储各位

  for (let i = 0, last1 = num1.length - 1; i <= last1; i++) {
    const n1 = Number(num1[last1 - i]);
    
    for (let j = 0, last2 = num2.length - 1; j <= last2; j++) {
      const n2 = Number(num2[last2 - j]);
      const x = N[i + j] + n1 * n2;           // 累加对应位置数值
      N[i + j] = x % 10;                      // 只保留一位数
      N[i + j + 1] += Math.floor(x / 10);     // 进位
    }
  }
  
  console.log(N);
};

multiply('15', '125');
```

## 

## 排序两个有序数组
const arr1 = [0, 1, 2, 4, 5];

const arr2 = [7, 13, 15, 16];
```js
const arr1 = [0, 1, 2, 4, 5];
const arr2 = [7, 13, 15, 16];

const sort = (arr1, arr2) => {
  let i = 0;
  let j = 0;
  const res = [];
  
  while(i < arr1.length && j < arr2.length) {
    if(arr1[i] < arr2[j]) {
      res.push(arr1[i]);
      i++;
    } else if (arr1[i] > arr2[j]) {
      res.push(arr2[j]);
      j++;
    } else {
      res.push(arr1[i]);
      res.push(arr2[j]);
      i++;
      j++;
    }
  }
  
  if(i < arr1.length) return res.concat(arr1.slice(i));
  if(j < arr2.length) return res.concat(arr2.slice(j));
  
  return res;
};

const res = sort(arr1, arr2);

console.log(res);
```

## 

## 二维数组查找
在二维数组中查找某元素，返回true或false，且每一行都是按照递增的顺序，每一行的元素个数都相等。
```js
// 先锁定左下角元素，如果查找的元素大于左下角则指针右移，否则直接上移
const arr = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const arr1 = [
  [1, 2, 10],
  [4, 5, 11],
  [7, 8, 12],
];
const isHasNum = (matrix, target) => {
  if(!matrix.length) return false;

  const singleLen = matrix[0].length;

  // 小于左上角或大于右上角 则可以不用向下判断了
  if(target < matrix[0][0] || target > matrix[matrix.length - 1][singleLen - 1]) return false;
  
  let i = matrix.length - 1;
  let j = 0;
  const len = matrix[0].length;
  
  while(i >= 0 && j < len) {
    if(matrix[i][j] < target) {
      j++;
    } else if(matrix[i][j] > target) {
      i--;
    } else {
      return true;
    }
  }
  
  return false;
}

const res = isHasNum(arr, -1);
console.log(res);
```

## 

## 优化后的斐波那契数列
```js
/*
   优化后的斐波那契数列，将计算后的值作为参数。
   普通的斐波，因为堆栈内存的原因，计算超过50时就会卡。
   当n为5的时候要计算fibonacci(4) + fibonacci(3)，当n为4的要计算fibonacci(3) + fibonacci(2) ，这时fibonacci(3)就是重复计算了     
*/

// 动态规划的递归版本
const fibo = (n, v1 = 1, v2 = 1) => {
  if(n === 0) return 0;
  if(n === 1) return v1;
  if(n === 2) return v2;
  
  return fibo(n - 1, v2, v1 + v2);
}

const res = fibo(50);
console.log(res);

// 普通for循环
const fibo = (n) => {
  if(n === 0) return 0;
  if(n === 1 || n === 2) return 1;
  
  let v1 = 1, v2 = 1;
  
  for(let i = 2; i < n; i++) {
    [v1, v2] = [v2, v1 + v2];
  }

  return v2;
}

const res = fibo(5);
console.log(res);
```

## 

## 统计一个数字在已排序数组中出现的次数
注意题目是已排序，可以利用二分法查找的思想。
```js
const arr = [1, 2, 3, 3, 3, 3, 5, 5, 5, 9, 10];
const find = (arr, target) => {
  let i = 0;
  let j = arr.length - 1;
  
  while(i <= j) {
    const mid = Math.floor((i + j) / 2);

    if(arr[mid] > target) {
      j = mid - 1;
    } else if (arr[mid] < target) {
      i = mid + 1;
    } else {
      let start = mid, end = mid;
     
      while(arr[start - 1] === target) start--;
      while(arr[end + 1] === target) end++;

      return end - start + 1;
    }
  }
  
  return 0;
};

const res = find(arr, 1);
console.log(res);
```

## 

## 求整数的二进制形式中数字1的个数
例如：一个二进制数1100，从右边数起第三位是处于最右边的一个1。减去1后，第三位变成0，它后面的两位0变成了1，而前面的1保持不变，因此得到的结果是1011；

再把原来的整数和减去1之后的结果做与运算，从原来整数最右边一个1那一位开始所有位都会变成0。如1100&1011=1000；
因此，把一个整数减去1，再和原整数做与运算，会把该整数最右边一个1变成0.那么一个整数的二进制有多少个1，就将进行多少次这样的操作。
```js
const summary = (num) => {
    if(num === 0) return 0;
    
    let count = 0;
    
    while(num !== 0) {
        count++;
        num = (num - 1) & num;
    }
    
    return count;
}

const res = summay(-23);
```

## 

##  表示数值的字符串
字符串"+100","5e2","-123","3.1416"和"-1E-16"都表示数值。

但是"12e","1a3.14","1.2.3","+-5"和"12e+4.3"都不是。
```js
// 正则
const isNum = (s) => {
  const reg = /^[+-]?(\d+(\.\d*)?|(\.\d+))([eE][+-]?\d+)?$/;
  
  return reg.test(s);
}
```

## 

## 字符串全排列
利用回溯思想。
```js
const showAllStr = (str) => {
  if(!str) return;
  
  const res = [];
  showAllArrange(str.split(''), res);
  
  return [...new Set(res)];
}

const showAllArrange = (arr, res, current = '', temp = '') => {
  current += temp;
  
  console.log(arr, current, temp);
  if(arr.length === 0) {
    res.push(current);
    return;
  }
  
 for(let i = 0; i < arr.length; i++) {
    const temp = arr.shift();
     
    showAllArrange(arr, res, current, temp);

    arr.push(temp);
  } 
}
const res = showAllStr('abc');
console.log(res);
```

## 

## 替换空格
将空格替换成 '%20'，不准用内置方法如split()

如 'we are   happy' 替换成 'we%20are%20%20%20happy'
```js
const str = 'we are   happy';

// 正则
str.replace(/\s/g, '%20');

// 遍历
const replaceEmpty = (str) => {
  let res = '';
  
  for(const i of str) {
    res += i === ' ' ? '%20' : i;
  }
  
  return res;
}

const res = replaceEmpty(str);
console.log(res);
```

## 

## 有一堆整数，把他们分成3份，并确保每一份的和 尽量相等
```js
const arr = [11, 42, 23, 4, 5, 6, 4, 5, 6, 11, 23, 42, 56, 78, 90];
const showSplit = (arr, n) => {
  arr.sort((a, b) => b - a);

  const sum = arr.reduce((a, b) => a + b);
  const res = [];
  
  const startSplit = (arr, n) => {
    let startNum = 0;
    const eachArr = [];
    
    // 表示已经累计到最后一组 则直接push剩下的。
    if(res.length === n - 1) {
      res.push(arr);
      return res;
    }
    
    arr.forEach((it, idx) => {
        // 均分n份
    	if(it + startNum <= Math.ceil(sum / n)) {
            startNum += it;
            eachArr.push(...arr.splice(idx, 1)); // splice改变数组
        }
    })
    
    console.log(startNum, 'startNum');
    res.push(eachArr);
    startSplit(arr, n)
  };
  
  startSplit(arr, n);
  return res;
};

const res = showSplit(arr, 3);
console.log(res);
```

## 

## 获取翻转数组中的最小值
翻转数组指的是[4,5,6,1,2,3]、[5, 6, 8, 2, 4];
```js
const arr = [5, 6, 8, 2, 4];

// reduce
const findMin = (arr) => {
  return arr.reduce((prev, cur) => {
    if(cur < prev) return cur;
    return prev;
  })
}

// 二分法
const findMin1 = (arr) => {
  let i = 0;
  let j = arr.length - 1;
  
  while(i < j) {
    const mid = Math.floor((i + j) / 2);
    
    if(arr[mid] > arr[j]) {
      i = mid + 1;
    } else if (arr[mid] < arr[j]) {
      j = j - 1;
    } else {
      j = mid;
    }
  }
  return arr[j];
}

const res = findMin1(arr);
console.log(res);
```
