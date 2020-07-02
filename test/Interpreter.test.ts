import {
    setPrintFn,
    stlEval as _stlEval,
    stlExec as _stlExec,
    exprEval,
    getState
} from "../src/Interpreter";
import { Expr } from "../src/Expr";
import Scope from "../src/Scope";
import chai = require("chai");
import spies = require("chai-spies");
chai.use(spies);
const expect = chai.expect;

const stlEval = (src: string, scope: Scope = new Scope()) => {
    return _stlEval(src, scope);
};

const stlExec = (src: string, printfn = null) => {
    if (printfn) setPrintFn(printfn);
    return _stlExec(src);
};

describe("stlEval()", () => {
    describe("literals", () => {
        it("should evaluate number literals", () => {
            expect(stlEval("2")).to.equal(2);
            expect(stlEval("-2")).to.equal(-2);
        });

        it("should evaluate string literals", () => {
            let src = `"happy day"`;
            let result = stlEval(src);
            expect(result).to.equal("happy day");
        });

        it("should evaluate boolean literals", () => {
            let src = "true";
            let result = stlEval(src);
            expect(result).to.equal(true);
        });
    });

    describe("math", () => {
        it("should do addition correctly", () => {
            let src = "2 + 2";
            let result = stlEval(src);
            expect(result).to.equal(4);
        });

        it("should do subtraction correctly", () => {
            let src = "2 - 2";
            let result = stlEval(src);
            expect(result).to.equal(0);
        });

        it("should do multiplication correctly", () => {
            let src = "2 * 5";
            let result = stlEval(src);
            expect(result).to.equal(10);
        });

        it("should do division correctly", () => {
            let src = "2 / 2";
            let result = stlEval(src);
            expect(result).to.equal(1);
        });

        it("should do floating point division correctly", () => {
            let src = "5 / 2";
            let result = stlEval(src);
            expect(result).to.equal(2.5);
        });

        it("should follow order of operations", () => {
            let src = "5 / 5 + 3 * 2";
            let result = stlEval(src);
            expect(result).to.equal(7);
        });

        it("should evaluate a modulus correctly", () => {
            expect(stlEval("5 % 5")).to.equal(0);
            expect(stlEval("5 % 4")).to.equal(1);
            expect(stlEval("5 % 2")).to.equal(1);
        });
    });

    describe("comparisions", () => {
        it("should handle equality checks", () => {
            expect(stlEval("2 == 2")).to.equal(true);
            expect(stlEval("2 == 3")).to.equal(false);
        });

        it("should handle greater equal", () => {
            expect(stlEval("2 >= 2")).to.equal(true);
            expect(stlEval("1 >= 2")).to.equal(false);
        });

        it("should handle less equal", () => {
            expect(stlEval("2 <= 2")).to.equal(true);
            expect(stlEval("4 <= 3")).to.equal(false);
        });

        it("should handle greater than", () => {
            expect(stlEval("2 > 1")).to.equal(true);
            expect(stlEval("1 > 2")).to.equal(false);
        });

        it("should handle less than", () => {
            expect(stlEval("2 < 3")).to.equal(true);
            expect(stlEval("4 < 3")).to.equal(false);
        });
    });

    describe("booleans", () => {
        it("should evaluate logical AND correctly", () => {
            expect(stlEval("true and true")).to.equal(true);
            expect(stlEval("true and false")).to.equal(false);
            expect(stlEval("false and true")).to.equal(false);
            expect(stlEval("false and false")).to.equal(false);
        });

        it("should evaluate logical OR correctly", () => {
            expect(stlEval("true or true")).to.equal(true);
            expect(stlEval("true or false")).to.equal(true);
            expect(stlEval("false or true")).to.equal(true);
            expect(stlEval("false or false")).to.equal(false);
        });

        it("should evaluate logical NOT correctly", () => {
            expect(stlEval("not true")).to.equal(false);
            expect(stlEval("not false")).to.equal(true);
        });

        it("should handle logical NOT at a lower precedence than AND and OR", () => {
            expect(stlEval("not true and false")).to.equal(false);
        });

        it("should evaluate block stmts", () => {
            let src = `
            {
                let a = 5
                let b = -3
                a + b
            }
            `;
            expect(stlEval(src)).to.equal(2);
        });

        it("should evaluate if stmts", () => {
            expect(
                stlEval(
                    `
                let a = 5
                if a == 5 {
                    6
                } else {
                    7
                }
                `
                )
            ).to.equal(6);
        });

        it("should evaluate while stmts", () => {
            expect(
                stlEval(
                    `
                var a = 0
                while a < 5 {
                    a = a + 1
                }
                `
                )
            ).to.equal(5);
        });

        it("should evalulate until stmts", () => {
            expect(
                stlEval(
                    `
                var a = 0
                until a == 5 {
                    a = a + 1
                }
                `
                )
            ).to.equal(5);
        });
    });

    describe("errors", () => {
        it("should throw on an invalid expression type", () => {
            class UnhandledExpr implements Expr {
                copy = () => this;
                map = () => this;
            }
            expect(() => exprEval(new UnhandledExpr(), new Scope())).to.throw();
        });
    });
});

