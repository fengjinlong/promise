import {myPromise}  from "./myPromise"
// https://juejin.cn/post/7044088065874198536#heading-4
/**
 * Promise.resolve(value) 将给定的一个值转为Promise对象
 * 1. 如果这个值是一个 promise ，那么将返回这个 promise
 * 2. 如果这个值是thenable（即带有"then" 方法），返回的promise会“跟随”这个thenable的对象，采用它的最终状态；
 * 3. 否则返回的promise将以此值完成，即以此值执行resolve()方法 (状态为fulfilled)。
 *
 */
myPromise.resolve = function (value) {
  if (value instanceof myPromise) {
    // 1
    return value;
  } else if (value instanceof Object && "then" in value) {
    // 2
    return new myPromise((resolve, reject) => {
      value.then(resolve, reject);
    });
  }
  // 3
  return new myPromise((resolve) => {
    resolve(value);
  });
};

myPromise.reject = function (reason) {
  return new myPromise((resolve, reject) => {
    reject(reason);
  });
};

/**
 * Promise.prototype.catch
 * catch() 方法返回一个Promise，并且处理拒绝的情况，
 * 它的行为与调用Promise.prototype.then(undefined, onRejected) 相同。
 * 
 * Promise.prototype.catch()方法是.then(null, rejection)或.then(undefined, rejection)的别名，用于指定发生错误时的回调函数
 * 
*/

myPromise.prototype.catch = function(onRejected) {
  return new myPromise((undefined, onRejected) => onRejected)
}

export { myPromise };