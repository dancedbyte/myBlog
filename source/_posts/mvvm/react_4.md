---
title: React 源码分析
tags: React
categories: MVVM
date: 2020-11-2
index_img: /img/react_1.jpg
---

# React 整体架构
>   react 15 缺点？

    1. 在 16 以前如果执行一个长任务，主线程一直被占用，导致用户与页面失去交互，即页面失去响应，造成卡顿。
    2. 卡顿是因为 js 是单线程的，浏览器在同一时间只能做一件事，根据人肉眼能识别的频率可得出框架需要在 16ms 内完成三件事：响应用户输入、动画交互、渲染页面。
    3. Reconciler 和 Renderer 是交替工作的，如一个受控输入框组件，用户希望立刻看到更新，但这时有一个不在可视区域的更新导致用户输入的更新滞后，那么给用户的直观感受就是卡顿。

>   react 16 版本架构如何优化？

    1. 15 中 Reconciler 是递归处理 Virtual DOM 的。而 16 新的数据结构 Fiber。Virtual DOM 由之前的从上到下的树形结构，变化为多向链表的形式。
    2. 执行异步的调度任务会在宏任务（MessageChannel) 中执行，这样就保证了主线程是可以空出来的。
    3. Reconciler 和 Renderer 不再是交替工作，对每一个更新任务都做了优先级绑定，当多个任务同时执行时，可先执行优先级高的任务。新增 Scheduler 模块来完成任务优先级调度。

>   react 16 没有解决的问题？在 react 17 做了哪些优化？

    1. 16 中高优先级 cpu 任务和低优先级 IO 任务是比较矛盾的，cpu 任务需要进行大量计算是比较耗时的，但是 IO 任务很快就可以执行完，
       但是 IO 还必须得等着，这显然是不合理的。 
    2. 17 版本从指定一个优先级变成可以指定一个优先级区间。如高 cpu 和低 IO 就可以放到一起执行。

# JSX 与 React.createElement
我们在 render 方法中写的 jsx 都会通过 React.createElement 转化为虚拟 dom。

**createElement**
```js
const hasOwnProperty = Object.prototype.hasOwnProperty;
const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
};

function createElement(type, config, children) {
    let propName;
    let key = null;
    let ref = null;

    const props = {};
    
    if (config !== null) {
        if (hasValidRef(config)) {
            ref = config.ref;
        }
        if (hasValidKey(config)) {
            key = '' + config.key;
        }
    }

    // 过滤React保留的关键字
    for (propName in config) {
        if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
            props[propName] = config[propName];
        }
    }

    // 遍历children
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
        props.children = children;
    } else if (childrenLength > 1) {
        const childArray = Array(childrenLength);
        for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
        }
        props.children = childArray;
    }

    // 设置默认props
    if (type && type.defaultProps) {
        const defaultProps = type.defaultProps;
        for (propName in defaultProps) {
            if (props[propName] === undefined) {
                props[propName] = defaultProps[propName];
            }
        }
    }

    return ReactElement(type, key, ref, props); // 根据我们写的 jsx 转化为具有 type类型、key、props 属性的虚拟dom（js中的对象）。
}
```

**ReactElement**
```
const ReactElement = function (type, key, ref, props) {
    const element = {
        // 唯一地标识为 React Element，防止 XSS 攻击。
        // 如我们通过 dangerouslySetInnerHTML 来往 div 中插入一段 json。但是如果这段 json 被拦截并替换成一段 ReactElement 格式的代码（其实本质上是不会被替换掉的，因为 Symbol 是无法被 json 化的）
        ?typeof: Symbol.for('react.element'),

        type: type,
        key: key,
        ref: ref,
        props: props,
    }
    return element;
}
```

# 数据结构

## FiberRoot
每次通过 ReactDom.render 渲染一个应用都会初始化一个对应的 FiberRoot 对象作为应用的起点。
```js
type BaseFiberRootProperties = {
    // root节点，ReactDOM.render()的第二个参数 #app
    containerInfo: any,

    // 当前应用root节点对应的Fiber对象
    current: Fiber,

    // 当前更新对应的过期时间
    finishedExpirationTime: ExpirationTime,

    // 已经完成任务的FiberRoot对象，在commit(提交)阶段只会处理该值对应的任务
    finishedWork: Fiber | null,

    // 树中存在的最旧的未到期时间
    firstPendingTime: ExpirationTime,

    // 挂起任务中的下一个已知到期时间
    nextKnownPendingLevel: ExpirationTime,

    // 树中存在的最新的未到期时间
    lastPingedTime: ExpirationTime,

    // 最新的过期时间
    lastExpiredTime: ExpirationTime,

    // ...
};
```

