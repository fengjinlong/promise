## 原文
https://juejin.cn/post/7043758954496655397

then方法可以传入两个参数，这两个参数都是函数，一个是当状态为fulfilled 成功 时执行的代码，另一个是当状态为 rejected 拒绝 时执行的代码。

因此我们就可以先给手写的then里面添加 两个参数：

一个是 onFulfilled 表示 “当状态为成功时”
另一个是 onRejected 表示 “当状态为拒绝时”



一般来说，不要在then()方法里面定义 Reject 状态的回调函数（即then的第二个参数），总是使用catch方法。
```js
// bad
promise
  .then(function(data) {
    // success
  }, function(err) {
    // error
  });
  
// good
promise
  .then(function(data) { //cb
    // success
  })
  .catch(function(err) {
    // error
  });
  // 第二种写法要好于第一种写法，理由是第二种写法可以捕获前面then方法执行中的错误，也更接近同步的写法（try/catch）。
  // 因此，建议总是使用catch()方法，而不使用then()方法的第二个参数。

```

◾ 注意这里不需要给reject()方法进行this的绑定了，因为这里是直接执行，而不是创建实例后再执行。
▪ func(this.resolve.bind(this), this.reject.bind(this)); 这里的this.reject意思是：把类方法reject()作为参数 传到构造函数constructor 里要执行的func()方法里，只是一个参数，并不执行，只有创建实例后调用reject()方法的时候才执行，此时this的指向已经变了，所以想要正确调用myPromise的reject()方法就要通过.bind(this))改变this指向。
▪ this.reject(error)，这里的this.reject()，是直接在构造函数里执行类方法，this指向不变，this.reject()就是直接调用类方法reject()，所以不用再进行this绑定



then 参数校验
