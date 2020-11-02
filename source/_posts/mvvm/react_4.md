---
title: React 源码分析
tags: React
categories: MVVM
date: 2020-11-2
index_img: /img/react_1.jpg
---

## React 整体架构
>   react 15 缺点？

    1. 在 16 以前如果执行一个长任务，主线程一直被占用，导致用户与页面失去交互，即页面失去响应，造成卡顿。
    2. 卡顿是因为 js 是单线程的，浏览器在同一时间只能做一件事，根据人肉眼能识别的频率可得出框架需要在 16ms 内完成三件事：响应用户输入、动画交互、渲染页面、

>   react 16 版本架构如何优化？ TODO

    1. 执行异步的调度任务会在宏任务中执行，这样就保证了主线程是可以空出来的。
    2. 对每一个更新任务都做了优先级绑定，当多个任务同时执行时，可先执行优先级高的任务。新增 Scheduler 模块来完成任务优先级调度。

>   react 16 没有解决的问题？在 react 17 做了哪些优化？

    1. 16 中高优先级 cpu 任务和低优先级 IO 任务是比较矛盾的，cpu 任务需要进行大量计算是比较耗时的，但是 IO 任务很快就可以执行完，
       但是 IO 还必须得等着，这显然是不合理的。 
    2. 17 版本从指定一个优先级变成可以指定一个优先级区间。如高 cpu 和低 IO 就可以放到一起执行。

## Scheduler 调度器
调度任务的优先级，高优先级任务优先进入 Reconciler。

### 优先级划分

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

### FiberNode 代码分析
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

    // 指向对应的 workInProgress Fiber 节点（双缓冲技术，下面会将），用于节点间直接进行比较。
    this.alternate = null
}
```

### Scheduler 流程分析
1. 根据优先级区分同步任务和异步任务，同步任务⽴即同步执⾏，最快渲染出来。异步任务⾛ schedule 调度流程。

    其中在处理任务优先级的函数中，有一个**优化机制**。就是去判断上一次的任务是否可以复用、判断此次和上次任务的优先级是否改变（如setState）。以达到复用的目的。

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

    newCallbackNode = scheduleCallback(
        schedulerPriorityLevel,
        performConcurrentWorkOnRoot.bind(null, root)
    );

    root.callbackPriority = newCallbackPriority; // 相当于是上一次任务的优先级。记录下，便于下一次比较

    root.callbackNode = newCallbackNode; // 对 callbackNode 进行赋值，下次进入到 ensureRootIsScheduled 时则有已经正在运行的任务。如上标识 1
}
```

2. 在 unstable_scheduleCallback 函数内部，先通过计算得到执行时间 expirationTime，expirationTime = currentTime(当前时间) + timeout (不同优先级的延迟时间，延迟越小则越先执行，对应的优先级越大）。

```js
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
```

3. 在 unstable_scheduleCallback 函数内部，进行延时任务（timeQueue）和及时任务（taskQueue）的区分，以及判断何时将 timeQueue 中的任务推入到 taskQueue 中。

```js
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
        requestHostCallback(flushWork)
    }
}
return newTask;
```    

4. 及时任务立即执⾏，但是为了不阻塞⻚⾯的交互，因此在宏任务中执行。

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

5. 延时任务需要等到currentTime >= expirationTime的时候才会执⾏。**每次调度及时任务的时候，都会去判断延时任务的执⾏时间是否到了**，如果判断为true，则通过 advanceTimers 添加到及时任务中。

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
