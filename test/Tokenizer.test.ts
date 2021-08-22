import { expect } from "chai";
import Token from "../src/Token";
import _tokenize, {
    isAlpha,
    isAlphaNumeric,
    isLegalIdentifierChar,
    isNumber,
} from "../src/Tokenizer";
import Location from "../src/Location";
import TokenType from "../src/TokenType";

const tokenize = (src: string) => _tokenize(src).unsafeCoerce();

const toStringArray = (errors: Error[]) => errors.map((err) => err.message);

describe("tokenize()", () => {
    it("should tokenize input", () => {
        const src = '2 "hello" 6.04 my_identifier';
        const output = tokenize(src);
        expect(output).to.deep.equal([
            new Token(
                TokenType.NUMBER,
                "2",
                2,
                new Location([1, 1], [1, 2], "<anonymous>", src)
            ),
            new Token(
                TokenType.STRING,
                '"hello"',
                "hello",
                new Location([1, 3], [1, 10], "<anonymous>", src)
            ),
            new Token(
                TokenType.NUMBER,
                "6.04",
                6.04,
                new Location([1, 11], [1, 15], "<anonymous>", src)
            ),
            new Token(
                TokenType.IDENTIFIER,
                "my_identifier",
                null,
                new Location([1, 16], [1, 29], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 29], [1, 29], "<anonymous>", src)
            ),
        ]);
    });

    it("should provide correct line numbers", () => {
        let result = tokenize("hi\n7.543\n92");
        expect(result.map((t) => t.location.start[0])).to.deep.equal([
            1, 1, 2, 2, 3, 3,
        ]);
    });

    it("should ignore single line comments", () => {
        const src =
            "apple = 4.3 // apple = 0 *//**/??////\npancakes = apple * 3 // rando-stuff";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.IDENTIFIER,
                "apple",
                null,
                new Location([1, 1], [1, 6], "<anonymous>", src)
            ),
            new Token(
                TokenType.EQUAL,
                "=",
                null,
                new Location([1, 7], [1, 8], "<anonymous>", src)
            ),
            new Token(
                TokenType.NUMBER,
                "4.3",
                4.3,
                new Location([1, 9], [1, 12], "<anonymous>", src)
            ),
            new Token(
                TokenType.NEWLINE,
                "\n",
                null,
                new Location([1, 38], [1, 39], "<anonymous>", src)
            ),
            new Token(
                TokenType.IDENTIFIER,
                "pancakes",
                null,
                new Location([2, 1], [2, 9], "<anonymous>", src)
            ),
            new Token(
                TokenType.EQUAL,
                "=",
                null,
                new Location([2, 10], [2, 11], "<anonymous>", src)
            ),
            new Token(
                TokenType.IDENTIFIER,
                "apple",
                null,
                new Location([2, 12], [2, 17], "<anonymous>", src)
            ),
            new Token(
                TokenType.STAR,
                "*",
                null,
                new Location([2, 18], [2, 19], "<anonymous>", src)
            ),
            new Token(
                TokenType.NUMBER,
                "3",
                3,
                new Location([2, 20], [2, 21], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([2, 36], [2, 36], "<anonymous>", src)
            ),
        ]);
    });

    it("should ignore nested multi-line comments", () => {
        const src =
            "/**//**\n let var = 32.432.32 *//* laskdjflaskdf 43*/apple";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.IDENTIFIER,
                "apple",
                null,
                new Location([2, 53], [2, 58], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([2, 58], [2, 58], "<anonymous>", src)
            ),
        ]);
    });

    it("should use LET TokenType and NEWLINE", () => {
        const src = "a = 23\nlet b = 46";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.IDENTIFIER,
                "a",
                null,
                new Location([1, 1], [1, 2], "<anonymous>", src)
            ),
            new Token(
                TokenType.EQUAL,
                "=",
                null,
                new Location([1, 3], [1, 4], "<anonymous>", src)
            ),
            new Token(
                TokenType.NUMBER,
                "23",
                23,
                new Location([1, 5], [1, 7], "<anonymous>", src)
            ),
            new Token(
                TokenType.NEWLINE,
                "\n",
                null,
                new Location([1, 7], [1, 8], "<anonymous>", src)
            ),
            new Token(
                TokenType.LET,
                "let",
                null,
                new Location([2, 1], [2, 4], "<anonymous>", src)
            ),
            new Token(
                TokenType.IDENTIFIER,
                "b",
                null,
                new Location([2, 5], [2, 6], "<anonymous>", src)
            ),
            new Token(
                TokenType.EQUAL,
                "=",
                null,
                new Location([2, 7], [2, 8], "<anonymous>", src)
            ),
            new Token(
                TokenType.NUMBER,
                "46",
                46,
                new Location([2, 9], [2, 11], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([2, 11], [2, 11], "<anonymous>", src)
            ),
        ]);
    });

    it("should end with an EOF token no matter what", () => {
        const src = "";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 1], [1, 1], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize true and false", () => {
        const src = "true false";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.TRUE,
                "true",
                true,
                new Location([1, 1], [1, 5], "<anonymous>", src)
            ),
            new Token(
                TokenType.FALSE,
                "false",
                false,
                new Location([1, 6], [1, 11], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 11], [1, 11], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize the fun keyword", () => {
        const src = "fun";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.FUN,
                "fun",
                null,
                new Location([1, 1], [1, 4], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 4], [1, 4], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize the for keyword", () => {
        const src = "for";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.FOR,
                "for",
                null,
                new Location([1, 1], [1, 4], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 4], [1, 4], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize the while keyword", () => {
        const src = "while";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.WHILE,
                "while",
                null,
                new Location([1, 1], [1, 6], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 6], [1, 6], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize the if and else keywords", () => {
        const src = "if else";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.IF,
                "if",
                null,
                new Location([1, 1], [1, 3], "<anonymous>", src)
            ),
            new Token(
                TokenType.ELSE,
                "else",
                null,
                new Location([1, 4], [1, 8], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 8], [1, 8], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize the and, or, and not keywords", () => {
        const src = "and or not";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.AND,
                "and",
                null,
                new Location([1, 1], [1, 4], "<anonymous>", src)
            ),
            new Token(
                TokenType.OR,
                "or",
                null,
                new Location([1, 5], [1, 7], "<anonymous>", src)
            ),
            new Token(
                TokenType.NOT,
                "not",
                null,
                new Location([1, 8], [1, 11], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 11], [1, 11], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize colons", () => {
        const src = ":";
        expect(tokenize(src)[0]).to.deep.equal(
            new Token(
                TokenType.COLON,
                ":",
                null,
                new Location([1, 1], [1, 2], "<anonymous>", src)
            )
        );
    });

    it("should tokenize a dot", () => {
        const src = ".";
        expect(tokenize(src)[0]).to.deep.equal(
            new Token(
                TokenType.DOT,
                ".",
                null,
                new Location([1, 1], [1, 2], "<anonymous>", src)
            )
        );
    });

    // FIXME I don't think this actually works
    it("should not loop if there is a comment and no newline before EOF", function () {
        this.timeout(1000);
        tokenize(
            `let a = 3
            let b = 5.34 //`
        );
    });

    it("should throw if there is an unterminated string literal", () => {
        let source = '"23';
        expect(_tokenize(source).mapLeft(toStringArray).extract()).to.eql([
            "Unterminated string literal.",
        ]);
    });

    it("should throw if there is an unexpected character", () => {
        let source = "\\";
        expect(_tokenize(source).mapLeft(toStringArray).extract()).to.eql([
            'Unrecognized character "\\". Perhaps you intended to put this in a string?',
        ]);
    });

    it("should tokenize a unary not", () => {
        const src = "not true";
        let result = tokenize(src);
        expect(result).to.deep.equal([
            new Token(
                TokenType.NOT,
                "not",
                null,
                new Location([1, 1], [1, 4], "<anonymous>", src)
            ),
            new Token(
                TokenType.TRUE,
                "true",
                true,
                new Location([1, 5], [1, 9], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 9], [1, 9], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize commas", () => {
        const src = ",";
        expect(tokenize(src)).to.deep.equal([
            new Token(
                TokenType.COMMA,
                ",",
                null,
                new Location([1, 1], [1, 2], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 2], [1, 2], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize right double arrow", () => {
        const src = "=>";
        expect(tokenize(src)).to.eql([
            new Token(
                TokenType.RIGHT_DOUBLE_ARROW,
                "=>",
                null,
                new Location([1, 1], [1, 3], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 3], [1, 3], "<anonymous>", src)
            ),
        ]);
    });

    it("should tokenize underscore", () => {
        const src = "_";
        expect(tokenize(src)).to.eql([
            new Token(
                TokenType.UNDERSCORE,
                "_",
                null,
                new Location([1, 1], [1, 2], "<anonymous>", src)
            ),
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location([1, 2], [1, 2], "<anonymous>", src)
            ),
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

    it("should return false if a character is [-\\0\"'\\n()]", () => {
        expect(isLegalIdentifierChar("\0")).to.equal(false);
        expect(isLegalIdentifierChar('"')).to.equal(false);
        expect(isLegalIdentifierChar("'")).to.equal(false);
        expect(isLegalIdentifierChar("\n")).to.equal(false);
        expect(isLegalIdentifierChar("(")).to.equal(false);
        expect(isLegalIdentifierChar(")")).to.equal(false);
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

    it("should return false if a character is [_-\\0\"'\\n]", () => {
        expect(isAlphaNumeric("_")).to.equal(false);
        expect(isAlphaNumeric("-")).to.equal(false);
        expect(isAlphaNumeric("\0")).to.equal(false);
        expect(isAlphaNumeric('"')).to.equal(false);
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

    it("should return false if a character is [_-\\0\"'\\n]", () => {
        expect(isAlpha("0")).to.equal(false);
        expect(isAlpha("9")).to.equal(false);
        expect(isAlpha("_")).to.equal(false);
        expect(isAlpha("-")).to.equal(false);
        expect(isAlpha("\0")).to.equal(false);
        expect(isAlpha('"')).to.equal(false);
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
        expect(isNumber('"')).to.equal(false);
        expect(isNumber("'")).to.equal(false);
    });
});