## FiberNode
下图中每一个节点都可称为一个 fiberNode，它内部记录了真实 dom 节点、优先级、指针指向等。
```js
function FiberNode() {
    // FiberNode 对应组件的类型 Function / Class / HOST Component
    this.tag = tag;

    // 标志节点的唯⼀性。如项目中给遍历出来的节点加个 key 属性。
    this.key = key;
    this.elementType = null;

    // 对于 FunctionComponent，指函数本⾝，对于 ClassComponent，指class，对于HostComponent，指DOM节点tagName。
    this.type = null; // 便于 react 对不同类型的组件区别处理，减少耦合度

    // Fiber对应的真实DOM节点 <div></div>
    this.stateNode = null;

    // FiberNode ⽤于连接其他 FiberNode 节点，组成 FiberTree
    this.return = null; // 父
    this.child = null; // 子
    this.sibling = null; // 兄弟

    // 记录 本次更新如 setState 造成状态改变 的相关信息
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;
    this.dependencies = null;

    this.flags = NoFlags; // 17版本以前，这个字段叫 SideEffects。标志更新的类型：删除、新增、修改。在最后更新 dom 时会根据该字段来判断。
    this.subtreeFlags = NoFlags;
    this.deletions = null;

    // 调度优先级相关。16 及以前版本只是记录 expirationTime(过期时间)。17 版本之后是记录一个区间，代表有限的一组多个不同任务。
    this.lanes = NoLanes; // 优先级 31位‘车道’
    this.childLanes = NoLanes; // 子节点优先级

    // 指向对应的 workInProgress Fiber 节点（双缓冲技术，下面会将），以便进行 dom-diff 的比较或直接复用。
    this.alternate = null
}
```

# Scheduler 调度器
// React 借鉴了浏览器的requestIdleCallback接口，当浏览器有剩余时间时通知执行。

并且可以调度任务的优先级，高优先级任务优先进入 Reconciler。

## 优先级划分

>   优先级会随着时间推进发生变化，如优先级 C 慢慢会升级为 A。

>   大体优先级如下，react 内部会将每一个任务优先级表现为 31 位的二进制数。

1. 生命周期函数（同步执行）。
2. 受控的用户输入，与用户直接交互的，比如输入框等（同步执行）。
3. 交互事件如动画等，高优先级执行。
4. 如数据请求等低优先级执行。

<img src="/img/react_4_1.png" style="width: 300px" />

- 图上每一个节点可称为一个 fiberNode，有三个指针分别指向子节点、兄弟节点、父节点。所有的 fiberNode 组成一颗 fiberTree。
- 每次更新（即发起一批新的优先级的任务），都会从根节点向下遍历。fiberNode 与 fiberNode 之间通过链表来连接，以便改变指针指向、且方便中断。 
- 如span发起了⼀次优先级为C的更新，还没有更新完成，我们记为**第⼀次更新**。 
- 紧接着i am 发起来⼀次优先级为A的更新，记为**第⼆次更新**。优先级为A的更新会打断优先级为C的更新，**先执⾏第⼆次更新**。
- 再对KaSong 发起⼀个优先级为A的更新，**记为第三次更新**。由于第⼀次更新的优先级会随着时间的推进也会提升，如果这时第⼀次更新的优先级和第三次更新**⼀致了，就会⼀起执⾏**。 
- 否则，还是会先执⾏第三次更新，再执⾏第⼀次更新。但是**随着时间推进任何优先级的任务都会被执行掉**。 

## 流程分析

### Schedule Work
根据优先级区分同步任务和异步任务，同步任务⽴即同步执⾏，最快渲染出来。异步任务⾛ schedule 调度流程。但是最后不管同步更新还是异步更新都会执行 performSyncWorkOnRoot 方法。

