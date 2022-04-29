class MyPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";
  constructor(func) {
    this.status = MyPromise.PENDING;
    this.result = null;
    this.resolveCallback = [];
    this.rejectCallback = [];
    try {
      func(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }
  // resolve = (value)=> {
  resolve(value) {
    if (this.status === MyPromise.PENDING) {
      setTimeout(() => {
        this.result = value;
        this.status = MyPromise.FULFILLED;
        this.resolveCallback.forEach((cb) => {
          cb(value);
        });
      });
    }
  }
  reject(reason) {
    if (this.status === MyPromise.PENDING) {
      setTimeout(() => {
        this.result = reason;
        this.status = MyPromise.REJECTED;
        this.rejectCallback.forEach((cb) => {
          cb(reason);
        });
      });
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (x) => x;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (r) => {
            throw r;
          };
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.result);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.status === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.result);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.status === MyPromise.PENDING) {
        this.resolveCallback.push(() => {
          try {
            let x = onFulfilled(this.result);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        this.rejectCallback.push(() => {
          try {
            let x = onRejected(this.result);
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
function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  if (x instanceof MyPromise) {
    if (x.status === MyPromise.PENDING) {
      x.then((y) => {
        resolvePromise(promise2, y, resolve, reject);
      }, reject);
    } else if (x.status === MyPromise.FULFILLED) {
      reslove(x.result);
    } else if (x.status === MyPromise.REJECTED) {
      reject(x.result);
    }
  } else if (x !== null && (typeof x === "object" || typeof x === "function")) {
    try {
      var then2 = x.then;
    } catch (e) {
      reject(e);
    }
    if (typeof then2 === "function") {
      let called = false;
      try {
        then2.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } catch (e) {
        if (called) return;
        called = true;
        reject(e);
      }
    }
  }
}
let p1 = new MyPromise((resolve, reject) => {
  resolve(10);
});
p1.then((res) => {
  console.log("fulfilled", res);
  return 2 * res;
}).then((res) => {
  console.log("fulfilled", res);
});