describe("exec()", () => {
    describe("if statements", () => {
        it("should execute an if stmt with true condition", () => {
            let src = "if (true) {\nprint 5\n}";
            let spy = chai.spy();
            stlExec(src, spy);
            expect(spy).to.have.been.called.with(5);
        });

        it("should not execute an if stmt with a false condition", () => {
            let src = `
            if (false) {
                print 5
            }
            `;
            let spy = chai.spy();
            stlExec(src, spy);
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
            stlExec(src, spy);
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
            stlExec(src, spy);
            expect(spy).not.to.have.been.called.with(5);
        });

        it("should support no parentheses", () => {
            let src = `
            if false {
                print 5
            } else {
                print 6
            }
            `;
            let spy = chai.spy();
            stlExec(src, spy);
            expect(spy).not.to.have.been.called.with(5);
            expect(spy).to.have.been.called.with(6);
        });

        it("should support then", () => {
            expect(
                stlEval(
                    `
                let a = if false then 5 else 6
                `
                )
            ).to.equal(6);
        });
    });

    describe("while loops", () => {
        let src = `
        var a = 0
        while (a < 10) {
            print a
            a = a + 1
        }
        `;
        it("should loop until the condition is met", () => {
            let spy = chai.spy();
            stlExec(src, spy);
            expect(spy).to.have.been.called.exactly(10);
        });
    });

    describe("variables", () => {
        it("should be able to access a variable", () => {
            let src = "var a = 14";
            let scope: Scope = getState(stlExec(src));
            expect(stlEval("a", scope)).to.equal(14);
        });

        it("should be able to assign to a variable", () => {
            let scope = getState(stlExec("var a = 14\na = 15"));
            expect(stlEval("a", scope)).to.equal(15);
        });
    });

    describe("functions", () => {
        describe("argless functions", () => {
            let src = `
            fun a = () -> {
                print 5
            }
            `;
            it("should not throw on function definition", () => {
                expect(() => stlExec(src, () => {})).to.not.throw();
            });

            it("should not run the definition of a function", () => {
                let spy = chai.spy();
                stlExec(src, spy);
                expect(spy).not.to.have.been.called();
            });

            it("should be callable", () => {
                let src2 = src + "a()";
                let spy = chai.spy();
                stlExec(src2, spy);
                expect(spy).to.have.been.called.once;
                expect(spy).to.have.been.called.with(5);
            });

            it("shouldn't care about whitespace in a function", () => {
                let src = `
                fun a = () -> { 5 }

                a()
                `;
                expect(stlEval(src)).to.equal(5);
            });

            it("should allow early returns", () => {
                let src = `
                fun a = () -> {
                    return 5
                    6
                }

                a()
                `;
                expect(stlEval(src)).to.equal(5);
            });
        });
        describe("functions with arguments", () => {
            let src = `
           fun a = (a, b) -> {
                print a + b
           }
           `;
            it("should not throw on function definition", () => {
                expect(() => stlExec(src, () => {})).to.not.throw();
            });

            it("should not run the definition of a function", () => {
                let spy = chai.spy();
                stlExec(src, spy);
                expect(spy).not.to.have.been.called();
            });

            it("should be callable", () => {
                let src2 = src + "a(5, 6)";
                let spy = chai.spy();
                stlExec(src2, spy);
                expect(spy).to.have.been.called.once;
                expect(spy).to.have.been.called.with(11);
            });

            it("should have the correct scope", () => {
                let src = `
                let a = 42
                let b = 16
                fun sum = (a, b) -> {
                    a + b
                }

                sum(4, 7)
                `;
                expect(stlEval(src)).to.equal(11);
            });

            it("should allow recursion", () => {
                let src = `
                fun fac = (a) -> {
                    if (a == 0) {
                        1
                    } else {
                        a * fac(a-1)
                    }
                }

                fac(4)
                `;
                expect(stlEval(src)).to.equal(24);
            });

            it("should be able to implement fib", () => {
                let src = `
                fun fib = (a) -> {
                    if (a == 0 or a == 1) {
                        1
                    } else {
                        fib(a-1) + fib(a-2)
                    }
                }

                fib(4)
                `;
                expect(stlEval(src)).to.equal(5);
            });

            it("should be able to be passed into another function", () => {
                let src = `
                fun a = (a, b) -> {
                    a + b
                }

                fun b = (a, b, c) -> {
                    a(b, c)
                }

                b(a, 4, 5)
                `;
                expect(stlEval(src)).to.equal(9);
            });
        });

        describe("lambdas", () => {
            it("should permit anonymous function style declaration", () => {
                let src = `
               let a = (a, b) -> {
                   a * b
               }

               a(5, 6)
               `;
                expect(stlEval(src)).to.equal(30);
            });

            it("should allow anonymous functions to be passed inline", () => {
                let src = `
                let math = (a, b, c) -> {
                    a(b) * c
                }

                math(a -> { a + 3 }, 2, 3)
                `;
                expect(stlEval(src)).to.equal(15);
            });

            it("should allow short lambda syntax without parentheses", () => {
                expect(
                    stlEval(
                        `
                let double = a -> a * 2

                double(2)
                `
                    )
                ).to.equal(4);
            });

            it("should allow short lambda syntax with parentheses", () => {
                expect(
                    stlEval(
                        `
                let double = (a) -> a * 2

                double(2)
                `
                    )
                ).to.equal(4);
            });

            it("should allow short lambda syntax with parentheses and multiple args", () => {
                expect(
                    stlEval(
                        `
                let sum = (a, b) -> a + b

                sum(2, 6)
                `
                    )
                ).to.equal(8);
            });

            it("should allow a returned function to be called", () => {
                expect(
                    stlEval(
                        `
                    fun a = () -> {
                        fun b = () -> {
                            5
                        }
                    }

                    a()()
                    `
                    )
                ).to.equal(5);
            });

            it("should throw if a noncallable object is called", () => {
                expect(() =>
                    stlEval(
                        `
                    5()
                    `
                    )
                ).to.throw("Can't call 5 because it is not a function.");
            });
        });

        describe("hoisted functions", () => {
            it("should allow a basic hoisted function", () => {
                expect(
                    stlEval(
                        `
                    getFive()

                    fun getFive = () -> 5
                    `
                    )
                ).to.equal(5);
            });
        });
    });

    describe("pattern matching", () => {
        it("should not throw on match keyword", () => {
            expect(() =>
                stlEval(
                    `
                let x = 15
                match x {
                    15 => "correct"
                    _ => "wrong"
                }
                `
                )
            ).to.not.throw();
        });

        it("should return the appropriate value", () => {
            expect(
                stlEval(
                    `
                let x = 15
                match x {
                    15 => "correct"
                    _ => "wrong"
                }
                `
                )
            ).to.equal("correct");
        });

        it("should be able to be used as an expression", () => {
            let spy = chai.spy();
            stlExec(
                `
                let a = 4
                let b = a - 2
                let c = a/b
                print match c {
                    3 => "nope"
                    4 => "def nope"
                    _ => "yep"
                }
                `,
                spy
            );
            expect(spy).to.have.be.called.with("yep");
        });

        it("should be able to match strings", () => {
            expect(
                stlEval(
                    `
                let x = "hello"
                match x {
                    "hello" => "correct"
                    _ => "incorrect"
                }
                `
                )
            ).to.equal("correct");
        });

        it("should be able to match booleans", () => {
            expect(
                stlEval(
                    `
                match true {
                    true => "correct"
                    false => "wrong"
                    _ => "really wrong"
                }
                `
                )
            ).to.equal("correct");
        });
    });
});