```js
export function scheduleUpdateOnFiber(fiber: Fiber, lane: Lane, eventTime: number,) {
    // 获得当前更新的优先级
    const priorityLevel = getCurrentPriorityLevel();

    // 同步任务，⽴即更新
    if (lane === SyncLane) {
        if (
            // 里面的 if 是去判断执行上下文环境。
            // 处于 unbatchedUpdates， 且不在Renderer渲染阶段， 即 ReactDOM.render(<App />, document.getElementById('root'))
            (executionContext & LegacyUnbatchedContext) !== NoContext &&
            // CommitContext: 表⽰渲染到⻚⾯的那个逻辑
            // RenderContext: 表示找出变化组件的那个逻辑
            (executionContext & (RenderContext | CommitContext)) === NoContext
        ) {
            schedulePendingInteractions(root, lane);

            // 立即执行更新
            performSyncWorkOnRoot(root);
        } else {
            // 包含异步调度逻辑，和中断逻辑
            ensureRootIsScheduled(root, eventTime);
        }
    } else {
        ensureRootIsScheduled(root, eventTime);
        
        schedulePendingInteractions(root, lane);
    }
    mostRecentlyUpdatedRoot = root;
}
```

### EnsureRootIsScheduled
该函数中，有一个**优化机制**。就是去判断上一次的任务是否可以复用、判断此次和上次任务的优先级是否一致（如setState、输入框的连续输入）。以达到复用的目的。

```js
function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
    const existingCallbackNode = root.callbackNode; // 检查有没有正在执行中的任务。// TODO 标识 1

    // 检查是否存在现有任务。 也许可以重⽤它。
    // 如 A 更新调用 ensureRootIsScheduled，则 root.callbackNode 会被赋值。下次轮到 B 更新了他去检查发现 root.callbackNode 已经存在，则进入 if 看能不能复用这个任务。
    if (existingCallbackNode !== null) {
        const existingCallbackPriority = root.callbackPriority;

        // 如果优先级没有改变。那么可以重⽤现有任务。⽐如input连续的输⼊、连续 setState。这些操作优先级相同，可以重用之前的任务。
        // 由于获取更新是从root开始，往下找到在这个优先级内的所有update.
        if (existingCallbackPriority === newCallbackPriority) return; // 不需要重新发起⼀个调度，⽤之前那个就可以了。直接 return 掉。

        // 如果任务优先级变了，先cancel掉，后续重新发起⼀个，因为可能要进行任务优先级的合并（变成一个优先级区间）。
        cancelCallback(existingCallbackNode)
    }

    // 发起⼀个新callBack
    let newCallbackNode;

    // 将任务推入Scheduler中的调度队列，并设置其优先级与任务过期时间
    newCallbackNode = scheduleCallback(
        schedulerPriorityLevel,
        performConcurrentWorkOnRoot.bind(null, root)
    );

    root.callbackPriority = newCallbackPriority; // 相当于是上一次任务的优先级。记录下，便于下一次比较
    
    // 更新 Fiber 的当前回调节点
    root.callbackNode = newCallbackNode; // 对 callbackNode 进行赋值，下次进入到 ensureRootIsScheduled 时则有已经正在运行的任务。如上标识 1
}
```

