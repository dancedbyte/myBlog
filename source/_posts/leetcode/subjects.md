---
title: 每日一道 算法题整理
tags: 算法
categories: 数据结构与算法
date: 2020-08-23
index_img: /img/leetcode.jpg
---

## 无重复字符的最长子串
利用滑动窗格思想，如果当前要累加的字符已经在之前的字符串中存在，则从索引位置向后截取。
```js
let str = 'pwwkewa';

const search = (s) => {
  let i = 0; // 记录索引
  let res = 0; // 记录最大值
  let str = ''; // 记录最长字符串
  const map = new Map();
  
  for(let j = 0; j < s.length; j++) {
    if(map.has(s[j]) && map.get(s[j]) >= i) i = map.get(s[j]) + 1;
    
    res = Math.max(res, j - i + 1);
    str = s.slice(i, j + 1).length > str.length ? s.slice(i, j + 1) : str; // slice 是左闭右开的原则，所以需要 j + 1
    
    map.set(s[j], j); // 将索引 作为 val
  }
  
  console.log(str);
}

search(str);
```

## 比较两个对象中的值是否相等
```js
const compare = (source, target) => {
  if(!source || !target) return false;
  
  if(typeof target !== 'object') return source === target;
  
  for(let key in target) {
    // 不去遍历原型上的属性
    if(target.hasOwnProperty(key)) {
        if(!compare(source[key], target[key])) {
            return false; 
        }
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

## 给定升序整数数组，找出其中连续出现的数字区间，即前后相差1
```js
const arr = [0, 1, 2, 4, 5, 7, 13, 15, 16, 17, 20, 21];

const find = (arr) => {
    let i = 0;
    const res = [];

    while (i <= arr.length - 1) {
        let j = i; // 记录起始点

        while (arr[i] + 1 === arr[i + 1]) {
            i++;
        }

        // 一旦不等 则说明进入了上面的 while 循环。则用 slice 进行截取
        if(i !== j) res.push(arr.slice(j, i + 1));

        i++;
    }

    console.log(res);
    return res;
};
find(arr);
```

## 字符串相加
例如 

'125' + '15' = '140'

'198' + '198' = '396'
```js
const add = (s1, s2) => {
  while(s1.length < s2.length) s1 = '0' + s1;
  while(s2.length < s1.length) s2 = '0' + s2;
  
  let res = '';
  let area = 0; // 向上累加的值
  
  for(let i = 0; i < s1.length; i++) {
    const cur = +s1[i] + +s2[i] + area;
    
    area = Math.floor(cur / 10);
    res = res + cur % 10;
  }
  
  res = area === 1 ? '1' + res : res;
  console.log(res);
};

add('125', '925');
```

## 字符串相乘
例如 

'125' * '15' = '1875'

与相加不同的是，相乘需要将第一个字符串的每一位与第二个字符串的每一位相乘。是一对多的关系，而相加是一对一的关系。
```js
const multiply = (n1, n2) => {
  if(n1 === 0 || n2 === 0) return 0;

  const num1 = n1 + '';
  const num2 = n2 + '';
  const N = new Array(num1.length + num2.length).fill(0);    // 初始化数组

  for (let i = 0, last1 = num1.length - 1; i <= last1; i++) {
    const n1 = Number(num1[last1 - i]);

    for (let j = 0, last2 = num2.length - 1; j <= last2; j++) {
      const n2 = Number(num2[last2 - j]);
      const x = N[i + j] + n1 * n2;           

      N[i + j] = x % 10;                      
      N[i + j + 1] += Math.floor(x / 10);
    }
  }

  const reverseN = N.reverse();
	
  while(reverseN[0] === 0) reverseN.shift();

  return reverseN.join('');
};

