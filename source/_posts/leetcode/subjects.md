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
16. 给定一个数据列表（可转成树），把数据打印成有缩进的数据结果
17. 扑克牌中的顺子
18. 0～n-1中缺失的数字
19. 排序多个有序数组
20. 将正整数数组中所有数字拼起来拼成一个数，找到所有可能拼接数字中最小的一个
21. 输入一个链表，输出链表的倒数第k个节点。
22. 获取两个链表的第一个交点
23. 寻找两数之和，输出一种情况即可。
24. 给定整数数组，奇数靠前，偶数靠后。
25. 给定二叉树和sum，判读是否存在某条路径的和为sum。
26. 复制复杂链表（每个节点有 next(指向下一个) 和 random(指向任意一个或null) 两个指针）
27. 合并两个递增排序的链表，要求合并后的链表也保持递增顺序。
28. 数组移动0。将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序
29. 传入整型数组arr和数字n，按照与n的最近的规律（即绝对值）排序元素。
30. 给定target，求和为target的连续正整数序列
31. 给定正整数 n，将其拆分为至少两个正整数的和，并使这些整数的乘积最大化。 返回可以获得的最大乘积
32. 给定一个链表，返回链表开始入环的第一个节点。 如果链表无环，则返回 null
33. 给定两个字符串，判断他们是否是同构的。
34. 给定排序数组，原地删除数组元素。
35. 给定IP地址列表，请排序。
36. 给定一维整数数组，返回二维数组，其中每个小数组长度为3并且之和为0。
37. 合并两个有序数组nums1、nums2到nums1中，使nums1成为一个有序数组。
38. 判断一个数 n 是不是快乐数。
39. 给定整数数组，找出和最大的子数组，子数组最少有一个元素。


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
const arr1 = [18, 19, 17, 12, 16, 15, 2, 1];
const arr2 = [30, 10, 8, 2, 10];

const showSplit = (arr, n) => {
  arr.sort((a, b) => b - a);

  const sum = arr.reduce((a, b) => a + b);
  const res = [];
  const startSplit = (arr, n) => {
    let start = 0;
    const eachArr = [];
    const avSum = Math.ceil(sum / n); // 33
    
    // 表示已经累计到最后一组 则直接push剩下的。
    if(res.length === n - 1) {
      res.push(arr);
      return res;
    }
    
    for(let i = 0; i < arr.length; i++) {
      // 如果当前元素大于平均值 不再向下计算。
      if(arr[i] > avSum) {
        eachArr.push(...arr.splice(i, 1));
        break;
      }
      if(start + arr[i] <= avSum) {
        start += arr[i];
		eachArr.push(...arr.splice(i, 1));
      }
    }

    res.push(eachArr);
    startSplit(arr, n)
  };
  
  startSplit(arr, n);
  return res;
};
console.log(showSplit(arr2, 3));
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

## 

## 给定一个数据列表，把数据打印成有缩进的数据结果
先将parentId类型的结构转化成树，在利用二叉树深度优先遍历输出结果。
```js
const arr = [
  { id: 1001, parentId: 0, name: 'AA' },
  { id: 1002, parentId: 1001, name: 'BB' },
  { id: 1003, parentId: 1001, name: 'CC' },
  { id: 1004, parentId: 1003, name: 'DD' },
  { id: 1005, parentId: 1003, name: 'EE' },
  { id: 1006, parentId: 1002, name: 'FF' },
  { id: 1007, parentId: 1002, name: 'GG' },
  { id: 1008, parentId: 1004, name: 'HH' },
  { id: 1009, parentId: 1005, name: 'II' },
];
const toTree = (arr) => {
  const idObj = {};
  const res = [];
  arr.forEach(it => idObj[it.id] = it);
  
  for(const it in idObj) {
    const cur = idObj[it];
    if(cur.parentId) {
      if(idObj[cur.parentId].children) {
        idObj[cur.parentId].children.push(cur);
      } else {
       	idObj[cur.parentId].children = [cur];
      }
    } else {
      res.push(cur);
    }
  }
  
  const dfs = (root, empty) => {
  	console.log(empty +  root.name);  
    root.children && root.children.forEach(it => dfs(it, empty + '  '));
  }
  
  dfs(res[0], '');
  
  /*
    AA
        BB
            FF
            GG
        CC
            DD
                HH
            EE
                II
  */    
};
toTree(arr);
```