### unstable_scheduleCallback
在 unstable_scheduleCallback 函数内部，先通过计算得到执行时间 expirationTime，expirationTime = currentTime(当前时间) + timeout (不同优先级的延迟时间，延迟越小则越先执行，对应的优先级越大）。

并进行延时任务（timeQueue）和及时任务（taskQueue）的区分，以及判断何时将 timeQueue 中的任务推入到 taskQueue 中。

>   既然通过 expirationTime 来区分任务的过期时间，expirationTime 越小说明越该执行了。所以 react 在内部用数组模拟小顶堆来实现最小优先队列。

```js
function unstable_scheduleCallback() {
    // 获取 startTime, 根据优先级的不同分别加上不同的间隔时间，构成expirationTime；expirationTime越接近真实的时间，优先级越⾼
    var currentTime = getCurrentTime();

    // 根据startTime 是否⼤于当前的currentTime，将任务分为了及时任务和延时任务。延时任务还不会⽴即执⾏，它会在currentTime接近startTime的时候，才会执⾏。
    var startTime;
    if (typeof options === 'object' && options !== null) {
        var delay = options.delay; // 函数接收到的延迟时间（可选）

        if (typeof delay === 'number' && delay > 0) {
            startTime = currentTime + delay;
        } else {
            startTime = currentTime;
        }
    } else {
        startTime = currentTime;
    }

    var timeout;
    // 根据优先级增加不同的时间间隔
    switch (priorityLevel) {
        case ImmediatePriority:
            timeout = IMMEDIATE_PRIORITY_TIMEOUT; // 立即执行
            break;
        case UserBlockingPriority:
            timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
            break;
        case IdlePriority:
            timeout = IDLE_PRIORITY_TIMEOUT;
            break;
        case LowPriority:
            timeout = LOW_PRIORITY_TIMEOUT;
            break;
        default:
            timeout = NORMAL_PRIORITY_TIMEOUT;
            break;
    }

    // 计算出执行时间。
    var expirationTime = startTime + timeout; // 这个执行时间算出来后是固定的，但是 currentTime 是一直在增加的，所以当 expirationTime < currentTime 时该任务就会执行了。

    // 定义处理后的新任务
    var newTask = {
        priorityLevel,
        startTime,
        expirationTime,
    };

    // if 表示可以 延迟执行
    if (startTime > currentTime) {
        push(timerQueue, newTask); // 推入到 延时队列中

        // 该函数内部实现了一个setTimeout计时器。当 startTime - currentTime 时间到了，调用 handleTimeout，主要是把 timeQueue 中的任务添加到 taskQueue中。如流程图中所画。
        requestHostTimeout(handleTimeout, startTime - currentTime);
    } else {
        push(taskQueue, newTask); // 及时任务 立即执行

        if (!isHostCallbackScheduled && !isPerformingWork) {
            isHostCallbackScheduled = true;

            // 调度及时任务。如流程图中所画。
            requestHostCallback(flushWork); // flushWork的作用是刷新调度队列，并执行调度任务
        }
    }
    return newTask;
}
```

### requestHostCallback
及时任务立即执⾏，但是为了不阻塞⻚⾯的交互，因此在宏任务中执行。

通过 MessageChannel 创建宏任务，主要考虑 MessageChannel 的兼容性、并允许通道间互相通信。

```js
function requestHostCallback(callback) {
    // 在 MessageChannel 宏任务⾥执⾏真正的调度逻辑，可以保证任务与任务之间不是连续执⾏的，这样就不会阻塞主线程、不会阻塞页面交互。
    const channel = new MessageChannel(); // MessageChannel 有两个消息通道

    channel.port1.onmessage = performWorkUntilDeadline;

    scheduledHostCallback = callback; // 宏任务具体执行的回调函数

    if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;

        channel.port2.postMessage(null); // 在宏任务中调到 performWorkUntilDeadline
    }
}
```

### advanceTimers
延时任务需要等到 currentTime >= expirationTime 的时候才会执⾏。**每次调度及时任务的时候，都会去判断延时任务的执⾏时间是否到了**，如果判断为true，则通过 advanceTimers 添加到及时任务中。

```js
function advanceTimers(currentTime) {
    let timer = peek(timerQueue); // 取出延时队列中的任务

    while (timer !== null) {
        if (timer.callback === null) {
            pop(timerQueue);
        } else if (timer.startTime <= currentTime) {
            pop(timerQueue); // 先弹出

            timer.sortIndex = timer.expirationTime;

            // 把timerQueue中任务的添加到taskQueue中去
            push(taskQueue, timer); // 再push

            if (enableProfiling) {
                markTaskStart(timer, currentTime);
                timer.isQueued = true;
            }
        } else {
            return;
        }
        timer = peek(timerQueue); // 在 while 循环内，每次将 timer 指向下一个任务
    }
}
```

>   简述异步调度步骤，假如有三次任务更新。

```
(1) 第⼀次任务更新调⽤ unstable_scheduleCallback

    假如是延时任务，则把任务放在 timeQueue 不会⽴即执⾏，开始等待。

(2) 第二次任务更新调⽤ unstable_scheduleCallback

    ① 假如是立即执行任务，则把任务放在 TaskQuene 中。
    ② 在 requestHostCallback 中注册宏任务，执⾏new MessageChannel() 的 port.postMessage。
    ③ 如果主线程还有任务，那就还不会到 performWorkUntilDeadline

(3) 第三次任务更新调⽤ unstable_scheduleCallback

    ① 假如还是立即执行任务，则把任务放在 TaskQuene 中。
    ② 在 requestHostCallback 中注册宏任务，执⾏new MessageChannel() 的 port.postMessage。
    ③ 这时主线程没有任务了，则执行微任务列表。
    ④ 然后执⾏宏任务列表（有两个，分别是第二次和第三次注册的）。我们知道宏任务是一个一个执行的。
    ⑤ 所以先执行第⼆次调⽤发起的 performWorkUntilDeadline， performWorkUntilDeadline 去取得TaskQuene中的任务，发起 PerformanceSyncWorkOnRoot。同时判断 TimeQueue 中是否有到期的任务，如果有就加到 TaskQuene 来。
    ⑥ 第一个宏任务执行完了则回头继续看主线程，然后是微任务，接着是下一个宏任务（如第三次任务更新）。

(4) 异步更新 最终都会执行 performSyncWorkOnRoot 方法。
```

### Scheduler 流程总结
1. unstable_scheduleCallback创建任务，如果任务是延迟的则推入延迟队列timerQueue，否则推入任务队列taskQueue。

2. 如果创建的任务是延迟任务，则调用requestHostTimeout方法使用setTimeout来 **递归检测任务是否过期**。否则直接发起任务调度requestHostCallback。

3. requestHostCallback通过MessageChannel的port2发送消息给port1，具体的处理函数为performWorkUntilDeadline。

4. performWorkUntilDeadline会计算此次调度的deadline，同时使用 消息循环 来递归执行任务。

5. 任务具体处理是由 wookLoop 执行。其将任务从任务队列taskQueue堆顶依次取出执行。如果任务队列清空，则**调用requestHostTimeout开启递归检测**。

# Reconciler 协调器
当 Scheduler 将任务交给 Reconciler 后，Reconciler只是会为变化的 Virtual DOM 打上代表 增/删/更新 的标记，当所有组件都完成 Reconciler 的工作，**等到下一个 Renderer(commit) 阶段才负责渲染**。

‘标记’在源码中表示如下：
```js
export const Placement = /*    新增              */ 0b0000000000010;
export const Update = /*       更新              */ 0b0000000000100;
export const PlacementAndUpdate = /* 新增和更新   */ 0b0000000000110;
export const Deletion = /*      删除             */ 0b0000000001000;
```

假如有高优先级的任务来了，Reconciler 阶段也是**可以被中断的**。

## 双缓存结构

<img src="/img/react_4_2.png" style="width: 250px" />

react 每发生一次变化，如 setState，都会从根节点向下遍历，找到变化的节点。构建完成会将 fiberNode 通过链表的形式会连接成一颗 fiberTree。

其实在 react 内部会**有两颗 filberTree**（currentFiberTree 和 workInProgressFiberTree)，被称为双缓存结构。

