import { Either } from "purify-ts";
import { ExprBase } from "../src/Expr.js";
import parse from "../src/Parser.js";
import tokenize from "../src/Tokenizer.js";
import StlNumber from "../src/StlNumber.js";
import { describe, it, expect, vi as jest } from "vitest";
import { stlEval, stlEvalMockPrint } from "./Helpers.js";
import { stlEval as fullStlEval } from "../src/Interpreter.js";

describe("stlEval()", () => {
	describe("literals", () => {
		it("should evaluate number literals", () => {
			expect(stlEval("2")).toEqual(new StlNumber(2n));
			expect(stlEval("-2")).toEqual(new StlNumber(-2n));
		});

		it("should evaluate string literals", () => {
			const src = `"happy day"`;
			const result = stlEval(src);
			expect(result).toBe("happy day");
		});

		it("should evaluate boolean literals", () => {
			const src = "true";
			const result = stlEval(src);
			expect(result).toBe(true);
		});
	});

	describe("math", () => {
		it("should do addition correctly", () => {
			const src = "2 + 2";
			const result = stlEval(src);
			expect(result).toEqual(new StlNumber(4n));
		});

		it("should do subtraction correctly", () => {
			const src = "2 - 2";
			const result = stlEval(src);
			expect(result).toEqual(new StlNumber(0n));
		});

		it("should do multiplication correctly", () => {
			const src = "2 * 5";
			const result = stlEval(src);
			expect(result).toEqual(new StlNumber(10n));
		});

		it("should do division correctly", () => {
			const src = "2 / 2";
			const result = stlEval(src);
			expect(result).toEqual(new StlNumber(1n));
		});

		it("should do floating point division correctly", () => {
			const src = "5 / 2";
			const result = stlEval(src);
			expect(result).toEqual(StlNumber.of("2.5"));
		});

		it("should follow order of operations", () => {
			const src = "5 / 5 + 3 * 2";
			const result = stlEval(src);
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
			const src = `
            {
                a = 5
                b = -3
                a + b
            }
            `;
			expect(stlEval(src)).toEqual(new StlNumber(2n));
		});

		it("should evaluate if stmts", () => {
			expect(
				stlEval(
					`
                a = 5
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
                var a <- 0
                while a < 5 {
                    a <- a + 1
                }
                `
				)
			).toEqual(new StlNumber(5n));
		});
	});

	describe("arrays", () => {
		it("should not throw on empty array literal", () => {
			expect(() => stlEval(`arr = []`)).not.toThrow();
		});

		it("should allow nonempty array literals", () => {
			expect(() => stlEval("arr = [1, 2, 3]")).not.toThrow();
		});

		it("should allow indexing arrays with zero", () => {
			expect(
				stlEval(
					`
                a = [1, 2, 3]
                a[0]
                `
				)
			).toEqual(new StlNumber(1n));
		});

		it("should allow indexing arrays with nonzero values", () => {
			expect(
				stlEval(
					`
                a = [1, 2, 3]
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
			const src = "if (true) {\nprint(5)\n}";
			const spy = jest.fn();
			stlEvalMockPrint(src, spy);
			expect(spy.mock.calls).toEqual([[new StlNumber(5n)]]);
		});

		it("should not execute an if stmt with a false condition", () => {
			const src = `
            if (false) {
                print(5)
            }
            `;
			const spy = jest.fn();
			stlEvalMockPrint(src, spy);
			expect(spy.mock.calls).toEqual([]);
		});

		it("should execute the else body stmt with a false condition", () => {
			const src = `
            if (false) {
                print(5)
            } else {
                print(6)
            }
            `;
			const spy = jest.fn();
			stlEvalMockPrint(src, spy);
			expect(spy.mock.calls).toEqual([[new StlNumber(6n)]]);
		});

		it("should not execute the if body with a false condition", () => {
			const src = `
            if (false) {
                print(5)
            } else {
                print(6)
            }
            `;
			const spy = jest.fn();
			stlEvalMockPrint(src, spy);
			expect(spy.mock.calls).not.toContain(5);
		});

		it("should support no parentheses", () => {
			const src = `
            if false {
                print(5)
            } else {
                print(6)
            }
            `;
			const spy = jest.fn();
			stlEvalMockPrint(src, spy);
			expect(spy.mock.calls).not.toContainEqual(new StlNumber(5n));
			expect(spy.mock.calls).toContainEqual([new StlNumber(6n)]);
		});

		it("should support then", () => {
			expect(
				stlEval(
					`
                a = if false then 5 else 6
                `
				)
			).toEqual(new StlNumber(6n));
		});
	});

	describe("while loops", () => {
		const src = `
        var a <- 0
        while (a < 10) {
            print(a)
            a <- a + 1
        }
        `;
		it("should loop until the condition is met", () => {
			const spy = jest.fn();
			stlEvalMockPrint(src, spy);
			expect(spy.mock.calls.length).toBe(10);
		});
	});

	describe("variables", () => {
		it("should be able to access a variable", () => {
			const src = "var a <- 14";
			const result = fullStlEval(src);
			expect(stlEval("a", result.unsafeCoerce()[1])).toEqual(
				new StlNumber(14n)
			);
		});

		it("should be able to assign to a variable", () => {
			const scope = fullStlEval("var a <- 14\na <- 15").unsafeCoerce()[1];
			expect(stlEval("a", scope)).toEqual(new StlNumber(15n));
		});

		it("should allow a variable declaration to spill over lines", () => {
			expect(
				stlEval(
					`
                var x <-
                    42 + 13 + 3
                `
				)
			).toEqual(StlNumber.of(42 + 13 + 3));
		});

		it("should allow assignment to spill over lines", () => {
			expect(
				stlEval(
					`
                    var x <- 3
                    x <-
                        6
                    x
                    `
				)
			).toEqual(new StlNumber(6n));
		});

		it("should allow nonlocal shadowing", () => {
			const spy = jest.fn();
			stlEvalMockPrint(
				` 
                a = 4 
                b = 6
                addTwo = (n) -> {
                    a = 2
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
			expect(
				stlEval(
					`
                a = 4
                a = 5
                `
				)
			).toEqual([Error(`Cannot redefine immutable variable a.`)]);
		});
	});

	describe("functions", () => {
		describe("argless functions", () => {
			const src = `
            fun a = () -> {
                print(5)
            }
            `;
			it("should not throw on function definition", () => {
				expect(() => stlEvalMockPrint(src, () => {})).not.toThrow();
			});

			it("should not run the definition of a function", () => {
				const spy = jest.fn();
				stlEvalMockPrint(src, spy);
				expect(spy.mock.calls.length).toBe(0);
			});

			it("should be callable", () => {
				const src2 = src + "a()";
				const spy = jest.fn();
				stlEvalMockPrint(src2, spy);
				expect(spy.mock.calls).toEqual([[new StlNumber(5n)]]);
			});

			it("shouldn't care about whitespace in a function", () => {
				const src = `
                fun a = () -> { 5 }

                a()
                `;
				expect(stlEval(src)).toEqual(new StlNumber(5n));
			});

			it("should allow early returns", () => {
				const src = `
                fun a = () -> {
                    return 5
                    6
                }

                a()
                `;
				expect(stlEval(src)).toEqual(new StlNumber(5n));
			});

			it("should not be able to access variable declared after", () => {
				expect(
					stlEval(
						`
                    print_a = () -> print(a)
                    a = 4
                    print_a()
                    `
					)
				).toEqual([Error(`Variable "a" is not defined.`)]);
			});
		});
		describe("functions with arguments", () => {
			const src = `
           fun a = (a, b) -> {
                print(a + b)
           }
           `;
			it("should not throw on function definition", () => {
				expect(() => stlEvalMockPrint(src, () => {})).not.toThrow();
			});

			it("should not run the definition of a function", () => {
				const spy = jest.fn();
				stlEvalMockPrint(src, spy);
				expect(spy.mock.calls).toEqual([]);
			});

			it("should be callable", () => {
				const src2 = src + "a(5, 6)";
				const spy = jest.fn();
				stlEvalMockPrint(src2, spy);
				expect(spy.mock.calls).toEqual([[new StlNumber(11n)]]);
			});

			it("should have the correct scope", () => {
				const src = `
                a = 42
                b = 16
                fun sum = (a, b) -> {
                    a + b
                }

                sum(4, 7)
                `;
				expect(stlEval(src)).toEqual(new StlNumber(11n));
			});

			it("should allow recursion", () => {
				const src = `
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
				const src = `
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
				const src = `
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
				const src = `
               a = (a, b) -> {
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
                    a = 4
                    getA = () -> a
                    getA()
                    `
					)
				).toEqual(new StlNumber(4n));
			});

			it("should allow anonymous functions to be passed inline", () => {
				const src = `
                math = (a, b, c) -> {
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
                double = a -> a * 2

                double(2)
                `
					)
				).toEqual(new StlNumber(4n));
			});

			it("should allow short lambda syntax with parentheses", () => {
				expect(
					stlEval(
						`
                double = (a) -> a * 2

                double(2)
                `
					)
				).toEqual(new StlNumber(4n));
			});

			it("should allow short lambda syntax with parentheses and multiple args", () => {
				expect(
					stlEval(
						`
                sum = (a, b) -> a + b

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
				expect(stlEval("5()")).toEqual([
					Error("Can't call 5 because it is not a function."),
				]);
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
                x = 15
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
                x = 15
                match x {
                    15 => "correct"
                    _ => "wrong"
                }
                `
				)
			).toBe("correct");
		});

		it("should be able to be used as an expression", () => {
			const spy = jest.fn();
			stlEvalMockPrint(
				`
                a = 4
                b = a - 2
                c = a/b
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
                x = "hello"
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
                obj = {
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
                obj = {
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
                obj = {
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
                obj = {
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
                    obj = {
                        a: 72
                    }
                    obj.a
                    `
				)
			).toEqual(new StlNumber(72n));
		});

		it("should not allow assignment to an immutable object's properties", () => {
			expect(
				stlEval(
					`
				obj = {
					a: 42
				}
				obj.a <- 43
				`
				)
			).toEqual([Error(`Cannot assign to property of immutable object!`)]);
		});

		it("should allow assignment to a mutable object's properties", () => {
			expect(
				stlEval(
					`
                    var obj <- {
                        a: 42
                    }
                    obj.a <- 43
                    obj.a
                    `
				)
			).toEqual(new StlNumber(43n));
		});
	});

	describe("pass by reference semantics", () => {
		it("should properly handle assignment within a function", () => {
			expect(
				stlEval(`
                    var val <- 5
                    addTwo = (var a) -> a <- a + 2
                    addTwo(val)
                    val
               `)
			).toEqual(new StlNumber(7n));
		});

		it("should not allow assignment to an immutable argument", () => {
			expect(
				stlEval(`
				val = 5
				addTwo = a -> a <- a + 2
				addTwo(val)
				val
		   `)
			).toEqual([Error(`Cannot assign to immutable variable "a".`)]);
		});
	});
});

describe("debug", () => {
	it("should print an error correctly", () => {
		const a = stlEval("print(hi)");
		expect(a).toEqual([Error(`Variable "hi" is not defined.`)]);
	});

	it("should not allow reassignment to an immutable variable", () => {
		expect(stlEval("a = 5\na <- 6")).toEqual([
			Error(`Cannot assign to immutable variable "a".`),
		]);
	});

	it("should show the correct filename on a test", () => {
		const tokens = tokenize("a = ", "filename");
		const ast: Either<Error[], ExprBase[]> = tokens.chain(parse);
		expect(ast.isLeft()).toBe(true);
		expect(
			ast.mapLeft((errs) =>
				errs
					.map((err) => err.message)
					.map((message) => message.includes("filename"))
					.reduce((acc, cur) => acc && cur, true)
			)
		);
	});
});
