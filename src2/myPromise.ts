class myPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";
  PromiseState: string;
  PromiseResult: null;
  onRejectedCallbacks: any;
  onFulfilledCallbacks: any;
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
