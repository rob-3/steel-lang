import tokenize from "../src/Tokenizer";
import Token from "../src/Token";
import TokenType from "../src/TokenType";
import { isAlphaNumeric, isAlpha, isNumber, isLegalIdentifierChar } from "../src/Tokenizer";
import { expect } from "chai";

// TODO fix line numbers
describe("tokenize()", () => {
    it("should tokenize input", () => {
        const output = tokenize('2 "hello" 6.04 my_identifier');
        expect(output).to.deep.equal([
            new Token(TokenType.NUMBER, "2", 2, 1),
            new Token(TokenType.STRING, '"hello"', "hello", 1),
            new Token(TokenType.NUMBER, "6.04", 6.04, 1),
            new Token(TokenType.IDENTIFER, "my_identifier", null, 1),
        ]);
    });

    it("should provide correct line numbers", () => {
        let result = tokenize("hi\n7.543\n92");
        expect(result.map(t => t.line)).to.deep.equal([1, 1, 2, 2, 3]);
    });

    it("should ignore single line comments", () => {
        let result = tokenize(`let apple = 4.3 // apple = 0 *//**/??////
            let pancakes = apple * 3 // rando-stuff
        `);
        expect(result).to.deep.equal([
            new Token(TokenType.LET, "let", null, 1),
            new Token(TokenType.IDENTIFER, "apple", null, 1),
            new Token(TokenType.EQUAL, "=", null, 1),
            new Token(TokenType.NUMBER, "4.3", 4.3, 1),
            new Token(TokenType.STMT_TERM, "\n", null, 1),
            new Token(TokenType.LET, "let", null, 2),
            new Token(TokenType.IDENTIFER, "pancakes", null, 2),
            new Token(TokenType.EQUAL, "=", null, 2),
            new Token(TokenType.IDENTIFER, "apple", null, 2),
            new Token(TokenType.STAR, "*", null, 2),
            new Token(TokenType.NUMBER, "3", 3, 2),
            new Token(TokenType.STMT_TERM, "\n", null, 2),
        ])
    });

    it("should ignore nested multi-line comments", () => {
        let result = tokenize("/**//**\n let var = 32.432.32 *//* laskdjflaskdf 43*/apple");
        expect(result).to.deep.equal([
            new Token(TokenType.IDENTIFER, "apple", null, 1),
        ]);
    });

    it("should use LET/VAR TokenType and STMT_TERM", () => {
        let result = tokenize(
            `let a = 23
             var b = 46`
        );
        expect(result).to.deep.equal([
            new Token(TokenType.LET, "let", null, 1),
            new Token(TokenType.IDENTIFER, "a", null, 1),
            new Token(TokenType.EQUAL, "=", null, 1),
            new Token(TokenType.NUMBER, "23", 23, 1),
            new Token(TokenType.STMT_TERM, "\n", null, 1),
            new Token(TokenType.VAR, "var", null, 2),
            new Token(TokenType.IDENTIFER, "b", null, 2),
            new Token(TokenType.EQUAL, "=", null, 2),
            new Token(TokenType.NUMBER, "46", 46, 2),
        ]);
    });
});

describe("isLegalIdentifierChar()", () => {
    it("should return true if a character is [a-zA-Z]", () => {
        expect(isLegalIdentifierChar("a")).to.equal(true);
        expect(isLegalIdentifierChar("z")).to.equal(true);
        expect(isLegalIdentifierChar("A")).to.equal(true);
        expect(isLegalIdentifierChar("Z")).to.equal(true);
    });

    it("should return true if a character is [0-9]", () => {
        expect(isLegalIdentifierChar("0")).to.equal(true);
        expect(isLegalIdentifierChar("9")).to.equal(true);
        expect(isLegalIdentifierChar("-")).to.equal(false);
    });

    it("should return true if a character is [_]", () => {
        expect(isLegalIdentifierChar("_")).to.equal(true);
    });

    it("should return false if a character is [-\0\"\'\n]", () => {
       expect(isLegalIdentifierChar("\0")).to.equal(false);
       expect(isLegalIdentifierChar("\"")).to.equal(false);
       expect(isLegalIdentifierChar("'")).to.equal(false);
       expect(isLegalIdentifierChar("\n")).to.equal(false);
    });
});

describe("isAlphaNumeric()", () => {
    it("should return true if a character is [a-zA-Z]", () => {
        expect(isAlphaNumeric("a")).to.equal(true);
        expect(isAlphaNumeric("z")).to.equal(true);
        expect(isAlphaNumeric("A")).to.equal(true);
        expect(isAlphaNumeric("Z")).to.equal(true);
    });

    it("should return true if a character is [0-9]", () => {
        expect(isAlphaNumeric("0")).to.equal(true);
        expect(isAlphaNumeric("9")).to.equal(true);
    });

    it("should return false if a character is [_-\0\"\'\n]", () => {
        expect(isAlphaNumeric("_")).to.equal(false);
        expect(isAlphaNumeric("-")).to.equal(false);
        expect(isAlphaNumeric("\0")).to.equal(false);
        expect(isAlphaNumeric("\"")).to.equal(false);
        expect(isAlphaNumeric("'")).to.equal(false);
        expect(isAlphaNumeric("\n")).to.equal(false);
    });
});

describe("isAlpha()", () => {
    it("should return true if a character is [a-zA-Z]", () => {
        expect(isAlpha("a")).to.equal(true);
        expect(isAlpha("z")).to.equal(true);
        expect(isAlpha("A")).to.equal(true);
        expect(isAlpha("Z")).to.equal(true);
    });

    it("should return false if a character is [_-\0\"\'\n]", () => {
        expect(isAlpha("0")).to.equal(false);
        expect(isAlpha("9")).to.equal(false);
        expect(isAlpha("_")).to.equal(false);
        expect(isAlpha("-")).to.equal(false);
        expect(isAlpha("\0")).to.equal(false);
        expect(isAlpha("\"")).to.equal(false);
        expect(isAlpha("'")).to.equal(false);
        expect(isAlpha("\n")).to.equal(false);
    });
});

describe("isNumber()", () => {
    it("should return true if a character is [0-9]", () => {
        expect(isNumber("0")).to.equal(true);
        expect(isNumber("9")).to.equal(true);
    });

    it("should return false if a character is not [0-9]", () => {
        expect(isNumber("a")).to.equal(false);
        expect(isNumber("z")).to.equal(false);
        expect(isNumber("A")).to.equal(false);
        expect(isNumber("Z")).to.equal(false);
        expect(isNumber("_")).to.equal(false);
        expect(isNumber("-")).to.equal(false);
        expect(isNumber("\0")).to.equal(false);
        expect(isNumber("\"")).to.equal(false);
        expect(isNumber("'")).to.equal(false);
    });
});
