import tokenize from "../src/Tokenizer";
import Token from "../src/Token";
import TokenType from "../src/TokenType";
import { isAlphaNumeric, isAlpha, isNumber } from "../src/Tokenizer";
import { expect } from "chai";

// TODO fix line numbers
describe("tokenize()", () => {
    it("should tokenize input", () => {
        const output = tokenize('2 "hello" 6.04 my_identifier');
        expect(output).to.deep.equal([
            new Token(TokenType.NUMBER, "2", 2, 1),
            new Token(TokenType.STRING, '"hello"', "hello", 1),
            new Token(TokenType.NUMBER, "6.04", 6.04, 1),
            new Token(TokenType.IDENTIFER, "my_identifier", "my_identifier", 1),
        ]);
    });
});

describe("isAlphaNumeric()", () => {
    it("should check if a character is in [a-z0-9_]", () => {
        expect(isAlphaNumeric("a")).to.equal(true);
        expect(isAlphaNumeric("z")).to.equal(true);
        expect(isAlphaNumeric("A")).to.equal(true);
        expect(isAlphaNumeric("Z")).to.equal(true);
        expect(isAlphaNumeric("0")).to.equal(true);
        expect(isAlphaNumeric("9")).to.equal(true);
        expect(isAlphaNumeric("_")).to.equal(true);
        expect(isAlphaNumeric("-")).to.equal(false);
        expect(isAlphaNumeric("\0")).to.equal(false);
        expect(isAlphaNumeric("\"")).to.equal(false);
        expect(isAlphaNumeric("'")).to.equal(false);
    });
});

describe("isAlpha()", () => {
    it("should check if a character is [a-zA-Z]", () => {
        expect(isAlpha("a")).to.equal(true);
        expect(isAlpha("z")).to.equal(true);
        expect(isAlpha("A")).to.equal(true);
        expect(isAlpha("Z")).to.equal(true);
        expect(isAlpha("0")).to.equal(false);
        expect(isAlpha("9")).to.equal(false);
        expect(isAlpha("_")).to.equal(false);
        expect(isAlpha("-")).to.equal(false);
        expect(isAlpha("\0")).to.equal(false);
        expect(isAlpha("\"")).to.equal(false);
        expect(isAlpha("'")).to.equal(false);
    });
});

describe("isNumber()", () => {
    it("should check if a character is [0-9]", () => {
        expect(isNumber("a")).to.equal(false);
        expect(isNumber("z")).to.equal(false);
        expect(isNumber("A")).to.equal(false);
        expect(isNumber("Z")).to.equal(false);
        expect(isNumber("0")).to.equal(true);
        expect(isNumber("9")).to.equal(true);
        expect(isNumber("_")).to.equal(false);
        expect(isNumber("-")).to.equal(false);
        expect(isNumber("\0")).to.equal(false);
        expect(isNumber("\"")).to.equal(false);
        expect(isNumber("'")).to.equal(false);
    });
});