## 

## 扑克牌中的顺子
从扑克牌中随机抽5张牌，判断是不是一个顺子，即这5张牌是不是连续的。2～10为数字本身，A为1，J为11，Q为12，K为13，而大、小王为 0 ，可以看成任意数字。A 不能视为 14。

记得考虑 4张2 等这种情况
```js
const isStraight = function (nums) {
    let a = 0, b = 0;
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] == 0) {
            a++;
        } else {
            if (nums[i + 1] - nums[i] > 1) {
                b += nums[i + 1] - nums[i] - 1
            } else if (nums[i + 1] == nums[i]){
                return false;
            }
        }
    }
    return a >= b ? true : false;
};
```

## 

## 0～n-1中缺失的数字
数组规律，递增，并且每个数字都在范围0～n-1之内，且只有一个数字不在该数组中。

输入[0,1,2,3,4,5,6,7,9] ，输出8
```js
const missingNumber = (arr) => {
    let left = 0;
    let right = arr.length - 1;
    
    while(left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if(arr[mid] === mid) {
            left = mid + 1; // 缺失元素在右面
        } else {
            right = mid - 1; // 缺失元素在左面
        }
    }
    
    return left;
};
```

## 

## 排序多个有序数组
利用归并排序的思路。
```js
function merge(arr){
  if(!arr.length) return;
  if(arr.length === 1) return arr[0];

  const child = arr.splice(0,1)[0];
  const res = [];
  let i = 0, j = 0;
  
  arr = merge(arr); 
   
  while(i < child.length && j < arr.length) {
    if(child[i] < arr[j]) {
     	res.push(child[i++]); 
    } else if (child[i] > arr[j]){
      res.push(arr[j++]);
    } else {
      res.push(child[i++]);
      res.push(arr[j++]);
    }
  }
  
  while(i < child.length) res.push(child[i++]);
  while(j < arr.length) res.push(arr[j++]);

  return res;
}

console.log(merge([[1,1,2,3,12], [8,8,9,10], [-1,0,3,5]]))
```

## 

## 将正整数数组中所有数字拼起来拼成一个数，找到所有可能拼接数字中最小的一个
```js
const arr1 = [10, 100];
const arr2 = [297, 10, 25, 11, 68, 2788, 10000];
const arr3 = [3, 25]; // 253
const arr4 = [3, 52]; // 352
const arr5 = [1, 2, 10];

// 方式1
const findMin = (arr) => {
  // 按位数去比较
  const sortFunc = (a, b) => {
    let i = 0;
    const strA = a.toString();
    const strB = b.toString();
    const len = Math.min(strA.length, strB.length);
    let isAllSame = true;
    
    while(i < len) {
      if(strA[i] === strB[i]) {
      	i++;  
      } else {
        isAllSame = false; // 正常情况下肯定会进入else
        return strA[i] - strB[i];
      }
    }
    
    // 避免[10, 100]这种情况，应将[10, 100] => [100 ,10]
    if(isAllSame) return strB - strA;
  }
    
  arr.sort(sortFunc);
	console.log(arr); // [10000, 11, 25, 2788, 297, 68]
  
  return arr.join('')
};

const res = findMin(arr5);

// 方式2
const findMin = (nums) => nums.sort((a, b) => ('' + a + b) - ('' + b + a));
```

## 

## 输入一个链表，输出链表的倒数第k个节点
定义两个指针p和q，p先走k步，然后p,q一起走，直到p为null。最后的q即为倒数第k个节点。
```js
const findK = (head, k) => {
    let p = head, q = head;

    let i = 0;
    while (p) {
        if (i >= k) q = q.next;
        
        p = p.next;
        i++;
    }
    
    return i < k ? null : q;
};
```

## 

## 获取两个链表的第一个交点
遍历得到两个链表的长度，以此来得到长度差diff。

将慢指针 slow 指向较长链表，快指针 fast 指向较短链表。

