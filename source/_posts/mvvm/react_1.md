---
title: React 知识点汇总
tags: React
categories: MVVM
date: 2020-10-20
index_img: /img/react_1.jpg
---

## Hooks 中 useState 与 class 中 state 区别？
1. class-state 会合并我们传入的state，而 useState 会直接重置我们传入的 state。

```js
// hook 中需要手动合并
const [state, setState] = useState({ name: 'name', age: 10, count: 0 });

setState({
    ...state,
    count: state.count + 1
})
```

2. useState 创建的 state 变化时，会导致整个函数重新初始化并创建，我们可以通过创建 useRef 来保存我们想要的数据。

    useRef 本质是创建一个对象，就算当 state 变化导致函数重建时，但是 useRef 创建的对象指向的地址还是同一个。

```
import * as React from 'react';

const {useState, useEffect, useRef} = React;
const TIME_COUNT = 10;
const Home = () => {
    const intervalRef = useRef(null); // 用 useRef 保存计时器ID
    const [count, changeCount] = useState(0);

    useEffect(() => {
        if (count === TIME_COUNT) {
            intervalRef.current = setInterval(() => {
                changeCount((preCount) => preCount - 1);
            }, 1000);
        } else if (count === 0) {
            clearInterval(intervalRef.current);
        }
    }, [count]);

    // 一般单独拎出来一个 useEffect，单独去处理清除工作。组件卸载时清除计时器
    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    console.log(intervalRef.current); // 保持不会变

    return (
        <>
            <button type='button' disabled={!!count} onClick={() => changeCount(TIME_COUNT)}>
                {count ? `${count} s` : '获取验证码'}
            </button>
        </>
    );
};

export default Home;
```
