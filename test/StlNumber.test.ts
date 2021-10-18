import StlNumber, { gcd } from "../src/StlNumber";
import chai = require("chai");
const expect = chai.expect;

describe("StlNumber", () => {
    it("should properly generate fractions", () => {
        expect(new StlNumber(314n, 100n)).to.eql(StlNumber.of("3.14"));
    });

    it("should properly implement gcd", () => {
        expect(gcd(5n, 25n)).to.eql(5n);
        expect(gcd(7n, 25n)).to.eql(1n);
        expect(gcd(12n, 24n)).to.eql(12n);
    });

    it("should support equality testing", () => {
        expect(new StlNumber(5n)).to.eql(new StlNumber(5n));
    });

    it("should fix 0.1 + 0.2 == 0.3", () => {
        expect(StlNumber.of("0.1").add(StlNumber.of("0.2"))).to.eql(StlNumber.of("0.3"));
    });
});
