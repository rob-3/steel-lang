import { stlEval as _stlEval } from "../src/Interpreter";
import Scope from "../src/Scope";
import { UnboxedValue } from "../src/Value";
import chai = require("chai");
const expect = chai.expect;

const stlEval = (
    src: string,
    scope: Scope = new Scope()
): UnboxedValue | undefined => {
    const val = _stlEval(src, scope);
    try {
        return val.unsafeCoerce()[0]?.value;
    } catch (e) {
        console.log(val);
        throw e;
    }
};

describe("objects", () => {
    it("should use deep equality by default", () => {
        expect(stlEval("{ a: 4 } == { a: 4 }")).to.equal(true);
    });
});
