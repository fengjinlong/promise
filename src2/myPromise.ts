export class myPromise {
  static reject: (value: any) => any;
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";
  PromiseState: string;
  PromiseResult: null;
  onRejectedCallbacks: any;
  onFulfilledCallbacks: any;
  static resolve: (value: any) => any;
  constructor(func) {
    this.PromiseState = myPromise.PENDING;
    this.PromiseResult = null;
    this.onFulfilledCallbacks = [];
    this.onFulfilledCallbacks = [];
    try {
      func(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }
  resolve(result) {
    if (this.PromiseState === myPromise.PENDING) {
      setTimeout(() => {
        this.PromiseState = myPromise.FULFILLED;
        this.PromiseResult = result;
        this.onFulfilledCallbacks.forEach((callback) => {
          callback(result);
        });
      });
    }
  }
  reject(reason) {
    if (this.PromiseState === myPromise.PENDING) {
      setTimeout(() => {
        this.PromiseState = myPromise.REJECTED;
        this.PromiseResult = reason;
        this.onFulfilledCallbacks.forEach((callback) => {
          callback(reason);
        });
      });
    }
  }
  /**
   * promise.all([a,b,c])
   * 1 返回promise
   * 2 参数校验 arg = [a, b, c], 定义 记录执行个数，返回的结果数组
   * 3 如果传参 arg 是个 空的可迭代对象 返回一个已完成的 promise
   * 4 a 是 promise,返回一个已完成状态的 promise，就是调用 resolve 的静态方法。并进行 then 的执行
   * 4-1 onFullfilled 记录，赋值，判断是否都执行完
   * 4-2 onRejected 直接 reject
   * 5 不是 promise ，原样返回在结果数组里
   */
  static all(promises) {
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let result: any[] = [];
        let count = 0;
        if (promises.length === 0) {
          return resolve(promises);
        }
        promises.forEach((item, index) => {
          if (item instanceof myPromise) {
            myPromise.resolve(item).then(
              (value) => {
                count++;
                result[index] = value;
                count === promises.length && resolve(result);
              },
              (reason) => {
                reject(reason);
              }
            );
          } else {
            count++;
            result[index] = item;
            count === promises.length && resolve(result);
          }
        });
      } else {
        return reject(new TypeError("arguments is not interable"));
      }
    });
  }
  // Promise.allSettled
  /**
   *
   * 方法返回一个在所有给定的promise都已经fulfilled或rejected后的promise，并带有一个对象数组，每个对象表示对应的promise结果
   * 多个彼此不依赖的异步任务成功完成时，或者你总是想知道每个promise的结果时，通常使用它。
   * 对于每个结果对象，都有一个 status 字符串。如果它的值为 fulfilled，则结果对象上存在一个 value 。如果值为 rejected，则存在一个 reason 。
   * value（或 reason ）反映了每个 promise 决议（或拒绝）的值。
   * 参数 iterable 是一个可迭代的对象，例如Array，其中每个成员都是Promise，非 Promise 参数转换成 Promise 了
   */
  static allSettled(promises) {
    return new myPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let result: any[] = []; // 存储结果
        let count = 0; // 计数器

        // 如果传入的是一个空数组，那么就直接返回一个resolved的空数组promise对象
        if (promises.length === 0) return resolve(promises);
        promises.forEach((item, index) => {
          myPromise.resolve(item).then(
            (value) => {
              count++;
              result[index] = {
                status: "fulfilled",
                value,
              };
              // 所有给定的promise都已经fulfilled或rejected后,返回这个promise
              count === promises.length && resolve(result);
            },
            (reason) => {
              count++;
              result[index] = {
                status: "rejected",
                value: reason,
              };
              // 所有给定的promise都已经fulfilled或rejected后,返回这个promise
              count === promises.length && resolve(result);
            }
          );
        });
      } else {
        return reject(new TypeError("Argument is not iterable"));
      }
    });
  }

  /**
   *
   * finally() 方法返回一个Promise
   *  由于无法知道promise的最终状态，所以finally的回调函数中不接收任何参数，它仅用于无论最终结果如何都要执行的情况。
   */
  finally(callback) {
    return this.then(callback, callback);
  }

  // catch
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;

    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };
    // 处理链式调用 需要 5 步骤
    /**
     * 1 返回 promise2
     * 2 then 参数返回值执行 promise 解决过程（结果过程函数 四个参数）
     * 3 处理 第二步过程的异常
     * 4 then的pending 状态同样进行 23 步骤
     * 5 解决函数
     */
    // 第一 返回 promise2
    const promise2 = new myPromise((resolve, reject) => {
      // 第四 pending 同样需要 进行 promise 解决过程 和 处理异常
      if (this.PromiseState === myPromise.PENDING) {
        // this.onFulfilledCallbacks.push(onFulfilled);
        // this.onRejectedCallbacks.push(onRejected);
        this.onFulfilledCallbacks.push(() => {
          try {
            let x = onFulfilled(this.PromiseResult);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.PromiseResult);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.PromiseState === myPromise.FULFILLED) {
        setTimeout(() => {
          // 第三 promise2 必须处理异常
          try {
            let x = onFulfilled(this.PromiseResult);
            // 第二 返回值执行promise 解决过程
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.PromiseState === myPromise.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.PromiseResult);
            // 返回值执行promise 解决过程
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
    });
    return promise2;
  }
}

// 解决过程 函数 要点，需要五个步骤
/**
 *
 * @param promise2
 * @param x
 * @param resolve
 * @param reject
 * 1 处理循环引用 x === promise2
 * 2 如果 x 为 Promise ，则使 promise2 接受 x 的状态
 * 3 x 为对象 function 不为 null
 * 4 x 为其他
 */
function resolvePromise(promise2, x, resolve, reject) {
  // Implement
  if (x === promise2) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  if (x.PromiseState === myPromise.PENDING) {
    x.then((y) => {
      resolvePromise(promise2, y, resolve, reject);
    }, reject);
  } else if (x.PromiseState === myPromise.FULFILLED) {
    resolve(x.PromiseResult);
  } else if (x.PromiseState === myPromise.REJECTED) {
    reject(x.PromiseResult);
  } else if (x !== null && (typeof x === "object" || typeof x === "function")) {
    try {
      var then = x.then;
    } catch (e) {
      return reject(e);
    }
    if (typeof then === "function") {
      let called = false;
      try {
        then.call(x, (y) => {
          if (called) {
            return;
          }
          called = true;
          resolvePromise(promise2, y, resolve, reject),
            (r) => {
              if (called) return;
              called = true;
              reject(r);
            };
        });
      } catch (e) {
        if (called) {
          return;
        }
        called = true;
        reject(e);
      }
    } else {
      reject(x);
    }
  } else {
    resolve(x);
  }
}

let promise = new myPromise((resolve, reject) => {});