console.log(multiply(4, 25));
console.log(multiply(1865459497823, 6349526719336));
```

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

## 输出数组可排列的所有结果
```js
function perm(arr) { 
  const res = [];
  
  function fn(source, result) {  
    if (source.length === 0) {
      res.push(result);
    } else {
     	for (let i = 0; i < source.length; i++) {
            fn(source.slice(0, i).concat(source.slice(i + 1)), result.concat(source[i]));   
        }  
    }	
  }
  
  fn(arr, []);
  console.log(res);
}  
perm([1, 2, 3]);  
```

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
  
  while(i <= j) {
    const mid = Math.floor((i + j) / 2);
    
    // 如果中间位上的值 比 最后面的值还大，说明翻转的界限在右面。
    if(arr[mid] > arr[j]) {
      i = mid + 1;
    } else if (arr[mid] < arr[j]) {
      j = mid - 1;
    } else {
      j = mid;
    }
  }
  return arr[j];
}

const res = findMin1(arr);
console.log(res);
```

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

## 扑克牌中的顺子
从扑克牌中随机抽5张牌，判断是不是一个顺子，即这5张牌是不是连续的。2～10为数字本身，A为1，J为11，Q为12，K为13，而大、小王为 0 ，可以看成任意数字。A 不能视为 14。

记得考虑 4张2 等这种情况
```js
const isStraight = function (nums) {
    let a = 0, b = 0; // 用 a 记录王有几张，用 b 记录中间的空缺
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] === 0) {
            a++;
        } else {
            if (nums[i + 1] - nums[i] > 1) {
                b += nums[i + 1] - nums[i] - 1
            } else if (nums[i + 1] === nums[i]){ // 如果两张相等 永远不可能是顺子。
                return false;
            }
        }
    }
    return a >= b ? true : false;
};
```

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

## 输入一个链表，输出链表的倒数第k个节点
定义两个指针p和q，p先走k步，然后p,q一起走，直到p为null。最后的q即为倒数第k个节点。
```js
const findK = (head, k) => {
    let p = head, q = head;

    let i = 0;
    while (p) {
        if (i >= k) q = q.next; // 如果 k 等于 3，这时 q 是不动的，没有进入 if 里面。
        
        p = p.next;
        i++;
    }
    
    return i < k ? null : q; // 只有当链表长度小于 k 时才会出现 null 的情况。
};
```

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

## 合并两个递增排序的链表，要求合并后的链表也保持递增顺序
```js
const mergeLink = (l1, l2) => {
  if(!l1) return l2;
  if(!l2) return l1;

  const l = new ListNode();
  let p = l;

  while(l1 && l2) {
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

console.log(moveZero([0,1,0,3,0,7]))  //  [1,3,7,0,0,0]
```

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

