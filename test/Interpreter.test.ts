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