slow 先向前移动 diff 个距离。

slow 和 fast 同时向前移动，每次移动一个距离，若存在公共节点，那么它们一定会遇上。

```js
const findX = (l1, l2) => {
  const p1 = l1;
  const p2 = l2;
  const showLength = (p) => {
    let len = 0;
   	while(p) {
      len++;
    	p = p.next;
  	} 
    return len;
  }
  const len1 = showLength(p1);
  const len2 = showLength(p2);
  
  if(!len1 || !len2) return null;
  
  let diff = Math.abs(len1 - len2);
  let slow = len1 > len2 ? l1 : l2;
  let fast = len1 > len2 ? l2 : l1;
  
  while(diff--) {
    slow = slow.next;
  }
  
  while(slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }
  
  return slow
};
```

## 

## 寻找两数之和，输出一种情况即可
通过字典记录差值。
```js
const findTwoSum = (arr, n) => {
  const map = new Map();
  
  for(let i = 0; i < arr.length; i++) {
    if(map.has(arr[i])) {
      return [map.get(arr[i]), arr[i]];
    } else {
     	map.set(n - arr[i], arr[i]); // [[7, 2]]
    }
  }
  
  return [];
};

const res = findTwoSum([2, 7, 11, 15], 9);
console.log(res);
```

## 给定整数数组，奇数靠前，偶数靠后。
利用双指针，向中间聚合。
```js
const arr = [2, 4, 3, 7, 7, 9, 8];
const arr1 = [2, 1];
const arr2 = [1, 2, 3, 4, 5, 7];
const arr3 = [2, 1, 4];

const change = (arr) => {
  let i = 0, j = arr.length - 1;
  
  while(i < j) {
    if(arr[i] % 2 === 0) {
      if(arr[j] % 2 === 1) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
      } else {
        while(arr[j] % 2 === 0 && j > i) {
         	j--; 
        }
       	[arr[i], arr[j]] = [arr[j], arr[i]]; 
      }
    }
    
    i++;
  }
  
  console.log(arr);
};

change(arr3);
```

## 

## 给定二叉树和sum，判读是否存在某条路径的和为sum
利用先序遍历。
```js
const findList = (root, sum) => {
  const res = [];

  const preLoader = (root, curSum, path) => {
    if(!root) return;

    curSum += root.val;
    path = path.concat(root.val);

    // 避免 root => [1, 2], sum = 1 这种情况
    if(!root.left && !root.right && curSum === sum) {
      res.push(path);
    }

    preLoader(root.left, curSum, path);
    preLoader(root.right, curSum, path);
  }

  preLoader(root, 0, []);

  console.log(res); // 所有路径

  return !!res.length;
}
```

## 

## 复制复杂链表
每个节点有 next(指向下一个) 和 random(指向任意一个或null) 两个指针。利用深拷贝的思路，map记录node节点。
```js
const copyList = (head) => {
  if(!head) return null;
  
  const map = new Map();
  const copy = (node) => {
    if(!node) return null;
    
    if(map.has(node)) return map.get(node);
    
    const res = new NodeList();
    map.set(node, res);
    
    res.val = node.val;
    res.next = copy(node.next);
    res.random = copy(node.random);
    
    return res;
  };
  
  return copy(head);
};
```

## 

## 合并两个递增排序的链表，要求合并后的链表也保持递增顺序
```js
const mergeLink = (l1, l2) => {
  if(!l1) return l2;
  if(!l2) return l1;

  const l = new ListNode();
  let p = l;

  while(l1 && l2) {
    // 不需要区分 l1.val === l2.val 的情况。因为指针会自动向下遍历
    if(l1.val <= l2.val) {
      p.next = l1;
      l1 = l1.next;
    } else {
      p.next = l2;
      l2 = l2.next;
    };

    p = p.next;
  }

  if(l1) p.next = l1;
  if(l2) p.next = l2;

  return l.next;
}
```

## 

## 数组移动 0
给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。
```js
// 双指针 
const moveZero = (nums) => {
    let j = 0;
    
    for(let i = 0; i < nums.length; i++){
        if(nums[i] !== 0){
            [nums[i], nums[j]] = [nums[j], nums[i]];
            j++;
        }
    }
    
    return nums;
}

console.log(fn2([0,1,0,3,0,7]))  //  [1,3,7,0,0,0]
```

