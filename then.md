
**一个开放的声音标准，可互操作的 JavaScript promises——由实现者实现，供实现者使用**

**Promise 表示异步操作的最终结果。`promise`相互作用的主要方式是通过它的 `then` 方法，`then` 注册回调来接收 `promise` 的最终 `value` 或 `promise` 拒绝的原因。**

**Promises/a + 核心规范没有涉及如何创建、实现或拒绝 `promise`，而是选择专注于提供一个可互操作的 `then` 方法**。

# 1. Terminology 术语
### 1.1 `promise` 是一个带有 `then` 方法的对象或方法，其行为符合规范
### 1.2 `thenable` 是一个定义了 `then` 的方法的对象或方法
### 1.3 `value`  是任何合法的 JavaScript 值(包括undefined, a thenable, or a promise)
### 1.4 exception 异常 是通过 `throw` 语句抛出的
### 1.5 `reason` 是表明为什么 `promise` 被拒绝的值
# 2. Requirements 要求
### 2.1 状态
一个 `promise` 有三种状态 `pending, fulfilled, rejected`
- 2.1.1 当 pending 状态
  - 2.1.1.1 可以转换 到 `fulfilled, rejected` 状态
- 2.1.2 当 fulfilled 状态
  - 2.1.2.1 不能转换到任何其他状态
  - 2.1.2.2 必须有一个值 value，不能改变
- 2.1.3 当 rejected 状态
  - 2.1.3.1 不能转换到任何其他状态
  - 2.1.3.2 必须有原因 reason，不能改变

### 2.2 then  方法
**一个 `promise` 必须提供一个 `then` 方法，以获得其当前或最终的 `value or reason` 。**

then 方法接受两个参数 
```js
promise.then(onFulfilled, onRejected)
```

#### 2.2.1 `onFulfilled` and `onRejected` 是可选参数

- `onFulfilled` 不是一个函数，必须忽略它
- `onRejected` 不是一个函数，必须忽略它

#### 2.2.2 如果`onFulfilled` 是一个方法

- 必须在状态改为 fulfilled 后调用，且promise（promsieResult）的结果为它的第一个参数
- 只能调用一次

#### 2.2.3 如果onRejected 是一个方法

- 必须在状态改为 rejected 后调用，且被拒绝的结果为它的 第一个参数
- 只能调用一次

#### 2.2.4 `onFulfilled` 和 `onRejected` 需要异步执行

#### 2.2.5 `onFulfilled`` 及``onRejected` 作为函数，严格模式下，内部没有this，一般模式，this 为全局对象

#### 2.2.6 then 可能被同一个promise 调用多次

- 当一个promise转化为fulfilled状态，所有`onFulfilled` callback会按照回调函数通过then添加时的顺序而执行
- 当一个promise转化为rejected状态，所有onRejected callback会按照回调函数通过then添加时的顺序而执行

#### 2.2.7 then 必须返回一个promise

```js
 promise2 = promise1.then(onFulfilled, onRejected);
```

- 2.2.7.1 如果`onFulfilled` 或`onRejected` 返回一个值x, 必须运行 promise 解决过程，`[[Resolve]](promise2, x）`
- 2.2.7.2 如果`onFulfilled` 或者 `onRejected` 抛出一个异常 `e` ，则 `promise2` 必须拒绝执行，并返回拒因 `e`

- 2.2.7.3 如果 `onFulfilled` 不是函数且 `promise1` 成功执行， `promise2` 必须成功执行并返回相同的值

- 2.2.7.4 如果 `onRejected` 不是函数且 `promise1` 拒绝执行， `promise2` 必须拒绝执行并返回相同的据因

### 2.3 `promise`的解决过程

**Promise 解决过程** 是一个抽象的操作，其需输入一个 `promise` 和一个值，我们表示为 `[[Resolve]](promise, x)`，如果 `x` 有 `then` 方法且看上去像一个 `Promise` ，解决程序即尝试使 `promise` 接受 `x` 的状态；否则其用 `x` 的值来执行 `promise` 。

这种 `thenable` 的特性使得 `Promise` 的实现更具有通用性：**只要其暴露出一个遵循 `Promises/A+` 协议的 `then` 方法即可；这同时也使遵循 `Promises/A+` 规范的实现可以与那些不太规范但可用的实现能良好共存。**

**运行 `[[Resolve]](promise, x)` 需遵循以下步骤：**

#### 2.3.1 x 与`promise` 相等

如果 `promise` 和 `x` 指向同一对象，以 `TypeError` 为据因拒绝执行 `promise`

#### 2.3.2 x 为 `promise` 

如果 `x` 为 Promise ，则使 `promise` 接受 `x` 的状态

- 2.3.2.1 如果 `x` 处于等待态， `promise` 需保持为等待态直至 `x` 被执行或拒绝
- 2.3.2.2 如果 `x` 处于执行态，用相同的值执行 `promise`
- 2.3.2.3 如果 `x` 处于拒绝态，用相同的据因拒绝 `promise`

#### 2.3.3 `x` 为对象或函数

如果 x 为对象或者函数：

- 2.3.3.1 把 `x.then` 赋值给 `then`
- 2.3.3.2 如果取 `x.then` 的值时抛出错误 `e` ，则以 `e` 为据因拒绝 `promise`
- 2.3.3.3 如果 `then` 是函数，将 `x` 作为函数的作用域 `this` 调用之。传递两个回调函数作为参数，第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`:
    - 2.3.3.3.1 如果 `resolvePromise` 以值 `y` 为参数被调用，则运行 `[[Resolve]](promise, y)`
    - 2.3.3.3.2 如果 `rejectPromise` 以据因 `r` 为参数被调用，则以据因 `r` 拒绝 `promise`
    - 2.3.3.3.3 如果 `resolvePromise` 和 `rejectPromise` 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
    - 2.3.3.3.4 如果调用 `then` 方法抛出了异常 `e`：
        - 2.3.3.3.4.1 如果 `resolvePromise` 或 `rejectPromise` 已经被调用，则忽略之
        - 2.3.3.3.4.2 否则以 `e` 为据因拒绝 `promise`
- 2.3.3.4 如果 `then` 不是函数，以 `x` 为参数执行 `promise`

如果一个 `promise` 被一个循环的 `thenable` 链中的对象解决，而 `[[Resolve]](promise, thenable)` 的递归性质又使得其被再次调用，根据上述的算法将会陷入无限递归之中。算法虽不强制要求，但也鼓励施者检测这样的递归是否存在，若检测到存在则以一个可识别的 `TypeError` 为据因来拒绝 `promise`。

#### 2.3.4 如果 x 不为对象或者函数，以 x 为参数执行 promise