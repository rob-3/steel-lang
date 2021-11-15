import { Either } from "purify-ts";
import { Expr } from "../src/Expr";
import { stlEval as _stlEval } from "../src/Interpreter";
import { setPrintFn } from "../src/Logger";
import parse from "../src/Parser";
import Scope from "../src/Scope";
import { run } from "../src/steel";
import tokenize from "../src/Tokenizer";
import { Value, UnboxedValue } from "../src/Value";
import StlNumber from "../src/StlNumber";

// silence logs unless we're debugging
console.log = () => {};

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
            expect(stlEval("2")).toEqual(new StlNumber(2n));
            expect(stlEval("-2")).toEqual(new StlNumber(-2n));
        });

        it("should evaluate string literals", () => {
            let src = `"happy day"`;
            let result = stlEval(src);
            expect(result).toBe("happy day");
        });

        it("should evaluate boolean literals", () => {
            let src = "true";
            let result = stlEval(src);
            expect(result).toBe(true);
        });
    });

    describe("math", () => {
        it("should do addition correctly", () => {
            let src = "2 + 2";
            let result = stlEval(src);
            expect(result).toEqual(new StlNumber(4n));
        });

        it("should do subtraction correctly", () => {
            let src = "2 - 2";
            let result = stlEval(src);
            expect(result).toEqual(new StlNumber(0n));
        });

        it("should do multiplication correctly", () => {
            let src = "2 * 5";
            let result = stlEval(src);
            expect(result).toEqual(new StlNumber(10n));
        });

        it("should do division correctly", () => {
            let src = "2 / 2";
            let result = stlEval(src);
            expect(result).toEqual(new StlNumber(1n));
        });

        it("should do floating point division correctly", () => {
            let src = "5 / 2";
            let result = stlEval(src);
            expect(result).toEqual(StlNumber.of("2.5"));
        });

        it("should follow order of operations", () => {
            let src = "5 / 5 + 3 * 2";
            let result = stlEval(src);
            expect(result).toEqual(new StlNumber(7n));
        });

        it("should evaluate a modulus correctly", () => {
            expect(stlEval("5 % 5")).toEqual(new StlNumber(0n));
            expect(stlEval("5 % 4")).toEqual(new StlNumber(1n));
            expect(stlEval("5 % 2")).toEqual(new StlNumber(1n));
        });

        it("should not fall victim to floating point errors", () => {
            expect(stlEval("0.1 + 0.2")).toEqual(StlNumber.of("0.3"));
        });
    });

    describe("comparisions", () => {
        it("should handle equality checks", () => {
            expect(stlEval("2 == 2")).toBe(true);
            expect(stlEval("2 == 3")).toBe(false);
        });

        it("should handle greater equal", () => {
            expect(stlEval("2 >= 2")).toBe(true);
            expect(stlEval("1 >= 2")).toBe(false);
        });

        it("should handle less equal", () => {
            expect(stlEval("2 <= 2")).toBe(true);
            expect(stlEval("4 <= 3")).toBe(false);
        });

        it("should handle greater than", () => {
            expect(stlEval("2 > 1")).toBe(true);
            expect(stlEval("1 > 2")).toBe(false);
        });

        it("should handle less than", () => {
            expect(stlEval("2 < 3")).toBe(true);
            expect(stlEval("4 < 3")).toBe(false);
        });
    });

    describe("booleans", () => {
        it("should evaluate logical AND correctly", () => {
            expect(stlEval("true and true")).toBe(true);
            expect(stlEval("true and false")).toBe(false);
            expect(stlEval("false and true")).toBe(false);
            expect(stlEval("false and false")).toBe(false);
        });

        it("should evaluate logical OR correctly", () => {
            expect(stlEval("true or true")).toBe(true);
            expect(stlEval("true or false")).toBe(true);
            expect(stlEval("false or true")).toBe(true);
            expect(stlEval("false or false")).toBe(false);
        });

        it("should evaluate logical NOT correctly", () => {
            expect(stlEval("not true")).toBe(false);
            expect(stlEval("not false")).toBe(true);
        });

        it("should handle logical NOT at a lower precedence than AND and OR", () => {
            expect(stlEval("not true and false")).toBe(false);
        });

        it("should evaluate block stmts", () => {
            let src = `
            {
                let a = 5
                let b = -3
                a + b
            }
            `;
            expect(stlEval(src)).toEqual(new StlNumber(2n));
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
            ).toEqual(new StlNumber(6n));
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
            ).toEqual(new StlNumber(5n));
        });
    });

    describe("arrays", () => {
        it("should not throw on empty array literal", () => {
            expect(() => stlEval(`let arr = []`)).not.toThrow();
        });

        it("should allow nonempty array literals", () => {
            expect(() => stlEval("let arr = [1, 2, 3]")).not.toThrow();
        });

        it("should allow indexing arrays with zero", () => {
            expect(
                stlEval(
                    `
                let a = [1, 2, 3]
                a[0]
                `
                )
            ).toEqual(new StlNumber(1n));
        });

        it("should allow indexing arrays with nonzero values", () => {
            expect(
                stlEval(
                    `
                let a = [1, 2, 3]
                a[2]
                `
                )
            ).toEqual(new StlNumber(3n));
        });
    });
});