“当前屏幕上显⽰”的 Fiber 树称为 currentFiberTree，正在内存中构建的 Fiber 树 称为 workInProgressFiberTree。每颗树中的 fiberNode **通过 alternate 属性连接**。

第一次构建是没有 currentFiberTree 的，那么就先逐级创建生成 WorkInProgressFiberTree（他会作为第二次构建的 currentFiberTree）。第二次构建发现已经有 currentFiberTree 了，则会新构建一颗 WorkInProgressFiberTree，WorkInProgressFiberTree 上的每个节点可以通过 alternate 属性与 currentFiberTree 上的节点进行比较，以及看是否可以复用。  

>   总结：当 WorkInProgressFiberTree 构建完毕，就得到了新的 fiberTree。那么“喜新厌旧”的就将 current 指针指向了 WorkInProgressFiberTree（当然他会作为下一次更新的 currentFiberTree），然后丢弃掉这次的 currentFiberTree。

>   优点：

    ① 可以很快的找到之前对应的节点，以便做 dom-diff 或看看是否可以直接拿来复用。
    ② 节省了内存分配、GC 的时间开销。

## 构建 fiberTree
整个 fiberTree 构建过程是处于 beginWork 和 completeUnitOfWork 双重嵌套循环中的。

**如下 dom 结构**
```
return (
    <div>
        i am
        <span>Draw</span>
    </div>
)
```

### workLoopSync

<img src="/img/react_4_3.jpg" style="width: 300px" />

构建 fiberTree 的入口大致是从 workLoopSync 函数开始，从优先级最高的 fiberRootNode 开始向下递归。

有两个重要的函数：beginWork（向下遍历） 和 completeUnitOfWork（向上传递）。

