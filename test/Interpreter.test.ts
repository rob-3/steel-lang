import { setPrintFn, cfxEval as _cfxEval, cfxExec as _cfxExec } from "../src/Interpreter";
import Scope from "../src/Scope";
import chai = require("chai");
import spies = require("chai-spies");
chai.use(spies);
const expect = chai.expect;

const cfxEval = (src: string, scope: Scope = new Scope()) => {
    return _cfxEval(src, scope);
};

const cfxExec = (src: string, printfn = null) => {
    if (printfn) setPrintFn(printfn);
    return _cfxExec(src);
};


describe("exprEval()", () => {
    describe("literals", () => {
        it("should evaluate number literals", () => {
            expect(cfxEval("2")).to.equal(2);
            expect(cfxEval("-2")).to.equal(-2);
        });

        it("should evaluate string literals", () => {
            let src = `"happy day"`;
            let result = cfxEval(src);
            expect(result).to.equal("happy day");
        });

        it("should evaluate boolean literals", () => {
            let src = "true";
            let result = cfxEval(src);
            expect(result).to.equal(true);
        });
    });

    describe("math", () => {
        it("should do addition correctly", () => {
            let src = "2 + 2";
            let result = cfxEval(src);
            expect(result).to.equal(4);
        });

        it("should do subtraction correctly", () => {
            let src = "2 - 2";
            let result = cfxEval(src);
            expect(result).to.equal(0);
        });

        it("should do multiplication correctly", () => {
            let src = "2 * 5";
            let result = cfxEval(src);
            expect(result).to.equal(10);
        });
it("should do division correctly", () => {
            let src = "2 / 2";
            let result = cfxEval(src);
            expect(result).to.equal(1);
        });

        it("should do floating point division correctly", () => {
            let src = "5 / 2";
            let result = cfxEval(src);
            expect(result).to.equal(2.5);
        });

        it("should follow order of operations", () => {
            let src = "5 / 5 + 3 * 2";
            let result = cfxEval(src);
            expect(result).to.equal(7);
        });
    });

    describe("comparisions", () => {
        it("should handle equality checks", () => {
            expect(cfxEval("2 == 2")).to.equal(true);
            expect(cfxEval("2 == 3")).to.equal(false);
        });

        it("should handle greater equal", () => {
            expect(cfxEval("2 >= 2")).to.equal(true);
            expect(cfxEval("1 >= 2")).to.equal(false);
        });

        it("should handle less equal", () => {
            expect(cfxEval("2 <= 2")).to.equal(true);
            expect(cfxEval("4 <= 3")).to.equal(false);
        });

        it("should handle greater than", () => {
            expect(cfxEval("2 > 1")).to.equal(true);
            expect(cfxEval("1 > 2")).to.equal(false);
        });

        it("should handle less than", () => {
            expect(cfxEval("2 < 3")).to.equal(true);
            expect(cfxEval("4 < 3")).to.equal(false);
        });
    });

    describe("booleans", () => {
        it("should evaluate logical AND correctly", () => {
            expect(cfxEval("true and true")).to.equal(true);
            expect(cfxEval("true and false")).to.equal(false);
            expect(cfxEval("false and true")).to.equal(false);
            expect(cfxEval("false and false")).to.equal(false);
        });

        it("should evaluate logical OR correctly", () => {
            expect(cfxEval("true or true")).to.equal(true);
            expect(cfxEval("true or false")).to.equal(true);
            expect(cfxEval("false or true")).to.equal(true);
            expect(cfxEval("false or false")).to.equal(false);
        });

        it("should evaluate logical NOT correctly", () => {
            expect(cfxEval("not true")).to.equal(false);
            expect(cfxEval("not false")).to.equal(true);
        });

        it("should handle logical NOT at a lower precedence than AND and OR", () => {
            expect(cfxEval("not true and false")).to.equal(false);
        });

        it("should evaluate block stmts", () => {
            let src = `
            {
                let a = 5
                let b = -3
                a + b
            }
            `;
            expect(cfxEval(src)).to.equal(2);
        });
    });
});

