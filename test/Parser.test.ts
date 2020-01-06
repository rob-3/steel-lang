import tokenize from "../src/Tokenizer";
import parse from "../src/Parser";
import TokenType from "../src/TokenType";
import Token from "../src/Token";
import Expr from "../src/Expr";
import { expect } from "chai";

describe("parse()", () => {
    it("should throw if a statement isn't terminated by a newline", () => {
        let src = "let value = 34 let 3 = 14"
        expect(() => parse(tokenize(src))).to.throw("Expected a newline!");
    });

    it("should parse a unary not", () => {
        let ast = parse(tokenize("not true"));
        expect(ast).to.deep.equal([{
            operator: new Token(TokenType.NOT, "not", null, 1),
            right: new Expr.Primary(true),
        }]);
    });

    it("should throw if an invalid identifier is used", () => {
        let src0 = "let let = 4";
        expect(() => parse(tokenize(src0))).to.throw('Expected identifier; got "let"');

        let src1 = "let var = 3";
        expect(() => parse(tokenize(src1))).to.throw('Expected identifier; got "var"');

        let src2 = "var let = 0";
        expect(() => parse(tokenize(src2))).to.throw('Expected identifier; got "let"');

        let src3 = "var var = 7";
        expect(() => parse(tokenize(src3))).to.throw('Expected identifier; got "var"');

        let src4 = "let 2 = 34";
        expect(() => parse(tokenize(src4))).to.throw('Expected identifier; got "2"');

        let src5 = 'let "string" = 34';
        expect(() => parse(tokenize(src5))).to.throw('Expected identifier; got a string literal.');

        let src6 = "let if = 34";
        expect(() => parse(tokenize(src6))).to.throw('Expected identifier; got "if"');

        let src7 = "let else = 34";
        expect(() => parse(tokenize(src7))).to.throw('Expected identifier; got "else"');

        let src8 = "let true = 34";
        expect(() => parse(tokenize(src8))).to.throw('Expected identifier; got "true"');

        let src9 = "let false = 34";
        expect(() => parse(tokenize(src9))).to.throw('Expected identifier; got "false"');

        let src10 = "let fun = 34";
        expect(() => parse(tokenize(src10))).to.throw('Expected identifier; got "fun"');

        let src11 = "let while = 34";
        expect(() => parse(tokenize(src11))).to.throw('Expected identifier; got "while"');

        let src12 = "let for = 34";
        expect(() => parse(tokenize(src12))).to.throw('Expected identifier; got "for"');

        let src13 = "let in = 34";
        expect(() => parse(tokenize(src13))).to.throw('Expected identifier; got "in"');

        let src14 = "let and = 34";
        expect(() => parse(tokenize(src14))).to.throw('Expected identifier; got "and"');

        let src15 = "let or = 34";
        expect(() => parse(tokenize(src15))).to.throw('Expected identifier; got "or"');

        let src16 = "let not = 34";
        expect(() => parse(tokenize(src16))).to.throw('Expected identifier; got "not"');
    });
});
