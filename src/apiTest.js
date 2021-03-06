const myPromise = require('./api.js');

const promise1 = myPromise.resolve(123);

promise1.then((value) => {
  console.log(value);
  // expected output: 123
});

// Resolve一个thenable对象
var p1 = myPromise.resolve({
    then: function (onFulfill) {
        onFulfill("Resolving");
    }
});
console.log(p1 instanceof myPromise) // true, 这是一个Promise对象

setTimeout(() => {
    console.log('p1 :>> ', p1);
}, 1000);

p1.then(function (v) {
    console.log(v); // 输出"fulfilled!"
}, function (e) {
    // 不会被调用
});

// Thenable在callback之前抛出异常
// myPromise rejects
var thenable = {
    then: function (resolve) {
        throw new TypeError("Throwing");
        resolve("Resolving");
    }
};

var p2 = myPromise.resolve(thenable);
p2.then(function (v) {
    // 不会被调用
}, function (e) {
    console.log(e); // TypeError: Throwing
});

myPromise.reject(new Error('fail')).then(function () {
  // not called
}, function (error) {
  console.error(error); // Error: fail
});