describe("exec()", () => {
    describe("if statements", () => {
        it("should execute an if stmt with true condition", () => {
            let src = "if (true) {\nprint(5)\n}";
            let spy = jest.fn();
            stlExec(src, spy);
            expect(spy.mock.calls).toEqual([[new StlNumber(5n)]]);
        });

        it("should not execute an if stmt with a false condition", () => {
            let src = `
            if (false) {
                print(5)
            }
            `;
            let spy = jest.fn();
            stlExec(src, spy);
            expect(spy.mock.calls).toEqual([]);
        });

        it("should execute the else body stmt with a false condition", () => {
            let src = `
            if (false) {
                print(5)
            } else {
                print(6)
            }
            `;
            let spy = jest.fn();
            stlExec(src, spy);
            expect(spy.mock.calls).toEqual([[new StlNumber(6n)]]);
        });

        it("should not execute the if body with a false condition", () => {
            let src = `
            if (false) {
                print(5)
            } else {
                print(6)
            }
            `;
            let spy = jest.fn();
            stlExec(src, spy);
            expect(spy.mock.calls).not.toContain(5);
        });

        it("should support no parentheses", () => {
            let src = `
            if false {
                print(5)
            } else {
                print(6)
            }
            `;
            let spy = jest.fn();
            stlExec(src, spy);
            expect(spy.mock.calls).not.toContainEqual(new StlNumber(5n));
            expect(spy.mock.calls).toContainEqual([new StlNumber(6n)]);
        });

        it("should support then", () => {
            expect(
                stlEval(
                    `
                let a = if false then 5 else 6
                `
                )
            ).toEqual(new StlNumber(6n));
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
            let spy = jest.fn();
            stlExec(src, spy);
            expect(spy.mock.calls.length).toBe(10);
        });
    });

    describe("variables", () => {
        it("should be able to access a variable", () => {
            let src = "let ~a = 14";
            let scope: Scope = stlExec(src)[1];
            expect(stlEval("~a", scope)).toEqual(new StlNumber(14n));
        });

        it("should be able to assign to a variable", () => {
            let scope = stlExec("let ~a = 14\n~a = 15")[1];
            expect(stlEval("~a", scope)).toEqual(new StlNumber(15n));
        });

        it("should allow a variable declaration to spill over lines", () => {
            expect(
                stlEval(
                    `
                let ~x =
                    42 + 13 + 3
                `
                )
            ).toEqual(StlNumber.of(42 + 13 + 3));
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
            ).toEqual(new StlNumber(6n));
        });

        it("should allow nonlocal shadowing", () => {
            let spy = jest.fn();
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
            expect(spy.mock.calls).toEqual([
                [new StlNumber(15n)],
                [new StlNumber(4n)],
            ]);
        });

        it("should prohibit local shadowing", () => {
            expect(() =>
                stlEval(
                    `
                let a = 4
                let a = 5
                `
                )
            ).toThrow();
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
                expect(() => stlExec(src, () => {})).not.toThrow();
            });

            it("should not run the definition of a function", () => {
                let spy = jest.fn();
                stlExec(src, spy);
                expect(spy.mock.calls.length).toBe(0);
            });

            it("should be callable", () => {
                let src2 = src + "a()";
                let spy = jest.fn();
                stlExec(src2, spy);
                expect(spy.mock.calls).toEqual([[new StlNumber(5n)]]);
            });

            it("shouldn't care about whitespace in a function", () => {
                let src = `
                fun a = () -> { 5 }

                a()
                `;
                expect(stlEval(src)).toEqual(new StlNumber(5n));
            });

            it("should allow early returns", () => {
                let src = `
                fun a = () -> {
                    return 5
                    6
                }

                a()
                `;
                expect(stlEval(src)).toEqual(new StlNumber(5n));
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
                ).toThrow(`Variable "a" is not defined.`);
            });
        });
        describe("functions with arguments", () => {
            let src = `
           fun a = (a, b) -> {
                print(a + b)
           }
           `;
            it("should not throw on function definition", () => {
                expect(() => stlExec(src, () => {})).not.toThrow();
            });

            it("should not run the definition of a function", () => {
                let spy = jest.fn();
                stlExec(src, spy);
                expect(spy.mock.calls).toEqual([]);
            });

            it("should be callable", () => {
                let src2 = src + "a(5, 6)";
                let spy = jest.fn();
                stlExec(src2, spy);
                expect(spy.mock.calls).toEqual([[new StlNumber(11n)]]);
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
                expect(stlEval(src)).toEqual(new StlNumber(11n));
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
                expect(stlEval(src)).toEqual(new StlNumber(24n));
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
                expect(stlEval(src)).toEqual(new StlNumber(8n));
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
                expect(stlEval(src)).toEqual(new StlNumber(9n));
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
                expect(stlEval(src)).toEqual(new StlNumber(30n));
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
                ).toEqual(new StlNumber(4n));
            });

            it("should allow anonymous functions to be passed inline", () => {
                let src = `
                let math = (a, b, c) -> {
                    a(b) * c
                }

                math(a -> { a + 3 }, 2, 3)
                `;
                expect(stlEval(src)).toEqual(new StlNumber(15n));
            });

            it("should allow short lambda syntax without parentheses", () => {
                expect(
                    stlEval(
                        `
                let double = a -> a * 2

                double(2)
                `
                    )
                ).toEqual(new StlNumber(4n));
            });

            it("should allow short lambda syntax with parentheses", () => {
                expect(
                    stlEval(
                        `
                let double = (a) -> a * 2

                double(2)
                `
                    )
                ).toEqual(new StlNumber(4n));
            });

            it("should allow short lambda syntax with parentheses and multiple args", () => {
                expect(
                    stlEval(
                        `
                let sum = (a, b) -> a + b

                sum(2, 6)
                `
                    )
                ).toEqual(new StlNumber(8n));
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
                ).toEqual(new StlNumber(5n));
            });

            it("should throw if a noncallable object is called", () => {
                expect(() => stlEval("5()")).toThrow(
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
                ).toEqual(new StlNumber(5n));
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
            ).not.toThrow();
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
            ).toBe("correct");
        });

        it("should be able to be used as an expression", () => {
            let spy = jest.fn();
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
            expect(spy.mock.calls).toEqual([["yep"]]);
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
            ).toBe("correct");
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
            ).toBe("correct");
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
            ).not.toThrow();
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
            ).not.toThrow();
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
            ).not.toThrow();
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
            ).not.toThrow();
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
            ).not.toThrow();
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
            ).toEqual(new StlNumber(72n));
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
            ).toThrow();
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
            ).toEqual(new StlNumber(43n));
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
            ).toEqual(new StlNumber(7n));
        });

        it("should not allow assignment to an immutable argument", () => {
            expect(() =>
                stlEval(`
                    let ~val = 5
                    let addTwo = a -> a = a + 2
                    addTwo(~val)
                    ~val
               `)
            ).toThrow(`Cannot assign to immutable variable "a"`);
        });
    });
});

describe("debug", () => {
    it("should print an error correctly", () => {
        expect(() => stlEval("print(hi)")).toThrow(
            `Variable "hi" is not defined.`
        );
    });

    it("should return old scope if error occurs", () => {
        expect(run("a", false, new Scope(), "<anonymous>")).toBeDefined();
    });

    it("should not allow reassignment to an immutable variable", () => {
        expect(() => stlEval("let a = 5\na = 6")).toThrow(
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
        expect(ast.isLeft()).toBe(true);
        expect(
            ast.mapLeft((errs) =>
                errs
                    .map((err) => err.message)
                    .map((message) => message.includes("filename"))
                    .reduce((acc, cur) => acc && cur, true)
            )
        );
        // FIXME remove
        //expect(wasAnonymous).toBe.false;
    });
});
