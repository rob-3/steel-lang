import { Either } from "purify-ts";
import { Expr } from "../src/Expr";
import { stlEval as _stlEval } from "../src/Interpreter";
import { setPrintFn } from "../src/Logger";
import parse from "../src/Parser";
import Scope from "../src/Scope";
import { run } from "../src/steel";
import tokenize from "../src/Tokenizer";
import { Value, UnboxedValue } from "../src/Value";
import chai = require("chai");
import spies = require("chai-spies");
chai.use(spies);
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

const stlExec = (
    src: string,
    printfn: ((a: any) => void) | null = null
): [Value | null, Scope] => {
    if (printfn !== null) setPrintFn(printfn);
    const val = _stlEval(src, new Scope());
    try {
        return val.unsafeCoerce();
    } catch (e) {
        console.log(val);
        throw e;
    }
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
                let ~a = 0
                while ~a < 5 {
                    ~a = ~a + 1
                }
                `
                )
            ).to.equal(5);
        });
    });

    describe("arrays", () => {
        it("should not throw on empty array literal", () => {
            expect(() => stlEval(`let arr = []`)).to.not.throw();
        });

        it("should allow nonempty array literals", () => {
            expect(() => stlEval("let arr = [1, 2, 3]")).to.not.throw();
        });

        it("should allow indexing arrays with zero", () => {
            expect(
                stlEval(
                    `
                let a = [1, 2, 3]
                a[0]
                `
                )
            ).to.equal(1);
        });

        it("should allow indexing arrays with nonzero values", () => {
            expect(
                stlEval(
                    `
                let a = [1, 2, 3]
                a[2]
                `
                )
            ).to.equal(3);
        });
    });
});

describe("exec()", () => {
    describe("if statements", () => {
        it("should execute an if stmt with true condition", () => {
            let src = "if (true) {\nprint(5)\n}";
            let spy = chai.spy();
            stlExec(src, spy);
            expect(spy).to.have.been.called.with(5);
        });

        it("should not execute an if stmt with a false condition", () => {
            let src = `
            if (false) {
                print(5)
            }
            `;
            let spy = chai.spy();
            stlExec(src, spy);
            expect(spy).not.to.have.been.called();
        });

        it("should execute the else body stmt with a false condition", () => {
            let src = `
            if (false) {
                print(5)
            } else {
                print(6)
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
                print(5)
            } else {
                print(6)
            }
            `;
            let spy = chai.spy();
            stlExec(src, spy);
            expect(spy).not.to.have.been.called.with(5);
        });

        it("should support no parentheses", () => {
            let src = `
            if false {
                print(5)
            } else {
                print(6)
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
        let ~a = 0
        while (~a < 10) {
            print(~a)
            ~a = ~a + 1
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
            let src = "let ~a = 14";
            let scope: Scope = stlExec(src)[1];
            expect(stlEval("~a", scope)).to.equal(14);
        });

        it("should be able to assign to a variable", () => {
            let scope = stlExec("let ~a = 14\n~a = 15")[1];
            expect(stlEval("~a", scope)).to.equal(15);
        });

        it("should allow a variable declaration to spill over lines", () => {
            expect(
                stlEval(
                    `
                let ~x =
                    42 + 13 + 3
                `
                )
            ).to.equal(42 + 13 + 3);
        });

        it("should allow assignment to spill over lines", () => {
            expect(
                stlEval(
                    `
                    let ~x = 3
                    ~x = 
                        6
                    ~x
                    `
                )
            ).to.equal(6);
        });

        it("should allow nonlocal shadowing", () => {
            let spy = chai.spy();
            stlExec(
                ` 
                let a = 4 
                let b = 6
                let addTwo = (n) -> {
                    let a = 2
                    a + n
                }
                print(addTwo(13))
                print(a)
                `,
                spy
            );
            expect(spy).to.have.been.called.twice;
            expect(spy).to.have.been.called.with(15);
            expect(spy).to.have.been.called.with(4);
        });

        it("should prohibit local shadowing", () => {
            expect(() =>
                stlEval(
                    `
                let a = 4
                let a = 5
                `
                )
            ).to.throw();
        });
    });

    describe("functions", () => {
        describe("argless functions", () => {
            let src = `
            fun a = () -> {
                print(5)
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

            it("should not be able to access variable declared after", () => {
                expect(() =>
                    stlEval(
                        `
                    let print_a = () -> print(a)
                    let a = 4
                    print_a()
                    `
                    )
                ).to.throw(`Variable "a" is not defined.`);
            });
        });
        describe("functions with arguments", () => {
            let src = `
           fun a = (a, b) -> {
                print(a + b)
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
                    if (a == 0) {
                        0
                    } else if (a == 1) {
                        1
                    } else {
                        fib(a-1) + fib(a-2)
                    }
                }

                fib(6)
                `;
                expect(stlEval(src)).to.equal(8);
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

            it("should allow a zero argument lambda", () => {
                expect(
                    stlEval(
                        `
                    let a = 4
                    let getA = () -> a
                    getA()
                    `
                    )
                ).to.equal(4);
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
                expect(() => stlEval("5()")).to.throw(
                    "Can't call 5 because it is not a function."
                );
            });
        });

        /* TODO fix this behavior without unsafeCoerce
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
        */
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
                print(match c {
                    3 => "nope"
                    4 => "def nope"
                    _ => "yep"
                })
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

    describe("objects", () => {
        it("should not throw on definition", () => {
            expect(() =>
                stlEval(
                    `
                let obj = {
                    a: 72
                }
                `
                )
            ).to.not.throw();
        });

        it("should allow comma separated properties", () => {
            expect(() =>
                stlEval(
                    `
                let obj = {
                    a: 72,
                    b: 73
                }
                `
                )
            ).to.not.throw();
        });

        it("should allow trailing comma", () => {
            expect(() =>
                stlEval(
                    `
                let obj = {
                    a: 72,
                    b: 73,
                }
                `
                )
            ).to.not.throw();
        });

        it("should allow shadowed identifiers", () => {
            expect(() =>
                stlEval(
                    `
                let obj = {
                    obj: 72
                }
                `
                )
            ).to.not.throw();
        });

        /*
        it.only("should allow keyword identifiers", () => {
            expect(() =>
                stlEval(
                    `
                let obj = {
                    let: 72
                }
                `
                )
            ).to.not.throw();
        });
        */
        it("should allow dot notation with an identifier", () => {
            expect(
                stlEval(
                    `
                    let obj = {
                        a: 72
                    }
                    obj.a
                    `
                )
            ).to.equal(72);
        });

        it("should not allow assignment to an immutable object's properties", () => {
            expect(() =>
                stlEval(
                    `
                    let obj = {
                        a: 42
                    }
                    obj.a = 43
                    `
                )
            ).to.throw();
        });

        it("should allow assignment to a mutable object's properties", () => {
            expect(
                stlEval(
                    `
                    let ~obj = {
                        a: 42
                    }
                    ~obj.a = 43
                    ~obj.a
                    `
                )
            ).to.equal(43);
        });
    });

    describe("pass by reference semantics", () => {
        it("should properly handle assignment within a function", () => {
            expect(
                stlEval(`
                    let ~val = 5
                    let addTwo = ~a -> ~a = ~a + 2
                    addTwo(~val)
                    ~val
               `)
            ).to.equal(7);
        });

        it("should not allow assignment to an immutable argument", () => {
            expect(() =>
                stlEval(`
                    let ~val = 5
                    let addTwo = a -> a = a + 2
                    addTwo(~val)
                    ~val
               `)
            ).to.throw(`Cannot assign to immutable variable "a"`);
        });
    });
});

describe("debug", () => {
    it("should print an error correctly", () => {
        expect(() => stlEval("print(hi)")).to.throw(
            `Variable "hi" is not defined.`
        );
    });

    it("should return old scope if error occurs", () => {
        expect(run("a", false, new Scope(), "<anonymous>")).to.not.be.undefined;
    });

    it("should not allow reassignment to an immutable variable", () => {
        expect(() => stlEval("let a = 5\na = 6")).to.throw(
            `Cannot assign to immutable variable "a".`
        );
    });

    it("should not loop if parsing fails", () => {
        // will hang if this test fails
        try {
            stlEval(")");
        } catch {}
    });

    it("should show the correct filename on a test", () => {
        /* FIXME remove
        let wasAnonymous = true;
        const printfn = (v: Value) => {
            console.log(v);
            console.log((<string>v).includes("anonymous"));
            wasAnonymous = (<string>v).includes("anonymous");
        };
        setPrintFn(printfn);
        */
        const tokens = tokenize("a = ", "filename");
        const ast: Either<Error[], Expr[]> = tokens.chain(parse);
        expect(ast.isLeft()).to.be.true;
        expect(
            ast.mapLeft((errs) =>
                errs
                    .map((err) => err.message)
                    .map((message) => message.includes("filename"))
                    .reduce((acc, cur) => acc && cur, true)
            )
        );
        // FIXME remove
        //expect(wasAnonymous).to.be.false;
    });
});