## 

## 传入整型数组arr和数字n，按照与n的最近的规律（即绝对值）排序元素
```js
const arr = [7, 28, -1, 0, 7, 33];

const sortFunc = (arr, n) => {
  const map = new Map();
  
  arr.forEach((it, idx) => {
    map.set(idx, Math.abs(it - n));
  })
  
  const res = [...map];
  res.sort((a, b) => a[1] - b[1]);
  
  return res.map(it => arr[it[0]]);
};

console.log(sortFunc(arr, 5)); // [7, 7, 0, -1, 28, 33]
```

## 

## 给定target，求和为target的连续正整数序列
如target = 9; 输出 [ [2, 3, 4], [4, 5] ]
```js
const find = (target) => {
  if(!target) return [];
  
  const mid = Math.ceil(target / 2); 
  const arr = Array(mid).fill().map((it, idx) => idx + 1);
  const res = [];
  let i = 0; // 记录索引
  
  while(i < mid - 1) {
    let next = i + 1;
    let curSum = arr[i] + arr[next];
    
    while(curSum <= target) {
      if(curSum === target) {
        res.push(arr.slice(i, next + 1));
      }
      next++;
      curSum += arr[next];
    }

    i++;
  }
  
  console.log(res);
};

find(15);
```

## 

## 给定正整数 n，将其拆分为至少两个正整数的和，并使这些整数的乘积最大化。 返回可以获得的最大乘积
如果n=5，则可以拆分成1和4，4又可以拆分成1和3，向下遍历，直到全为1。

参考leetcode 343题。

<img alt="pic" src='http://note.youdao.com/yws/res/9248/WEBRESOURCEc0f4588002afeef3f94ec041b1299c1e' width=400 />

```js
const integerBreak = (n) => {
    const memo = new Array(n + 1); // 对计算结果进行缓存
    
    const dfs = (n) => {
        if (memo[n]) return memo[n];
        let res = 0;
        for (let i = 1; i <= n - 1; i++) {
            res = Math.max(res, i * (n - i), i * dfs(n - i));
        }
        memo[n] = res;
        return memo[n];
    };
    return dfs(n);
};
```

##

## 给定一个链表，返回链表开始入环的第一个节点。 如果链表无环，则返回 null
定义快慢指针。
```js
const findNode = function (head) {
    let slowP = head, fastP = head; // 都从头节点出发

    while (fastP) {                // head就是null了，没有入环点，直接返回null
        if (fastP.next == null) return null; // fastP.next为null也说明无环
        
        slowP = slowP.next;           // 慢指针走一步
        fastP = fastP.next.next;      // 快指针走两步
        
        if (slowP === fastP) {        // 首次相遇
            fastP = head;               // 让快指针回到头节点
            while (true) {             // 开启循环，让快慢指针相遇
                if (slowP === fastP) {    // 相遇，地点发生在入环处
                    return slowP;           // 返回出指针的位置
                }
                fastP = fastP.next;       // 快慢指针都走一步
                slowP = slowP.next;
            }
        }
    }
    return null;
};
```

##

## 给定两个字符串，判断他们是否是同构的
如果s中的字符可以被替换得到t，并且所有出现的字符都必须被同一个字符替换才行，且保留字符出现的顺序。

如 'egg' 和 'add' -> true

如 'foo' 和 'bar' -> false

如 'paper' 和 'title' -> true
```js
const judge = (s, t) => {
  const map = new Map();
  
  for(let i = 0; i < s.length; i++) {
    const key = s[i];
    const val = t[i];
    
    if(map.has(key)) {
      if(map.get(key) !== val) return false;
    } else {
      map.set(key, val)
    }
  }
  
  return true;
};
judge('paper', 'title');
```

##

