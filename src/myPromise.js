"use strict";
exports.__esModule = true;
exports.myPromise = void 0;
// let promise = new Promise(() => {}) 参数 fnc
var myPromise = /** @class */ (function () {
    function myPromise(fnc) {
        // 自身状态
        this.PromiseState = myPromise.PENDING;
        // 结果
        this.PromiseResult = null;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        // let promise = new Promise((resolve, reject) => {})
        // 不加 this 不能访问resolve
        try {
            // 需要try ，不报错 rejected: Error: 白嫖不成功
            // 没有try ，报错 Uncaught: Error: 白嫖不成功 Uncaught 未捕获
            fnc(this.resolve.bind(this), this.reject.bind(this));
        }
        catch (e) {
            // 注意这里不需要给reject()方法进行this的绑定了，因为这里是直接执行，而不是创建实例后再执行。
            this.reject(e);
        }
    }
    // 执行 resolve() 和 reject() 可以传参
    myPromise.prototype.resolve = function (result) {
        // 在执行resolve()的时候就需要判断状态是否为 待定 pending，如果是 待定 pending的话就把状态改为 成功 fulfilled:
        var _this = this;
        if (this.PromiseState === myPromise.PENDING) {
            setTimeout(function () {
                _this.PromiseState = myPromise.FULFILLED;
                _this.PromiseResult = result;
                _this.onFulfilledCallbacks.forEach(function (callback) {
                    callback(result);
                });
            });
        }
    };
    myPromise.prototype.reject = function (reason) {
        var _this = this;
        // 同理
        if (this.PromiseState === myPromise.PENDING) {
            setTimeout(function () {
                _this.PromiseState = myPromise.REJECTED;
                _this.PromiseResult = reason;
                _this.onRejectedCallbacks.forEach(function (callback) {
                    callback(reason);
                });
            });
        }
    };
    myPromise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        // then 判断状态
        onFulfilled = typeof onFulfilled === "function" ? onFulfilled : function (v) { return v; };
        onRejected =
            typeof onRejected === "function"
                ? onRejected
                : function (reason) {
                    throw reason;
                };
        var promise2 = new myPromise(function (resolve, reject) {
            if (_this.PromiseState === myPromise.FULFILLED) {
                setTimeout(function () {
                    try {
                        var x = onFulfilled(_this.PromiseResult); // 2271
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e); // 2272
                    }
                });
            }
            else if (_this.PromiseState === myPromise.REJECTED) {
                setTimeout(function () {
                    try {
                        var x = onRejected(_this.PromiseResult);
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e); // 2272
                    }
                });
            }
            else if (_this.PromiseState === myPromise.PENDING) {
                // 2271 2272
                // 解决异步调用
                _this.onFulfilledCallbacks.push(function () {
                    try {
                        var x = onFulfilled(_this.PromiseResult); // 2271
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e); // 2272
                    }
                });
                _this.onRejectedCallbacks.push(function () {
                    try {
                        var x = onRejected(_this.PromiseResult);
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e); // 2272
                    }
                });
            }
        });
        return promise2;
    };
    // 状态
    myPromise.PENDING = "pending";
    myPromise.FULFILLED = "fulfilled";
    myPromise.REJECTED = "rejected";
    return myPromise;
}());
exports.myPromise = myPromise;
/**
 * 对resolve()、reject() 进行改造增强 针对resolve()和reject()中不同值情况 进行处理
 * @param  {promise} promise2 promise1.then方法返回的新的promise对象
 * @param  {[type]} x         promise1中onFulfilled或onRejected的返回值
 * @param  {[type]} resolve   promise2的resolve方法
 * @param  {[type]} reject    promise2的reject方法
 */
