import { myPromise } from "../api";
// import { myPromise } from "../myPromise";
console.log(myPromise);
describe("p", () => {
  test("val", () => {
    const promise1 = myPromise.resolve(123);
    return promise1.then((value) => {
      expect(value).toBe(123);
    });
  });

  test("then", () => {
    let p1 = myPromise.resolve({
      then: function (onFulfill:any) {
        onFulfill("Resolving");
      },
    });
    expect(p1 instanceof myPromise).toBe(true);
  });
});
