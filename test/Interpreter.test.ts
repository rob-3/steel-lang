import tokenize from "../src/Tokenizer";
import parse from "../src/Parser";
import { cfxEval, exec as stmtExec } from "../src/Interpreter";
import chai = require("chai");
import spies = require("chai-spies");
chai.use(spies);
const expect = chai.expect;
const exec = (src, spy) => parse(tokenize(src)).forEach(stmt => stmtExec(stmt, spy));
const evalLn = (src: string) => cfxEval(parse(tokenize(src))[0]);

function run(source: string, spy): void {
    let tokens = tokenize(source);
    let ast = parse(tokens);
    for (let stmt of ast) {
        stmtExec(stmt, spy);
    }
}

describe("cfxEval()", () => {
    describe("literals", () => {
        it("should evaluate number literals", () => {
            expect(evalLn("2")).to.equal(2);
            expect(evalLn("-2")).to.equal(-2);
        });

        it("should evaluate string literals", () => {
            let src = `"happy day"`;
            let result = evalLn(src);
            expect(result).to.equal("happy day");
        });

        it("should evaluate boolean literals", () => {
            let src = "true";
            let result = evalLn(src);
            expect(result).to.equal(true);
        });
    });

    describe("math", () => {
        it("should do addition correctly", () => {
            let src = "2 + 2";
            let result = evalLn(src);
            expect(result).to.equal(4);
        });

        it("should do subtraction correctly", () => {
            let src = "2 - 2";
            let result = evalLn(src);
            expect(result).to.equal(0);
        });

        it("should do multiplication correctly", () => {
            let src = "2 * 5";
            let result = evalLn(src);
            expect(result).to.equal(10);
        });

        it("should do division correctly", () => {
            let src = "2 / 2";
            let result = evalLn(src);
            expect(result).to.equal(1);
        });

        it("should do floating point division correctly", () => {
            let src = "5 / 2";
            let result = evalLn(src);
            expect(result).to.equal(2.5);
        });

        it("should follow order of operations", () => {
            let src = "5 / 5 + 3 * 2";
            let result = evalLn(src);
            expect(result).to.equal(7);
        });
    });

    describe("comparisions", () => {
        it("should handle equality checks", () => {
            expect(evalLn("2 == 2")).to.equal(true);
            expect(evalLn("2 == 3")).to.equal(false);
        });

        it("should handle greater equal", () => {
            expect(evalLn("2 >= 2")).to.equal(true);
            expect(evalLn("1 >= 2")).to.equal(false);
        });

        it("should handle less equal", () => {
            expect(evalLn("2 <= 2")).to.equal(true);
            expect(evalLn("4 <= 3")).to.equal(false);
        });

        it("should handle greater than", () => {
            expect(evalLn("2 > 1")).to.equal(true);
            expect(evalLn("1 > 2")).to.equal(false);
        });

        it("should handle less than", () => {
            expect(evalLn("2 < 3")).to.equal(true);
            expect(evalLn("4 < 3")).to.equal(false);
        });
    });

    describe("booleans", () => {
        it("should evaluate logical AND correctly", () => {
            expect(evalLn("true and true")).to.equal(true);
            expect(evalLn("true and false")).to.equal(false);
            expect(evalLn("false and true")).to.equal(false);
            expect(evalLn("false and false")).to.equal(false);
        });

        it("should evaluate logical OR correctly", () => {
            expect(evalLn("true or true")).to.equal(true);
            expect(evalLn("true or false")).to.equal(true);
            expect(evalLn("false or true")).to.equal(true);
            expect(evalLn("false or false")).to.equal(false);
        });

        it("should evaluate logical NOT correctly", () => {
            expect(evalLn("not true")).to.equal(false);
            expect(evalLn("not false")).to.equal(true);
        });

        it("should handle logical NOT at a lower precedence than AND and OR", () => {
            expect(evalLn("not true and false")).to.equal(false);
        });
    });
});

describe("exec()", () => {
    describe("if statements", () => {
        it("should execute an if stmt with true condition", () => {
            let src = "if (true) {\nprint 5\n}";
            let spy = chai.spy();
            run(src, spy);
            expect(spy).to.have.been.called.with(5);
        });

        it("should not execute an if stmt with a false condition", () => {
            let src = `
            if (false) {
                print 5
            }
            `;
            let spy = chai.spy();
            exec(src, spy);
            expect(spy).not.to.have.been.called();
        });

        it("should execute the else body stmt with a false condition", () => {
            let src = `
            if (false) {
                print 5
            } else {
                print 6
            }
            `;
            let spy = chai.spy();
            exec(src, spy);
            expect(spy).to.have.been.called.once;
            expect(spy).to.have.been.called.with(6);
        });

        it("should not execute the if body with a false condition", () => {
            let src = `
            if (false) {
                print 5
            } else {
                print 6
            }
            `;
            let spy = chai.spy();
            exec(src, spy);
            expect(spy).not.to.have.been.called.with(5);
        });
    });
});