function resolvePromise(promise2, x, resolve, reject) {
    // 如果从onFulfilled或onRejected中返回的 x 就是promise2，会导致循环引用报错
    if (x === promise2) {
        // 231
        return reject(new TypeError("Chaining cycle detected for promise"));
    }
    // 2.3.2 如果 x 为 Promise ，则使 promise2 接受 x 的状态
    if (x instanceof myPromise) {
        if (x.PromiseState === myPromise.PENDING) {
            /**
             * 2.3.2.1 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
             *         注意"直至 x 被执行或拒绝"这句话，
             *         这句话的意思是：x 被执行x，如果执行的时候拿到一个y，还要继续解析y
             */
            x.then(function (y) {
                resolvePromise(promise2, y, resolve, reject);
            }, reject);
        }
        else if (x.PromiseState === myPromise.FULFILLED) {
            // 2.3.2.2 如果 x 处于执行态，用相同的值执行 promise
            resolve(x.PromiseResult);
        }
        else if (x.PromiseState === myPromise.REJECTED) {
            // 2.3.2.3 如果 x 处于拒绝态，用相同的据因拒绝 promise
            reject(x.PromiseResult);
        }
    }
    else if (x !== null && (typeof x === "object" || typeof x === "function")) {
        // 2.3.3 如果 x 为对象或函数
        try {
            // 2.3.3.1 把 x.then 赋值给 then
            var then = x.then;
        }
        catch (e) {
            // 2.3.3.2 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
            return reject(e);
        }
        /**
         * 2.3.3.3
         * 如果 then 是函数，将 x 作为函数的作用域 this 调用之。
         * 传递两个回调函数作为参数，
         * 第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`
         */
        if (typeof then === "function") {
            // 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            var called_1 = false; // 避免多次调用
            try {
                // 2.3.3.3
                then.call(x, function (y) {
                    if (called_1)
                        return;
                    called_1 = true;
                    // 2.3.3.3.1 如果 `resolvePromise` 以值 `y` 为参数被调用，则运行 `[[Resolve]](promise, y)`
                    resolvePromise(promise2, y, resolve, reject);
                }, function (r) {
                    if (called_1)
                        return;
                    called_1 = true;
                    // 2.3.3.3.2 如果 `rejectPromise` 以据因 `r` 为参数被调用，则以据因 `r` 拒绝 `promise`
                    reject(r);
                });
            }
            catch (e) {
                /**
                 * 2.3.3.3.4 如果调用 then 方法抛出了异常 e
                 * 2.3.3.3.4.1 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
                 */
                if (called_1)
                    return;
                called_1 = true;
                /**
                 * 2.3.3.3.4.2 否则以 e 为据因拒绝 promise
                 */
                reject(e);
            }
        }
        else {
            // 2.3.3.4 如果 then 不是函数，以 x 为参数执行 promise
            resolve(x);
        }
    }
    else {
        // 2.3.4 如果 x 不为对象或者函数，以 x 为参数执行 promise
        return resolve(x);
    }
}
// todo then 的参数
// then方法可以传入两个参数，
// 这两个参数都是函数，一个是当状态为fulfilled 成功 时执行的代码，另一个是当状态为 rejected 拒绝 时执行的代码。
// todo 状态唯一
// let promise1 = new myPromise((resolve, reject) => {
//   resolve("这次一定");
//   reject("下次一定");
// });
// promise1.then(
//   (result) => {
//     console.log(result);
//   },
//   (reason) => {
//     console.log(reason.message);
//   }
// );
// console.log(promise1);
// todo 捕捉错误
// let promise = new myPromise((resolve, reject) => {
//   throw new Error("白嫖不成功");
// });
// promise.then(
//   (result) => {
//     console.log("fulfiiled:", result);
//   },
//   (reason) => {
//     console.log("rejected:", reason);
//   }
// );
// tode then 参数校验
// let promise1 = new myPromise((resolve, reject) => {
//   // resolve("这次一定");
//   reject("这次一定33");
// });
// promise1.then(undefined, (reason) => {
//   console.log("rejected:", reason);
// });
// promise1.then(() => {}, undefined);
// todo 异步执行 1
// console.log(1);
// let promise1 = new myPromise((resolve, reject) => {
//   console.log(2);
//   resolve("这次一定");
// });
// promise1.then(
//   (result) => {
//     console.log("fulfilled:", result);
//   },
//   (reason) => {
//     console.log("rejected:", reason);
//   }
// );
// console.log(3);
// todo 异步执行 2 promise的回调保存 期望
/**
 * 1
 * 2
 * 3
 * A pending
 * B pending
 * 4
 * C pengding
 * fulfilled 这次一定
 *
 * */
// console.log(1); // 1
// let promise1 = new myPromise((resolve, reject) => {
//   console.log(2); // 2
//   setTimeout(() => {
//     // 推进 宏任务 等待执行
//     console.log("A", promise1.PromiseState);
//     resolve("这次一定");
//     console.log("B", promise1.PromiseState);
//     console.log(4);
//   });
// });
// promise.then()是微任务，将promise.then()加入微任务队列，等待执行
// promise1.then(
//   (result) => {
//     console.log("C", promise1.PromiseState);
//     console.log("fulfilled:", result);
//   },
//   (reason) => {
//     console.log("rejected:", reason);
//   }
// );
// console.log(3); // 3 执行栈已经清空
// todo 验证 then 方法多次调用
// const promise = new myPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve("success");
//   }, 2000);
// });
// promise.then((value: any) => {
//   console.log(1);
//   console.log("resolve", value);
// });
// promise.then((value) => {
//   console.log(2);
//   console.log("resolve", value);
// });
// promise.then((value) => {
//   console.log(3);
//   console.log("resolve", value);
// });
// todo 实现 then 方法的链式调用
// 原生 demo1
// let p1 = new Promise((resolve, reject) => {
//   resolve(10)
// })
// p1.then(res => {
//   console.log('fulfilled', res);
//   return 2 * res
// }).then(res => {
//   console.log('fulfilled', res)
// })
// fulfilled 100
// fulfilled 200
// 原生 demo2
// const p2 = new Promise((resolve, reject) => {
//   resolve(100)
// })
// p2.then(res => {
//   console.log('fulfilled', res);
//   return new Promise((resolve, reject) => resolve(3 * res))
// }).then(res => {
//   console.log('fulfilled', res)
// })
// fulfilled 100
// fulfilled 300
// let p1 = new myPromise((resolve, reject) => {
//   resolve(10);
// });
// p1.then((res) => {
//   console.log("fulfilled", res);
//   return 2 * res;
// }).then((res) => {
//   console.log("fulfilled", res);
// });
myPromise.deferred = function () {
    var result = {};
    result.promise = new myPromise(function (resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
    });
    return result;
};
// module.exports = myPromise;