**beginWork**: 通过**向下移动指针生成**子节点，他只处理子节点。当发现没有子节点了就该 completeUnitOfWork 工作了。

**completeUnitOfWork**: 先去检查有没有兄弟节点，如果有兄弟节点则指向该兄弟节点，如果该兄弟节点还有子节点，则让 beginWork 继续处理子节点，如图中处理到 Draw 发现没有兄弟节点了，则**向上 return 回到**父节点，继续执行父节点的 completeUnitOfWork。这一过程反复循环直到回到顶级节点。

```js
function workLoopSync() {
    // workInProgress 代表当前正在处理的节点
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress); // 第一层循环
    }
}

function performUnitOfWork(unitOfWork: Fiber) {
    const current = unitOfWork.alternate;

    // 会创建⼀个FiberNode，赋值给 workInProgress.child 并返回 workInProgress.child。注意，此处 FiberNode.sibling 兄弟节点还没处理
    // 所以此时 next 代表 workInProgress.child
    next = beginWork(current, unitOfWork, subtreeRenderLanes);

    unitOfWork.memoizedProps = unitOfWork.pendingProps;

    // if => 没有子节点了
    if (next === null) {
        completeUnitOfWork(unitOfWork); // 这个函数下面会说，指的是将指针指向兄弟节点。因为没有子节点了，就要去看看有没有兄弟节点
    } else {
        workInProgress = next; // 交接指针 指向自己的子节点。确保外层 while 递归执行。
    }

    ReactCurrentOwner.current = null
}
```

### beginWork

在非首次渲染时，判断 Fiber 节点是否可以复⽤。并通过 didReceiveUpdate 打上是否可以复用的标记。

根据不同的Tag（是 class Component 还是 function component），⽣成不同的Fiber节点并调⽤ reconcileChildren 进行节点的 dom-diff 比较。

```js
function beginWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
): Fiber | null {
    const updateLanes = workInProgress.lanes;
    let didReceiveUpdate; // tag 标记，判断节点是否可以复用

    // 不是初次渲染
    if (current !== null) {
        const oldProps = current.memoizedProps;
        const newProps = workInProgress.pendingProps;

        // props 变化时
        if (
            oldProps !== newProps ||
            hasLegacyContextChanged()
        ) {
            didReceiveUpdate = true;
        } else if (!includesSomeLane(renderLanes, updateLanes)) { // 属于同一优先级
            didReceiveUpdate = false; // 为 false 表示不需要更新，可以复用上次的逻辑

            // 一般 bailout 打头的方法，表示可以直接复用的逻辑。所以直接 return 掉了
            return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
        } else {
            if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
                didReceiveUpdate = true;
            } else {
                didReceiveUpdate = false;
            }
        }
    } else {
        didReceiveUpdate = false;
    }

    workInProgress.lanes = NoLanes;

    // 根据不同 tag 生成不同的节点类型，是 class 还是 function 等
    switch (workInProgress.tag) {
        case IndeterminateComponent: {
            return {
                // ....
            }
        }
        case LazyComponent: {
            return {
                // ....
            }
        }
        case FunctionComponent: {
            const Component = workInProgress.type;
            const unresolvedProps = workInProgress.pendingProps;
            const resolvedProps =
                workInProgress.elementType === Component
                    ? unresolvedProps
                    : resolveDefaultProps(Component, unresolvedProps);
            // 注入 hooks 上下文，将 function 函数体传入 reconcileChildren。
            // updateFunctionComponent 函数内部会调用 reconcileChildren，得到子节点。在里面执行 dom-diff 等
            return updateFunctionComponent(
                current,
                workInProgress,
                Component,
                resolvedProps,
                renderLanes,
            );
        }
        case ClassComponent: {
            const Component = workInProgress.type;
            const unresolvedProps = workInProgress.pendingProps;
            const resolvedProps =
                workInProgress.elementType === Component
                    ? unresolvedProps
                    : resolveDefaultProps(Component, unresolvedProps);
            // updateClassComponent 函数内部会执行 render 等生命周期，并调用 reconcileChildren，在里面执行 dom-diff 等
            return updateClassComponent(
                current,
                workInProgress,
                Component,
                resolvedProps,
                renderLanes,
            );
        }
        // ReactDOM.render()。第一次会走到该 case
        case HostRoot:
            return updateHostRoot(current, workInProgress, renderLanes);
    }
}
```

