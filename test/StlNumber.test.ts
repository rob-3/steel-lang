import StlNumber from "../src/StlNumber";
import chai = require("chai");
const expect = chai.expect;

describe("StlNumber", () => {
    it("should properly generate fractions", () => {
        expect(new StlNumber(314n, 100n)).to.eql(StlNumber.of("3.14"));
    });
});
