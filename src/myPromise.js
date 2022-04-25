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
        if (this.PromiseState === myPromise.FULFILLED) {
            setTimeout(function () {
                onFulfilled(_this.PromiseResult);
            });
        }
        if (this.PromiseState === myPromise.REJECTED) {
            setTimeout(function () {
                onRejected(_this.PromiseResult);
            });
        }
        if (this.PromiseState === myPromise.PENDING) {
            this.onFulfilledCallbacks.push(onFulfilled);
            this.onRejectedCallbacks.push(onRejected);
        }
    };
    // 状态
    myPromise.PENDING = "pending";
    myPromise.FULFILLED = "fulfilled";
    myPromise.REJECTED = "rejected";
    return myPromise;
}());
exports.myPromise = myPromise;
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
var p1 = new myPromise(function (resolve, reject) {
    resolve(10);
});
p1.then(function (res) {
    console.log('fulfilled', res);
    return 2 * res;
});
// }).then(res => {
//   console.log('fulfilled', res)
// }) 