#### reconcileChildren

通过 current 是否指向 null 来区分是 mount 初始挂载阶段还是 update 更新阶段。如果 mount 则直接创建节点，否则做 dom-diff 的相关操作。

将新创建的 fiber 节点赋值给 workInProgress.child 并继续下一次循环。

```js
export function reconcileChildren(
    current: Fiber | null,
    workInProgress: Fiber,
    nextChildren: any,
    renderLanes: Lanes,
) {
    // 第一次渲染 mount 阶段。直接创建 fiberNode 节点
    if (current === null) {
        workInProgress.child = mountChildFibers(
            workInProgress,
            null,
            nextChildren,
            renderLanes,
        );
    } else {
        // 更新节点。在 dom-diff 后更新 fiberNode 节点。
        // 分为 单节点diff 和 多节点diff。diff 后一定会返回一个新的节点给到 workInProgress.child
        workInProgress.child = reconcileChildFibers(
            workInProgress,
            current.child,
            nextChildren,
            renderLanes,
        );
    }
}
```

#### reconcileChildFibers

该函数会判断变更的类型是什么？⽐如有新增，删除，更新等类型（在源码中也是以二进制的形式存在）。并将该类型赋值给 flags 字段，该字段会在 commit 阶段做相关的 dom 操作。

还会做 dom-diff 的比较，分为单节点 diff 和多节点 diff。如果是对象或字符串则进入单节点 diff。**数组则进入多节点 diff**。

>   react diff 的原则：

    ① 只会对同级节点进行比较。因为有两个 fiberTree，且每个节点通过 alternate 属性相关联，所以可以很快的找到并对比同级节点。
    ② 节点变化直接删除然后重建。
    ③ 若存在 key 值则比较 key 值一样的节点。

>   因为 reconcileChildFibers 函数还属于 Reconciler 阶段，是允许打断的，但是 dom 渲染相关操作是不允许打断的，所以这里只能先做上标记。

```js
function reconcileChildFibers() {
    /*
        ....
        ....
        dom-diff 的比较。见下文。
    */

    function placeSingleChild(newFiber: Fiber): Fiber {
        if (shouldTrackSideEffects && newFiber.alternate === null) {
            // flags 在源码中的表示为二进制
            newFiber.flags = Placement; // 新增（Placement）| 更新（Update）| 删除（Deletion）
        }
    
        return newFiber
    }
}
```

#### 单节点 diff
此次更新和上次比较，是否存在对应 dom 节点。如存在对应 dom 节点时：

    key 一致，类型一致，调用 userFiber 返回复用的 fiber 节点。
    key 一致，类型不一致（如div->p），将该 fiber 及子节点标记为：删除。
    key 不一致，标记为：删除。

不存在对应节点：则创建新节点。

```js
function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
    lanes: Lanes,
): Fiber {
    const key = element.key;
    let child = currentFirstChild;

    // 当有对应节点时
    while (child !== null) {
        // 如果 key 相同
        if (child.key === key) {
            switch (child.tag) {
                default: {
                    // 节点类型也一致，可以复用
                    if (
                        child.elementType === element.type ||
                        isCompatibleFamilyForHotReloading(child, element)
                    ) {
                        deleteRemainingChildren(returnFiber, child.sibling);
                        const existing = useFiber(child, element.props); // 调用 useFiber 完成复用

                        existing.ref = coerceRef(returnFiber, child, element);
                        existing.return = returnFiber;

                        return existing;
                    }
                    break; // type 不同则跳出循环
                }
            }

            // 节点类型不一致才会到这里，标记为删除
            deleteRemainingChildren(returnFiber, child);
            break;
        } else {
            deleteChild(returnFiber, child); // key不同，将该fiber标记为删除
        }

        child = child.sibling;
    }

    // 不存在对应节点，则创建新节点
    const created = createFiberFromElement(element, returnFiber.mode, lanes);

    created.ref = coerceRef(returnFiber, currentFirstChild, element);
    created.return = returnFiber;
    return created;
}
```

#### 多节点 diff
数组才会进入多节点 diff。因为数组会涉及到下标的变化，但是有时候下标变化并不需要将所有节点全部替换（比如新push一个节点或删除一个节点）。有些节点只是下标发生变化但是内容是没变的，**所以多节点 diff 里对这些可能情况作了优化**。

