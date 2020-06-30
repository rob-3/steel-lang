import tokenize from "../src/Tokenizer";
import parse from "../src/Parser";
import TokenType from "../src/TokenType";
import Token from "../src/Token";
import {
    PrimaryExpr,
    UnaryExpr,
    BinaryExpr,
    VariableDeclarationStmt,
    IfStmt
} from "../src/Expr";
import { expect } from "chai";

describe("parse()", () => {
    it("should throw if a statement isn't terminated by a newline", () => {
        let src = "let value = 34 let val2 = 14";
        expect(() => parse(tokenize(src))).to.throw("Expected a newline!");
    });

    it("should parse a unary not", () => {
        let ast = parse(tokenize("not true"));
        expect(ast).to.deep.equal([
            new UnaryExpr(
                new Token(TokenType.NOT, "not", null, 1),
                new PrimaryExpr(true)
            )
        ]);
    });

    it("should throw if an invalid identifier is used", () => {
        let src0 = "let let = 4";
        expect(() => parse(tokenize(src0))).to.throw(
            'Expected identifier; got "let"'
        );

        let src1 = "let var = 3";
        expect(() => parse(tokenize(src1))).to.throw(
            'Expected identifier; got "var"'
        );

        let src2 = "var let = 0";
        expect(() => parse(tokenize(src2))).to.throw(
            'Expected identifier; got "let"'
        );

        let src3 = "var var = 7";
        expect(() => parse(tokenize(src3))).to.throw(
            'Expected identifier; got "var"'
        );

        let src4 = "let 2 = 34";
        expect(() => parse(tokenize(src4))).to.throw(
            'Expected identifier; got "2"'
        );

        let src5 = 'let "string" = 34';
        expect(() => parse(tokenize(src5))).to.throw(
            "Expected identifier; got a string literal."
        );

        let src6 = "let if = 34";
        expect(() => parse(tokenize(src6))).to.throw(
            'Expected identifier; got "if"'
        );

        let src7 = "let else = 34";
        expect(() => parse(tokenize(src7))).to.throw(
            'Expected identifier; got "else"'
        );

        let src8 = "let true = 34";
        expect(() => parse(tokenize(src8))).to.throw(
            'Expected identifier; got "true"'
        );

        let src9 = "let false = 34";
        expect(() => parse(tokenize(src9))).to.throw(
            'Expected identifier; got "false"'
        );

        let src10 = "let fun = 34";
        expect(() => parse(tokenize(src10))).to.throw(
            'Expected identifier; got "fun"'
        );

        let src11 = "let while = 34";
        expect(() => parse(tokenize(src11))).to.throw(
            'Expected identifier; got "while"'
        );

        let src12 = "let for = 34";
        expect(() => parse(tokenize(src12))).to.throw(
            'Expected identifier; got "for"'
        );

        let src13 = "let in = 34";
        expect(() => parse(tokenize(src13))).to.throw(
            'Expected identifier; got "in"'
        );

        let src14 = "let and = 34";
        expect(() => parse(tokenize(src14))).to.throw(
            'Expected identifier; got "and"'
        );

        let src15 = "let or = 34";
        expect(() => parse(tokenize(src15))).to.throw(
            'Expected identifier; got "or"'
        );

        let src16 = "let not = 34";
        expect(() => parse(tokenize(src16))).to.throw(
            'Expected identifier; got "not"'
        );
    });

    it("should parse `or` precedence correctly", () => {
        let src = "4 == 5 or 6 == 7";
        expect(parse(tokenize(src))).to.eql([
            new BinaryExpr(
                new BinaryExpr(
                    new PrimaryExpr(4),
                    new Token(TokenType.EQUAL_EQUAL, "==", null, 1),
                    new PrimaryExpr(5)
                ),
                new Token(TokenType.OR, "or", null, 1),
                new BinaryExpr(
                    new PrimaryExpr(6),
                    new Token(TokenType.EQUAL_EQUAL, "==", null, 1),
                    new PrimaryExpr(7)
                )
            )
        ]);
    });

    it("should parse while without parentheses", () => {
        expect(() =>
            parse(
                tokenize(
                    `
            var x = 0
            while x < 5 {
                x = x + 1
            }
            `
                )
            )
        ).to.not.throw();
    });

    it("should parse if-then", () => {
        expect(parse(tokenize(`let a = if false then 5 else 6`))).to.eql([
            new VariableDeclarationStmt(
                "a",
                true,
                new IfStmt(
                    new PrimaryExpr(false),
                    new PrimaryExpr(5),
                    new PrimaryExpr(6)
                )
            )
        ]);
    });

    it("should support until statement", () => {
        expect(() =>
            parse(
                tokenize(
                    `
            var a = 5
            until true {
                a = a + 3
            }
            `
                )
            )
        ).to.not.throw();
    });

    it("should allow lambda style fib function definition", () => {
        expect(() =>
            parse(
                tokenize(
                    `
            let fib = n -> {
                if n == 1 or n == 0 then 1
                else fib(n - 1) + fib(n - 2)
            }
            `
                )
            )
        ).to.not.throw();
    });
});