## 给定排序数组，原地删除数组元素
给定数组nums[1, 1, 2]。需要返回数字2，并且数组的前两个元素被修改为1和2。
```js
const arr = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];

const remove = (arr) => {
  let num = 0;
  
  for(let i = 1; i < arr.length; i++) {
    if(arr[i] !== arr[num]) {
      arr[++num] = arr[i]
    }
  }
  
  arr.splice(0, num + 1)
  
  return num + 1;
}
console.log(remove(arr)); // 5
console.log(arr); // [0, 1, 2, 3, 4, 2, 2, 3, 3, 4] 前5个元素被修改为[0, 1, 2, 3, 4]
```

##

## 给定ip地址列表并排序
```js
const demo = ['1.0.0', '1.0.0', '2.12.1', '2.12.3', '1.2.3.4.5', '0.18.1'];
const deal = (demo) => {
	demo.sort((a, b) => {
    const arr = a.split('.');
    const brr = b.split('.');
    
    let i = 0;
    while(i < arr.length && i < brr.length) {
      if(Number(arr[i]) === Number(brr[i])) {
        i++;
      } else {
        return Number(arr[i]) - Number(brr[i]);
      }
    }
  })
  
  return demo;
};

const res = deal(demo);
console.log(res);
```

##

## 给定一维整数数组，返回二维数组，其中每个小数组长度为3并且之和为0
```js
const sumZero = (arr) => {
  arr.sort((a, b) => a - b);
  const len = arr.length;
  const res = [];
  
  for(let i = 0; i < len - 2, arr[i] <= 0; i++) {
    if(arr[i] === arr[i - 1]) continue;
    
    let left = i + 1, 
        right = len - 1,
        target = 0 - arr[i];
    
    while(left < right) {
      const sum = arr[left] + arr[right];
      
      if(sum > target) {
       	right--; 
      } else if (sum < target) {
        left++;
      } else {
        res.push([ arr[left], arr[i], arr[right] ]);
        
        while(arr[left] === arr[left + 1]) left++; // 跳过重复的
        while(arr[right] === arr[right - 1]) right--; // 跳过重复的

        left++;
        right--;
      }
    }
  }
  console.log(res); // [ [-1, -1, 2], [0, -1, 1] ]
}
sumZero([1, 0, -1, 1, 2, -1, -4]);
```

##

## 合并两个有序数组nums1、nums2到nums1中，使nums1成为一个有序数组。
```js
const nums1 = [1, 2, 10];
const nums2 = [2, 3, 7, 8, 11];

const mergeToOne = (nums1, nums2) => {
  let l1 = nums1.length - 1;
  let l2 = nums2.length - 1;
  let len = nums1.length + nums2.length - 1;

  while (l1 >= 0 && l2 >= 0) {
    nums1[len--] = nums1[l1] > nums2[l2] ? nums1[l1--] : nums2[l2--];
  }
  
  return nums1;
};
const res = mergeToOne(nums1, nums2);
console.log(res); // [1, 2, 2, 3, 7, 8, 10, 11]
```

##

## 判断一个数 n 是不是快乐数。
对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和，然后重复这个过程直到这个数变为 1，也可能是 无限循环 但始终变不到 1。如果 可以变为 1，那么这个数就是快乐数。
```
输入：19
输出：true
解释：
12 + 92 = 82
82 + 22 = 68
62 + 82 = 100
12 + 02 + 02 = 1
```
```js
const sum = (n) => {
  let s = n + '';
  let sum = 0;
  
  for(let i of s) {
    sum += Math.pow(Number(i), 2);
  } 
  return sum;
}

const isHappyNum = (num) => {  
  const map = new Map();
  let res = sum(num);
  
  while(res !== 1) {
    if(map.has(res)) return false;
    
    map.set(res, true);
    
    res = sum(res);
  }
  return true;
}
console.log(isHappyNum(19)); // true
```

##

## 给定整数数组，找出和最大的子数组，子数组最少有一个元素。
```js
const arr = [4, 6, -100, 2, 3, 9];
const findSubset = (arr) => {
  if(arr.length === 1) return arr[0];
  
  for(let i = 1; i < arr.length; i++) {
    if(arr[i - 1] > 0) {
      arr[i] += arr[i - 1];
    }
  }
  
  console.log(arr); // [4, 10, -90, 2, 5, 14]
  console.log(Math.max(...arr)); // 14
}
findSubset(arr);
```