1. 首先对比**相同索引对象**的 key 是否相等。如果相等返回该对象，否则返回null。

2. 相同索引的对象 key 值不等时，先不⽤对⽐下去了，节点不能复⽤，**则跳出，注意这里只是跳出，下面进行进一步判断**。

    ① 判断节点是否存在移动，存在则返回新位置，根据新位置确定新节点的插入位置。标记为该节点是可复用的。
    ② 遍历完所有新的子节点，如果新数组长度⼩于⽼数组的长度，即⽼数组后⾯有剩余的，所以要将老数组中剩余的标记为删除。
    ③ 如果新数组长度大于⽼数组的长度，且老的节点已经被复用完了，对剩下的新节点进行操作，批量插入老节点末端。
    
3. 创建⼀个 existingChildren 代表所有剩余没有匹配到的节点，然后新数组根据每一项的 key 从这个 map ⾥⾯查找，如果有则复⽤，没有则标记为新增。

>   react 的多节点 diff 无法使用双指针（从头尾向中间同时遍历以提高效率）进行优化。是因为：
    
    虽然本次更新的JSX对象 newChildren 为数组形式，但是和 newChildren 中每个组件进行比较的是当前 fiberNode。
    
    同级的 FiberNode 是由 sibling 指针链接形成的单链表，即不支持双指针遍历。
    
    即 newChildren[0] 与 fiberNode 比较，newChildren[1] 与 fiberNode.sibling 比较。所以无法使用双指针优化。
    
### completeUnitOfWork
completeUnitOfWork 每次如果没有兄弟节点则 return 回到父节点，相当于是向上递归的。

在这个阶段就已经创建 dom 了。**但是这里只是创建不去渲染**，而是把对应的 dom 赋值给 stateNode 字段存起来，在 commit 阶段再去调用。

将子节点的 flags(增加、删除、更新...) 附加到父节点的 flags 链上，以在 commit 阶段去调用。

```js
function completeUnitOfWork(unitOfWork: Fiber): void {
    let completedWork = unitOfWork;

    do {
        const current = completedWork.alternate;
        const returnFiber = completedWork.return; // 指代父节点

        if ((completedWork.flags & Incomplete) === NoFlags) {
            setCurrentDebugFiberInDEV(completedWork);
            let next;

            next = completeWork(current, completedWork, subtreeRenderLanes); // completeWork 函数内部完成创建 dom, 修改 dom 的操作

            // 将子节点的 flag 副作用添加到父节点的 flag 链中。
            // 这样做的好处是：当向上最后递归到根节点时，根节点的副作用链中包含所有子节点对应的操作（添加、删除、更新等）。
            if (
                returnFiber !== null &&
                (returnFiber.flags & Incomplete) === NoFlags
            ) {
                if (returnFiber.firstEffect === null) {
                    returnFiber.firstEffect = completedWork.firstEffect;
                }
                if (completedWork.lastEffect !== null) {
                    if (returnFiber.lastEffect !== null) {
                        returnFiber.lastEffect.nextEffect = completedWork.firstEffect; // 将当前节点的 flags 添加到父节点的 flags 链中。层层向上传递。
                    }
                    returnFiber.lastEffect = completedWork.lastEffect;
                }
            }
        }

        // 如果有兄弟节点，则赋值给 workInProgress 并 return 掉。然后继续执行 beginWork
        const siblingFiber = completedWork.sibling;
        if (siblingFiber !== null) {
            workInProgress = siblingFiber;
            return;
        }

        // 如果没有兄弟节点了，则向上回到父节点。
        completedWork = returnFiber;
        workInProgress = completedWork;
    } while (completedWork !== null);
}

function completeWork() {
    // 创建 DOM 节点
    const instance = createInstance(
        type,
        newProps,
        rootContainerInstance,
        currentHostContext,
        workInProgress,
    );

    // 将子孙 DOM 节点插入刚生成的 DOM 节点中
    appendAllChildren(instance, workInProgress, false, false);

    // 将 DOM 节点赋值给 stateNode 留到 commit 阶段用
    workInProgress.stateNode = instance;

    if (
        finalizeInitialChildren(
            instance,
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
        )
    ) {
        markUpdate(workInProgress);
    }
}
```