## 给定target，求和为target的连续正整数序列
如target = 9; 输出 [ [2, 3, 4], [4, 5] ]
```js
const find = (target) => {
  if(!target) return [];
  
  const mid = Math.ceil(target / 2); // 多数相加，最大数一定小于取中的数字
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

## 给定正整数 n，将其拆分为至少两个正整数的和，并使这些整数的乘积最大化。 返回可以获得的最大乘积
如果n=5，则可以拆分成1和4，4又可以拆分成1和3，向下遍历，直到全为1。

参考leetcode 343题。

<img alt="pic" src='/img/leetcode_1.png' width=400 style="margin-bottom: 10px" />

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

## 给定一个链表，返回链表开始入环的第一个节点。 如果链表无环，则返回 null
定义快慢指针。
```js
const findNode = function (head) {
    let slowP = head, fastP = head; // 都从头节点出发

    while (fastP) {                
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

## 给定排序数组，原地删除数组中的重复元素，返回新数组的长度
```js
const arr = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];

const remove = (arr) => {
  let i = 0;
  
  while(i < arr.length) {
    if(arr[i] === arr[i + 1]) {
      arr.splice(i, 1)
    } else {
      i++;
    }
  }
  
  console.log(arr); // [0, 1, 2, 3, 4]
  return arr.length;
}
remove(arr)
```

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

### 找出最接近给定值的三数之和
```js
const threeSumClosest = (nums, target) => {
    if(nums.length <= 3) return nums.reduce((a, b) => a + b);
  
    const data = nums.sort((a, b) => a - b);
    const len = data.length;
  	let res = nums[0] + nums[1] + nums[2];
    
    for(let i = 0; i < len; i++) {
        let left = i + 1;
        let right = len - 1;
        
        while(left < right) {
            const sum = data[left] + data[right] + data[i];
            
            if(Math.abs(sum - target) < Math.abs(res - target)) {
              res = sum;
            } else if (sum > target) {
              right--;
            } else if (sum < target) {
              left++;
            } else if (sum === target) {
                res = sum;
              break;
            }
        }
    }
    
    console.log(res);
    return res;
};
```

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

## 判断一个数 n 是不是快乐数。
对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和，然后重复这个过程直到这个数变为 1，也可能是 无限循环 但始终变不到 1。如果 可以变为 1，那么这个数就是快乐数。
```
输入：19
输出：true
解释：
1^2 + 9^2 = 82
8^2 + 2^2 = 68
6^2 + 8^2 = 100
1^2 + 0^2 + 0^2 = 1
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
  const map = new Map(); // 建立一个字典表
  let res = sum(num);
  
  while(res !== 1) {
    if(map.has(res)) return false; // 如果该说在字典表中存在说明已经计算过 可直接返回
    
    map.set(res, true);
    
    res = sum(res);
  }
  return true;
}
console.log(isHappyNum(19)); // true
```

## 给定整数数组，找出一个和最大的子数组（最少有一个元素），输出这个最大的和。
```js
const arr = [4, 6, -100, 2, 3, 9];
const arr1 = [-50, 100, -1, 50];

// 方式1
const findSubsetSum = (arr) => {
  if(arr.length === 1) return arr[0];
  
  for(let i = 1; i < arr.length; i++) {
    if(arr[i - 1] >= 0 && arr[i] >= 0) {
      arr[i] += arr[i - 1];
    }
  }
  
  console.log(arr); // [4, 10, -90, 2, 5, 14]
  console.log(Math.max(...arr)); // 14
}
findSubsetSum(arr);

// 方式2
const findMax = (arr) => {
  if(arr.length === 1) return arr[0];
  
  let prev = 0, max = arr[0];
  
  arr.forEach(it => {
    prev = Math.max(it, prev + it); // 当前项 和 当前项+前一项 相比
    max = Math.max(prev, max);
  })
  
  console.log(max);
}
```

## 给定数组和val值，原地移除数组中所有等于val的元素，只能使用O1的额外空间
```js
const remove = (nums, val) => {
  let i = 0;
  
  while(i < nums.length) {
    if(nums[i] === val) {
      nums.splice(i, 1);
    } else {
      i++;
    }
  }
  
	console.log(nums); // [0, 1, 3, 0, 4]
};

remove([0,1,2,2,3,0,4,2], 2)
```

## 将 id parentId 关系的数据 转化为 树形结构数据
```js
const data = [
  {id:1, parentId: 0},
  {id:2, parentId:1},
  {id:3, parentId:1}
];
const buildTree = (list) => {
  const temp = {};
  const tree = [];
  
  list.forEach((it, idx) => temp[it.id] = it);
  
  for(const k in temp){
    const parentId = temp[k].parentId;
    
    if(parentId) {
      if(!temp[parentId].children) {
        temp[parentId].children = [];
      }
      temp[parentId].children.push(temp[k]);
    } else {
      tree.push(temp[k]);
    }
  }

  return tree;
}
console.log(buildTree(data)); 
// [
//      {
//          id: 1, parentId: 0, children: [
//              {id: 2, parentId: 1},
//              {id: 3, parentId: 1},
//          ]
//      }      
// ]
```

## 计算出将 word1 转换成 word2 所使用的最少操作数
你可以对一个单词进行三种操作：插入一个字符、删除一个字符、替换一个字符。

```js
const insteadStr = (s1, s2) => {
  const len1 = s1.length + 1; // +1防止空字符串
  const len2 = s2.length + 1; // +1防止空字符串
  const dp = Array(len2).fill(0).map(() => Array(len1).fill(0)); // 生成矩阵
  
  // s1 在纵轴
  for(let i = 0; i < len1; i++) {
    dp[0][i] = i;
  } 
  // s2 在横轴
  for(let j = 0; j < len2; j++) {
    dp[j][0] = j;
  }
  
  for(let j = 1; j < len2; j++) {
    for(let i = 1; i < len1; i++) {
      dp[j][i] = Math.min(
      	dp[j][i - 1] + 1,
        dp[j - 1][i] + 1,
        dp[j -1][i - 1] + (s1[i - 1] === s2[j - 1] ? 0 : 1)
      )
    }
  }
  
  return dp[s2.length][s1.length];
};

console.log(insteadStr('word1', 'word2222')); // 4
```

## 计算所有部门的工资的总和
1. 递归时，js 的调用记录栈会保留每一次执行的上下文，最先执行的会被压入栈底。

2. 当整个递归遍历结束，会将执行上下文依次从栈顶弹出，所以说最先进入执行栈的会被最后参与计算。

```js
const company = { 
  sales: [{name: 'John', salary: 1000}, {name: 'Alice', salary: 1600 }],
  development: {
    sites: [{name: 'Peter', salary: 2000}, {name: 'Alex', salary: 1800 }],
    internals: [{name: 'Jack', salary: 1300}]
  }
};
const dfs = (cur) => {
  if(Array.isArray(cur)) {
    return cur.reduce((prev, next) => prev + next.salary, 0); // 易错，要给定初始值0，让返回结果作为下一次计算的 prev 
  } else {
    let sum = 0;
    
    for(const val of Object.values(cur)) {
      const res = dfs(val);
        
      console.log(res); // 最先输出 2600. 但是 2600 是最后参与的加法运算。
      sum += res;
    }
    return sum;
  }
};
const res = dfs(company);
console.log(res);
```

## 生成菱形
主要练习使用 repeat。给定重复次数，可以不用再去使 for 循环遍历生成，可以直接帮我们生成一段重复的字符。

```js
const gen = (n) => {
  let str = '';
  
  const genFunc = (n, i) => {
    str += ' '.repeat((n - i) / 2) + '*'.repeat(i) + '\n';  
  }

  for(let i = 1; i <= n; i += 2) {
		genFunc(n, i);
  }
  
  for(let i = n - 2; i >= 1; i -= 2) {
		genFunc(n, i);
  }
  
  console.log(str);
}
gen(7);
/*
       *
      ***
     *****
    *******
     *****
      ***
       *
*/
```

## 杨辉三角形
1. 杨辉的规则是每一行的第一个元素和最后一个元素都是 1。
2. 假设当前是 m 行，每行的每个元素记为第 n 个元素。则用公式可以表示为：C(m, n) = C(m-1, n) + C(m -1, n -1)

```js
const gen = (n) => {
  // 第m行的 第n个元素
  const combine = (m, n) => {
    if(n === 0 || m === n) return 1; // 某行的第一个元素和最后一个元素都是 1
    
    return combine(m - 1, n - 1) + combine(m - 1, n)      
  }
  
  let res = '';
  // 外层 for 代表当前第几行
  for(let i = 0; i < n; i++) {
    let str = '';
    
    // 内层 for 代表当前行的数字都有哪些，当前行的元素个数一定小于等于当前行数
    for(let j = 0; j <= i; j++) {
      str += combine(i, j) + ' ';
    }
    str += '\n';
    res += str;
  }
  
  console.log(res);
}
gen(8);

/*
    1 
    1 1 
    1 2 1 
    1 3 3 1 
    1 4 6 4 1 
    1 5 10 10 5 1 
    1 6 15 20 15 6 1 
    1 7 21 35 35 21 7 1 
*/
```

## 杨辉三角形 变形2
求第 m 行的元素并输出。

```js
const find = (m) => {
  let result = [];
  
  // 由杨辉的规则可以得出第 m 行 算上左右的两个1 一共有 m 个元素
  for(let i = 1; i <= m; i++) {
    for(let j = result.length - 1; j > 0; j--) {
      result[j] = result[j] + result[j-1]; // 一直在同一个数组上进行操作，相当于替换当前值
    }
    result = result.concat(1);
  }
  console.log(result);
};

find(3); // [1, 2, 1]
```

## 合并两个number数组a，b并排序
合并两个number数组a，b并排序，如果有一个数出现多次，如a数组有1个5，b数组有2个5，合并出的数组应有2个5，即按次数多的保留.

```js
const nums1 = [3, 1, 2, 5, 6, 5];
const nums2 = [9, 6, 5, 7, 5, 7];

const mergeToOne = (nums1, nums2) => {
    const nums = [...nums1, ...nums2];
    let res = [];
    const filterFunc = (arr, n) => arr.filter(it => it === n);
    const map = new Map(); // 关键是创建一个字典表，如果之前统计过，则跳过

    for(let i = 0; i < nums.length; i++) {
        const it = nums[i];

        if((nums1.includes(it) && !nums2.includes(it)) || (!nums1.includes(it) && nums2.includes(it))) {
            res.push(it);
        } else {
            if(map.get(it)) continue; // continue 不能在 forEach 中使用

            const cur1 = filterFunc(nums1, it);
            const cur2 = filterFunc(nums2, it);

            res = res.concat(cur1.length > cur2.length ? cur1 : cur2);
            map.set(it, true);
        }
    }

    return res.sort((a, b) => a - b);
};
const res = mergeToOne(nums1, nums2);
console.log(res); // [1, 2, 3, 5, 5, 6, 7, 7, 9]
```

## 输入数字，找到对应字母
输入26返回z
输入27返回aa
输入28返回ab
输入53返回aaa

分析：可以借助 String.fromCharCode(num + 96)，根据 unicode 得到对应的字母 a - z
```js
const find = (num) => {
  if(num <= 26) return String.fromCharCode(num + 96);
  
  let i = 0;
  
  while(num > 26) {
    i++; // 记录 a 的个数
    num -= 26;
  }
  
  return 'a'.repeat(i) + String.fromCharCode(num + 96); // 借用原生的 repeat 方法实现字符串复制
}

console.log(find(53)); // aaa
```

## 实现四则运算
<img src="/img/leetcode_2.png" width="400" style="margin-bottom: 10px" /> 

不能用 eval。可以将运算字符串转化为二叉树。
```js
// 构建二叉树
function CalcNode(expr){
    const exprArr = expr.split("");
  	const length  = exprArr.length;
    let index = 0; // 记录符号所在位置

    this.left = null;
    this.right = null;

    if(length > 1) {
        for(let i = length - 1; i >= 0; i--) {   
            if(exprArr[i] === "*" || exprArr[i] === "/"){
              index = i;
            }else if(exprArr[i] === "+" || exprArr[i] === "-"){ // 先去找 加号或减号
              index = i;
              break;
            }
        }

        const leftArr = [];
        const rightArr = [];
        // 这里分了两个 for 循环，区分每个节点的左右子树
        for(let i = 0; i < index; i++){
          leftArr.push(exprArr[i]);     
        }
     	  for(let i = index + 1; i < length; i++){
		      rightArr.push(exprArr[i]);
        }

        this.left = new CalcNode(leftArr.join(""));
        this.right = new CalcNode(rightArr.join(""));
    }

    this.value = exprArr[index]; // 是将符号作为根节点
}
CalcNode.prototype.calculate = function(){
    let res = 0;

    if(this.left=== null && this.right === null){
        res = parseInt(this.value);
    }else{
        const leftValue = this.left.calculate();
        const rightValue = this.right.calculate();

      	// 打印二叉树可发现，this.value代表符号
        switch(this.value){
            case "*":
                res += leftValue*rightValue;
                break;
            case "/":
                res += leftValue/rightValue;
                break;
            case "+":
                res += leftValue+rightValue;
                break;
            case "-":
                res += leftValue - rightValue;
            default:
                break;
        }
    }

    return res;
}
const cnode = new CalcNode("1+2*3+4");
console.log(cnode.calculate()); // 11
```

## 股票最大利润
给定的数组是按时间排序的，每位上的值代表当天的价格，求何时抛出利润最大。

```js
const arr =  [7,1,5,3,6,4]; // 6 - 1 = 5
const arr1 = [7,6,4,3,1]; // 为 0

// 定义两个指针，寻找最大和最小值。
const find = (arr) => {
  let left = 0;
  let right = arr.length - 1;
  let min = arr[left];
  let max = arr[right];
  
  while(left <= right) {
    if(arr[left] < min) {
      min = arr[left];
    }
    if(arr[right] > max) {
      max = arr[right];
    }
    left++;
    right--;
  }
  
  console.log(min, max);
  
  return max - min;
}
find(arr);
```
