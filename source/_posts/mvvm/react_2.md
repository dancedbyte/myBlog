---
title: React Hook 学习记录
tags: React
categories: MVVM
date: 2020-10-21
index_img: /img/react_2.jpg
---

## 常用 Hook

> 写在上面，useCallback useMemo 的区别？

    1. useCallback 一般用于减少子组件、嵌套组件的渲染次数。
    2. useMemo 一般用于当前组件，缓存某些计算量大的函数，避免额外的、无关的 state 对该函数产生影响。

### useCallback
接受两个参数：
- 回调函数：仅仅是一个函数，将我们要执行的逻辑放到回调函数里。
- 依赖项：需要依赖的参数，没有就是一个空数组 []。
- 返回值：返回一个 memoized 回调函数。在依赖参数不变的情况下，返回的回调函数是同一个引用地址。一旦参数改变，则 useCallback 会自动返回一个新的函数（引用地址改变)。

#### 传统 class 传递一个函数

```
class Index extends React.Component{    
  state = {
    num: 1
  }  
  handleChangeNum = () => {
    this.setState(prev => ({
        num: prev.num + 1
    }))
  }
  render() {
    return(
        <div>
            <button onClick={this.handleChangeNum}>click</button>
           
            // 不推荐的写法。handleClick 通过匿名箭头函数创建，所以当 state 中的 num 改变时，会导致 Children 再次重新渲染。
            // 即使 Children 中做了 PureComponent 浅比较，因为箭头函数每次的引用地址都不一样。
            <Children handleClick={() => console.log('click')} /> 
           
            // class 中推荐写法，state 中 num 改变时，由于 handleTest 引用地址没变，则子组件不会重新渲染
            <Children handleClick={this.handleTest} /> 
        </div> 
    )    
  }   
}
```

#### useCallback 实现传递函数
通过 useCallback 缓存传递给子组件的函数，只有传递给 useCallback 的依赖项发生变化时，回调函数里的逻辑才会执行，即子组件才会渲染。

```
const ParentComponent = () => {
  const [count, setCount] = useState(0);
  const [draw, setDraw] = useState(0);
  
  const handleChildrenCallback = useCallback(() => {
    console.log('clicked ChildrenComponent');
  }, [draw]); // 只有当 draw 变化时，里面的回调函数才会执行

  const handleParent = () => {
    setCount(preCount => preCount + 1);
    
    if(count % 3 === 0) setDraw(prevDraw => prevDraw + 1); // 去触发 draw 改变
  };

  return (
    <div>
      <div onClick={handleParent}>ParentComponent --count =={count} </div>
      <ChildrenComponent handleChildren={handleChildrenCallback} />
    </div>
  );
};

// React.memo 类似 class 的 PureComponent。实现浅比较
const ChildrenComponent = React.memo(({ handleChildren }) => {
  console.log('ChildrenComponent rending'); // 可以发现只有当父组件 count % 3 === 0 时才会渲染
  return <div onClick={handleChildren}>ChildrenComponent </div>;
});
```

### useMemo
接受两个参数：
- 回调函数：仅仅是一个函数，将我们要执行的逻辑放到回调函数里。**需要有返回值**。
- 依赖项：需要依赖的参数，没有就是一个空数组 []。
- 返回值：返回一个 memoized **值**，如果依赖项变就会返回一个新的值，如果没有变就返回上一次的值。

#### 优化当前组件高开销的计算
可以理解将当前组件功能细化，不要 state 一改变就触发该组件中的所有函数，而是某个函数只针对于某个状态。

```
const ComputeComponent = () => {
  const [count, setCount] = useState(100);
  const [changeNum, setChangeNum] = useState(100);

  const computeExpensiveValue = (count) => {
    console.log('computeExpensiveValue 被执行');

    // 类似比较大计算
    const arr = new Array(count).fill(count);
    return arr.reduce((currentTotal, item) => {
      return currentTotal + item;
    }, 0);
  }

  const handleSetCount = () => {
    setCount(preCount => preCount * 2);
  };

  const handleChangeNum = () => {
    setChangeNum(preNum => preNum * 2);
  };

  // 不推荐写法  
  const computeValue = computeExpensiveValue(count); // 模拟 调用大的计算函数

  // useMemo 推荐写法，将 count 加入依赖，这样修改 changeNum 时就不会触发这个大的计算函数。
  const computeValueUseMemo = useMemo(() => computeExpensiveValue(count), [count]); // 因为该函数只与 count 这个状态有关

  return (
    <div>
      <div>{computeValue}</div>
      <div onClick={handleSetCount}>addCount {count} </div>
      <div onClick={handleChangeNum}> add changeNum {changeNum}</div>
    </div>
  );
};
```