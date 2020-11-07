---
title: 从 零 实现 Redux
tags: Redux
categories: MVVM
date: 2020-11-04
index_img: /img/react_5_1.png
---

## Redux 特点
- 统一的状态管理，一个应用中只有一个仓库（store）
- store 中的 state 数据不能直接修改，修改只能通过派发器（dispatch）派发一个动作（action）。
- 修改 state 的逻辑封装在 reducer 中，reducer 接受旧的 state 和 action，返回新的 state 给到 view。**reducer是纯函数**。
- middleware 中间件用来处理副作用，他可以**增强我们的 dispatch**，将中间件一层层包裹到 dispatch 上。比如包装错误捕获机制、异步处理机制。

<img src="/img/react_5_1.png" style="width: 400px; margin-bottom: 15px" />

1. View 层也就是我们写的组件通过 dispatch 触发一个 action。如果需要处理脏的异步操作，就需要用 applyMiddleware 包装我们可能用到的 middleware。
2. reducer 接受派发过来的 action 和旧的 state，返回一个新的 state。
3. view 层接收到新的 state。更新组件、渲染页面。

## Redux与函数式编程
redux 是比较经典的函数式编程的实现。如一个容器 Container 中含有 value 和 map 两个属性，而修改 value 的方法只有通过 map 才可实现，再将修改后的新的 value 放回 Container 中。

### 对应关系

- store -> container 容器
- currentState -> 的 _value
- action -> f，map 中接收的 f 函数
- currentReducer -> map，接收函数作用于 _value
- middlerware -> IO函子，处理脏操作

### 概述

1. 创建 store 其实是创建了一个 container 容器。

2. currentState 对应容器中的 _value，而想把容器变强大，变成一个函子，就需要有一个 map 方法（即具有一个 map 方法并且 map 可以接收变形关系 f）。

3. 而 redux 中就有个 currentReducer 的作用类似于 map，接收 action，即我们所说的变形关系 f。可以改变当前的 currentState，也就是函数式编程中的 _value。

4. 因为所有的异步操作是脏的，可以通过 IO 函子去解决，IO 函子即 redux 里的 middleware，middleware 可以自动地向下 next，next 实际上是一个 monad 函子。最后通过函数柯里化、函数组合才完成 middleware 的处理及合并。

## 开始编写
Redux 采用函数式编程的写法，**实现了单向数据流**，同时封装了一个订阅者模式，在数据改动时，由数据仓库主动给订阅者发布消息。

### 项目结构

<img src="/img/react_5_2.png" style="width: 350px; margin-bottom: 10px" />

1. 入口文件：index.html
2. actions：定义所触发的方法，需要返回与 reducer 对应的 type 及最新的 state 数据。
3. middlewares: 为 redux 提供更加丰富的功能。通过中间件机制包装 dispatch，可以处理一些异步操作和错误捕获等。
4. reducers：接收 state 数据及对应的 action。返回最新的 state 数据。
5. redux：核心文件，包含合并 reducer、添加中间件、给 dispatch 绑定 action、创建 store、函数组合等文件。

### 入口文件
引入核心文件，并可通过触发 action 来更新 store 中数据。

```html
<!--index.html-->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>手写 Redux 🚀</title>
</head>
<body>
<script type="module">
    // 引入 redux 核心模块
    import {
        createStore,
        combineReducers,
        applyMiddleware,
        bindActionCreators,
    } from './redux/index.js';

    // reducers
    import visible from './reducers/visible.js';
    import message from './reducers/message.js';

    // middleware
    import exceptionMiddleware from './middlewares/exceptionMiddleware.js';
    import loggerMiddleware from './middlewares/loggerMiddleware.js';

    // actions
    import {changeToShow} from './actions/visible.js';
    import {changeInfo} from './actions/message.js';

    // 合并所有 reducer
    const reducer = combineReducers({
        visible,
        message,
    });

    // 经过中间件处理 重写之后的 dispatch
    const rewriteDispatcher = applyMiddleware(
        exceptionMiddleware,
        loggerMiddleware
    );

    // 创建 store 容器。传入参数：合并后的所有reducer、初始state、经过中间件处理后的dispatch
    const store = createStore(reducer, {}, rewriteDispatcher);

    // 订阅所需数据
    store.subscribe(() => {
        const state = store.getState();

        console.log(`🌺 ${state.message.info}`);
    });

    // 将 dispatch 与 action 绑定。在调用时只需 actions.funcName 即可
    const actions = bindActionCreators({
            changeToShow,
            changeInfo
        },
        store.dispatch
    );
    actions.changeToShow();
    actions.changeInfo();
</script>
</body>
</html>
```

