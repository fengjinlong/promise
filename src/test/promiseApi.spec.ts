import { myPromise } from "../api";
// import { myPromise } from "../myPromise";
describe("p", () => {
  test("val", () => {
    const promise1 = myPromise.resolve(123);
    return promise1.then((value) => {
      expect(value).toBe(123);
    });
  });
});
