import tokenize from "../src/Tokenizer";
import parse from "../src/Parser";
import { cfxEval } from "../src/Interpreter";
import { expect } from "chai";

describe("cfxEval()", () => {
    it("should evaluate number literals", () => {
        let src0 = "2";
        let result0 = evalLn(src0);
        expect(result0).to.equal(2);
        let src1 = "-2";
        let result1 = evalLn(src1);
        expect(result1).to.equal(-2);
    });

    it("should evaluate string literals", () => {
        let src = `"happy day"`;
        let result = evalLn(src);
        expect(result).to.equal("happy day");
    });

    function evalLn(src: string) {
        return cfxEval(parse(tokenize(src))[0]);
    }
});