### redux

#### index.js
集合 redux 下的文件，引用 redux 时只需引入该文件即可。
```js
import createStore from './createStore.js';
import combineReducers from './combineReducers.js';
import applyMiddleware from './applyMiddleware.js';
import bindActionCreators from './bindActionCreators.js';

export { createStore, combineReducers, applyMiddleware, bindActionCreators };
```

#### createStore.js
redux 的主文件，创建了一个 store 容器，实现了发布订阅模式，当 state 数据改变时能及时通知订阅者。
```js
export default function createStore(
    reducer,
    initState,
    rewritecreateStoreFunc, // 经过中间件处理后的 dispatch
) {
    if (rewritecreateStoreFunc) {
        const newCreateStore = rewritecreateStoreFunc(createStore); // 重写 store 中的 dispatch 方法来创建新的 store，

        return newCreateStore(reducer, initState); // 做一层拦截。具体实现可看 applyMiddleware.js 文件
    }
    let state = initState;
    let listeners = [];

    // 订阅
    function subscribe(listener) {
        listeners.push(listener);
    }

    // 取消订阅
    function unsubscribe(listener) {
        const index = listeners.indexOf(listener);

        listeners.splice(index, 1);
    }

    function getState() {
        return state;
    }

    function dispatch(action) {
        state = reducer(state, action); // 每次 dispatch 计算出当前最新的 state

        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];

            listener();
        }
    }

    // 替换 store 中当前计算 state 的 reducer
    function replaceReducer(nextReducer) {
        reducer = nextReducer;

        dispatch({type: Symbol()}); // 重写完 reducer 后手动触发一下 dispatch。以保证入口文件或组件可以拿到最新的数据。
    }

    dispatch({type: Symbol()}); // 手动触发 dispatch。因为入口文件或组件可能不会去主动调用 action，但是他还是想得到 state 中的数据。

    return {
        subscribe,
        dispatch,
        replaceReducer,
        getState,
    };
}
```

#### applyMiddleware
通过劫持旧的 store，并依次传给中间件，返回中间件链。有了链就需要借助函数组合将链“展平”，并给每个中间件传入旧的 dispatch 去包装。

<img src="/img/react_5_3.png" style="width: 400px; margin-bottom: 10px" />

```js
import compose from './compose.js';

const applyMiddleware = function (...middlewares) {
    return function (oldCreateStore) {
        return function (reducer, initState) {
            const store = oldCreateStore(reducer, initState); // 先创建原有 store
            const chain = middlewares.map((middleware) => middleware(store)); // 将原有 store 传给中间件去执行

            const dispatch = compose(...chain)(store.dispatch); // 返回新的包装好的 dispatch

            return {
                ...store,
                dispatch,
            };
        };
    };
};

export default applyMiddleware;
```

#### compose.js
函数组合为了解决 中间件 middleware 的深度柯里化的问题
```js
// funcs 是传入的所有的中间件。
export default function compose(...funcs) {
    if (funcs.length === 0) {
        return (arg) => arg; // 如果没有中间件，直接返回原始的 dispatch
    }

    if (funcs.length === 1) {
        return funcs[0];
    }

    return funcs.reduce((a, b) => (...args) => a(b(...args))); // 这里 args 指的是传入的旧的 dispatch
}
```