describe("parse() spacing", () => {
    describe("functions", () => {
        describe("single arg lambdas", () => {
            it("should allow a break after the arrow in a function definition", () => {
                expect(() =>
                    parse(
                        tokenize(
                            `
                    let addTwo = a -> 
                        a + 2
                    `
                        )
                    )
                ).to.not.throw();
            });

            it("should allow a break after the equals in a function definition", () => {
                expect(() =>
                    parse(
                        tokenize(
                            `
                    let addTwo = 
                        a -> a + 2
                    `
                        )
                    )
                ).to.not.throw();
            });
        });

        describe("multi arg lambdas", () => {
            it("should allow a break after the arrow in a function definition", () => {
                expect(() =>
                    parse(
                        tokenize(
                            `
                    let sum = (a, b) -> 
                    a + b
                    `
                        )
                    )
                ).to.not.throw();
            });

            it("should allow a break after the equals in a function definition", () => {
                expect(() =>
                    parse(
                        tokenize(
                            `
                    let sum = 
                        (a, b) -> a + b
                    `
                        )
                    )
                ).to.not.throw();
            });

            it("should allow a break in the args list", () => {
                expect(() =>
                    parse(
                        tokenize(
                            `
                    let sum = (a, 
                               b,
                               c) -> a + b
                    `
                        )
                    )
                ).to.not.throw();
            });

            it("should allow a trailing comma in the arg list", () => {
                expect(() =>
                    parse(
                        tokenize(
                            `
                    let sum = (a, b, c,) -> a + b
                    `
                        )
                    )
                ).to.not.throw();
            });

            it("should not allow extra commas in the arg list", () => {
                expect(() =>
                    parse(
                        tokenize(
                            `
                    let sum = (a,, b, c) -> a + b
                    `
                        )
                    )
                ).to.throw();
            });
        });
    });

    describe("if stmts", () => {
        it("should allow newlines after the if", () => {
            expect(() =>
                parse(
                    tokenize(
                        `
                let a = true
                if 
                    a then 5
                `
                    )
                )
            ).to.not.throw();
        });

        it("should allow newlines after the condition", () => {
            expect(() =>
                parse(
                    tokenize(
                        `
                let a = true
                if a 
                    then 5
                `
                    )
                )
            ).to.not.throw();
        });

        it("should allow newlines after the then", () => {
            expect(() =>
                parse(
                    tokenize(
                        `
                let a = true
                if a then 
                    5
                `
                    )
                )
            ).to.not.throw();
        });

        it("should allow multiple newlines within an if", () => {
            expect(() =>
                parse(
                    tokenize(
                        `
                let a = true
                if 

                    a 



                    then 



                    5
                    `
                    )
                )
            ).to.not.throw();
        });
    });

    describe("assignments", () => {
        it("should not allow a newline before the equals", () => {
            expect(() =>
                parse(
                    tokenize(
                        `
                let a
                      = 5
                `
                    )
                )
            ).to.throw();
        });

        it("should allow a newline immediately after the equals", () => {
            expect(() =>
                parse(
                    tokenize(
                        `
                let a = 
                    5
                `
                    )
                )
            ).to.not.throw();
        });

        it("should allow multiple newlines after the equals", () => {
            expect(() =>
                parse(
                    tokenize(
                        `
                let a = 



                5
                `
                    )
                )
            ).to.not.throw();
        });
    });

    describe("while loops", () => {
        it("should allow a newline after while", () => {
            expect(() =>
                parse(
                    tokenize(
                        `
                while
                    true {
                        
                    }
                `
                    )
                )
            );
        });
    });
});
