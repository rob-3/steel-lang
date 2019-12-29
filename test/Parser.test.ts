import tokenize from "../src/Tokenizer";
import parse from "../src/Parser";
import TokenType from "../src/TokenType";
import Token from "../src/Token";
import Expr from "../src/Expr";
import { expect } from "chai";

describe("parse()", () => {
    it("should throw if a statement isn't terminated by a newline", () => {
        let src = "let 2 = 34 let 3 = 14"
        expect(() => parse(tokenize(src))).to.throw("Expected a newline!");
    });

    it("should parse a unary not", () => {
        let ast = parse(tokenize("not true"));
        expect(ast).to.deep.equal([{
            operator: new Token(TokenType.NOT, "not", null, 1),
            right: new Expr.Primary(true),
        }]);
    });
});