#### combineReducers
合并所有传入的 reducer 并执行每一个 reducer，返回最新的 state。
```js
export default function combineReducers(reducers) {
    const reducerKeys = Object.keys(reducers);

    return function combination(state = {}, action) {
        const nextState = {};

        reducerKeys.forEach(key => {
            const reducer = reducers[key];
            const preStateForKey = state[key]; // 拿到现有的（旧的）state

            nextState[key] = reducer(preStateForKey, action); // 通过 reducer 处理拿到最新的 state
        });

        return nextState; // 返回最新的 state
    };
}
```

#### bindActionCreators
简化操作，将 action 与 dispatch 绑定。当调用 action 时自动去 dispatch 派发。
```js
function boundActionCreator(actionCreator, dispatch) {
    return function () {
        return dispatch(actionCreator.apply(this, arguments)); // 调用包装后的方法时，一般用 call/apply 进行调用，避免 this 指向问题。
    };
}

export default function bindActionCreators(actionCreators, dispatch) {
    const boundActionCreators = {};
    const keys = Object.keys(actionCreators);

    keys.forEach(key => {
        if (typeof actionCreators[key] === 'function') {
            boundActionCreators[key] = boundActionCreator(actionCreators[key], dispatch); // 传入对应 action 及 dispatch
        }
    });

    return boundActionCreators; // 返回
}
```

### actions
定义可触发的方法，需要返回与 reducer 对应的 type 及最新的 state 数据。
```js
// actions/message.js

function changeInfo(newInfo = 'Draw Every day! 🏮🏮🏮🏮🏮') {
    /*
       或者可对 newInfo 做进一步处理，他将作为最新的 state 数据。     
    */
    return {
        type: 'CHANGE_INFO',
        info: newInfo,
    };
}
export { changeInfo };
```

### middlewares
可自定义中间件，通过包装 dispatch，丰富完善 redux 的功能。
```js
// loggerMiddleware.js

const loggerMiddleware = (store) => (next) => (action) => {
  console.log('prev state ②', store.getState());  
  
  try {
    next(action);
  } catch (e) {
    console.error('错误报告', e);
  }

  console.log('next state ③', store.getState());
};
export default loggerMiddleware;
```

```js
// exceptionMiddleware.js

// dispatch 最后才接收一个 action
const exceptionMiddleware = (store) => (next) => (action) => {
  console.log('prev state ①', store.getState()); // 之前的 state
  next(action);
  console.log('next state ④', store.getState()); // 经过 dispatch 处理后的 state
};
export default exceptionMiddleware;
```

```js
// 当通过 applyMiddleware 依次添加上面两个中间件时，执行顺序是从右往左的。
// 所以打印顺序如下：prev state ①、prev state ②、next state ③、next state ④
// 每个中间件会执行两次，叫作洋葱模型。

applyMiddleware(
    exceptionMiddleware,
    loggerMiddleware
);
```

### reducers
根据传入的 action。返回最新的 state 数据。
```js
// reducers/message.js

// 初始 state
let initState = {
    name: 'draw',
    info: 'Draw Every day!',
};
export default function infoReducer(state = initState, action) {
    switch (action.type) {
        case 'CHANGE_INFO':
            return {
                ...state,
                info: action.info,
            };
        default:
            return state;
    }
}
```

## 异步处理

## React-Redux
1. 我们一般会在项目应用的外层包括一层 Provider，它其实只是一个外层容器，原理是通过 react 的 Context API 来实现的。

   同时需要给 Provider 设置好 store，Provider 的作用就是通过配合 connect 来达到组件跨层级传递数据，那么整个项目都可以直接获取这个store。
    
2. connect 的作用是**连接 React 组件与 Redux 中的 store**，它在我们写的组件外包了一层。它接收 store 里面的 state 和 dispatch，经过 reducer 处理后以 props 属性形式传给我们的容器组件。

3. 一般 connect 常用的接受的参数有 2 个，如下：

    mapStateToProps: 将 store 里的 state(数据源) 绑定到指定组件的props中，即当前组件通过 props 可以获取到 store 中的 state 数据。
    
    mapDispatchToProps: 将 store 里的 action(操作数据的方法) 绑定到指定组件的 props 中。

TODO connect 内部如何实现