describe("exec()", () => {
    describe("if statements", () => {
        it("should execute an if stmt with true condition", () => {
            let src = "if (true) {\nprint 5\n}";
            let spy = chai.spy();
            cfxExec(src, spy);
            expect(spy).to.have.been.called.with(5);
        });

        it("should not execute an if stmt with a false condition", () => {
            let src = `
            if (false) {
                print 5
            }
            `;
            let spy = chai.spy();
            cfxExec(src, spy);
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
            cfxExec(src, spy);
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
            cfxExec(src, spy);
            expect(spy).not.to.have.been.called.with(5);
        });
    });

    /*
    describe("while loops", () => {
        let src = `
        var a = 0
        while (a < 10) {
            print a
            a = a + 1
        }
        `
        it("should loop until the condition is met", () => {
            let spy = chai.spy();
            cfxExec(src, spy);
            expect(spy).to.have.been.called.exactly(10);
        });
    });
    */

    describe("variables", () => {
        it("should be able to access a variable", () => {
            let src = "var a = 14";
            let scope: Scope = cfxExec(src).state;
            expect(cfxEval("a", scope)).to.equal(14);
        });

        it("should be able to assign to a variable", () => {
            let scope = cfxExec("var a = 14\na = 15").state;
            expect(cfxEval("a", scope)).to.equal(15);
        });
    });

    describe("functions", () => {
        describe("argless functions", () => {
            let src = `
            fun a() {
                print 5
            }
            `
            it("should not throw on function definition", () => {
                expect(() => cfxExec(src, () => {})).to.not.throw();
            });

            it("should not run the definition of a function", () => {
                let spy = chai.spy();
                cfxExec(src, spy);
                expect(spy).not.to.have.been.called();
            });

            it("should be callable", () => {
                let src2 = src + "a()";
                let spy = chai.spy();
                cfxExec(src2, spy);
                expect(spy).to.have.been.called.once;
                expect(spy).to.have.been.called.with(5);
            });

            it("shouldn't care about whitespace in a function", () => {
                let src = `
                {
                    fun a() { 5 }

                    a()
                }
                `;
                expect(cfxEval(src)).to.equal(5);
            });
        });

        describe("functions with arguments", () => {
           let src = `
           fun a(a, b) {
                print a + b
           }
           `;
            it("should not throw on function definition", () => {
                expect(() => cfxExec(src, () => {})).to.not.throw();
            });

            it("should not run the definition of a function", () => {
                let spy = chai.spy();
                cfxExec(src, spy);
                expect(spy).not.to.have.been.called();
            });

            it("should be callable", () => {
                let src2 = src + "a(5, 6)";
                let spy = chai.spy();
                cfxExec(src2, spy);
                expect(spy).to.have.been.called.once;
                expect(spy).to.have.been.called.with(11);
            });

            it("should have the correct scope", () => {
                let src = `
                {
                    fun sum(a, b) {
                        a + b
                    }

                    sum(4, 7)
                }
                `;
                expect(cfxEval(src)).to.equal(11);
            });

            it("should allow recursion", () => {
                let src = `
                {
                    fun fac(a) {
                        if (a == 0) {
                            1
                        } else {
                            a * fac(a-1)
                        }
                    }

                    fac(4)
                }
                `;
                expect(cfxEval(src)).to.equal(24);
            });

            it("should be able to implement fib", () => {
                let src = `
                {
                    fun fib(a) {
                        if (a == 0 or a == 1) {
                            1
                        } else {
                            print a
                            fib(a-1) + fib(a-2)
                        }
                    }

                    fib(4)
                }
                `
                expect(cfxEval(src)).to.equal(5);
            });

            it("should be able to be passed into another function", () => {
                let src = `
                {
                    fun a(a, b) {
                        a + b
                    }

                    fun b(a, b, c) {
                        a(b, c)
                    }

                    b(a, 4, 5)
                }
                `
                expect(cfxEval(src)).to.equal(9)
            });
        });
    });
});
