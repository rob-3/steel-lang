import TokenType from "./TokenType";
import Token from "./Token";
import { Location } from "./TokenizerHelpers";
import { Maybe, Just, Nothing } from "purify-ts";

let startIndex = 0;
let currentIndex = 0;
let startColumn = 1;
let currentColumn = 1;
let source: string = "";
let startLine = 1;
let currentLine = 1;
let commentNests = 0;
let filename: string = "";

export default function tokenize(
    src: string,
    filepath: string = "<anonymous>"
): Token[] {
    filename = filepath;
    const tokens = [];
    try {
        source = src;
        while (!atEnd()) {
            scanToken().map((t) => tokens.push(t));
        }
        tokens.push(
            new Token(
                TokenType.EOF,
                "",
                null,
                new Location(
                    [startLine, startColumn],
                    [startLine, startColumn], // EOF doesn't take up any space
                    filename
                )
            )
        );
    } finally {
        reset();
    }
    return tokens;
}

function scanToken(): Maybe<Token> {
    const char = eatChar();
    switch (char) {
        case "(":
            return Just(makeToken(TokenType.OPEN_PAREN));
        case ")":
            return Just(makeToken(TokenType.CLOSE_PAREN));
        case "[":
            return Just(makeToken(TokenType.OPEN_BRACKET));
        case "]":
            return Just(makeToken(TokenType.CLOSE_BRACKET));
        case "{":
            return Just(makeToken(TokenType.OPEN_BRACE));
        case "}":
            return Just(makeToken(TokenType.CLOSE_BRACE));
        case ".":
            return Just(makeToken(TokenType.DOT));
        case "%":
            return Just(makeToken(TokenType.MOD));
        case "*":
            return Just(makeToken(TokenType.STAR));
        case "/":
            if (match("/")) {
                eatLineComment();
            } else if (match("*")) {
                eatMultiLineComment();
            } else {
                return Just(makeToken(TokenType.SLASH));
            }
            return Nothing;
        case "+":
            return match("+")
                ? Just(makeToken(TokenType.PLUS_PLUS))
                : Just(makeToken(TokenType.PLUS));
        case "-":
            return match(">")
                ? Just(makeToken(TokenType.RIGHT_SINGLE_ARROW))
                : Just(makeToken(TokenType.MINUS));
        case "=":
            return match("=")
                ? Just(makeToken(TokenType.EQUAL_EQUAL))
                : match(">")
                ? Just(makeToken(TokenType.RIGHT_DOUBLE_ARROW))
                : Just(makeToken(TokenType.EQUAL));
        case ">":
            return match("=")
                ? Just(makeToken(TokenType.GREATER_EQUAL))
                : Just(makeToken(TokenType.GREATER));
        case "<":
            return match("=")
                ? Just(makeToken(TokenType.LESS_EQUAL))
                : match("-")
                ? Just(makeToken(TokenType.LEFT_SINGLE_ARROW))
                : Just(makeToken(TokenType.LESS));
        case ",":
            return Just(makeToken(TokenType.COMMA));
        case "_":
            return Just(makeToken(TokenType.UNDERSCORE));
        case "\t":
        case " ":
            // move the start pointers forward and try again
            startIndex = currentIndex;
            startColumn = currentColumn;
            return Nothing;
        case "\n":
            const token = Just(makeToken(TokenType.NEWLINE));
            return token;
        case '"':
            return Just(makeString());
        //case "\'": return stringInterpolation();
        default:
            if (isNumber(char)) {
                return Just(makeNumber());
            } else if (isAlpha(char)) {
                return Just(makeIdentifierOrKeyword());
            } else {
                throw Error(
                    `Unrecognized character "${char}". Perhaps you intended to put this in a string?`
                );
            }
    }
}

// literal makers

function makeString(): Token {
    let cache = lookAhead();
    while (cache !== '"') {
        if (cache === "\n" || atEnd()) {
            throw Error("Unterminated string literal.");
        }
        eatChar();
        cache = lookAhead();
    }
    eatChar();
    return makeToken(
        TokenType.STRING,
        source.slice(startIndex + 1, currentIndex - 1)
    );
}

function makeNumber(): Token {
    while (!atEnd() && isNumber(lookAhead())) {
        eatChar();
    }
    if (lookAhead() === ".") {
        eatChar();
        while (!atEnd() && isNumber(lookAhead())) {
            eatChar();
        }
    }
    return makeToken(
        TokenType.NUMBER,
        Number(source.slice(startIndex, currentIndex))
    );
}

function makeIdentifierOrKeyword(): Token {
    while (!atEnd() && isLegalIdentifierChar(lookAhead())) {
        eatChar();
    }
    const lexeme = source.slice(startIndex, currentIndex);
    switch (lexeme) {
        case "var":
            return makeToken(TokenType.VAR);
        case "true":
            return makeToken(TokenType.TRUE, true);
        case "false":
            return makeToken(TokenType.FALSE, false);
        case "fun":
            return makeToken(TokenType.FUN);
        case "if":
            return makeToken(TokenType.IF);
        case "then":
            return makeToken(TokenType.THEN);
        case "else":
            return makeToken(TokenType.ELSE);
        case "for":
            return makeToken(TokenType.FOR);
        case "while":
            return makeToken(TokenType.WHILE);
        case "and":
            return makeToken(TokenType.AND);
        case "or":
            return makeToken(TokenType.OR);
        case "not":
            return makeToken(TokenType.NOT);
        case "in":
            return makeToken(TokenType.IN);
        case "print":
            return makeToken(TokenType.PRINT);
        case "return":
            return makeToken(TokenType.RETURN);
        case "match":
            return makeToken(TokenType.MATCH);
        case "until":
            return makeToken(TokenType.UNTIL);
        default:
            return makeToken(TokenType.IDENTIFIER);
    }
}

/* TODO implement
function stringInterpolation(): Token {
    while (!atEnd() && eatChar() !== "\"") {
        
    }
    
}
*/

// helpers
function reset() {
    startIndex = 0;
    currentIndex = 0;
    startColumn = 1;
    currentColumn = 1;
    source = "";
    startLine = 1;
    currentLine = 1;
    commentNests = 0;
    filename = "";
}

function isAlphaNumeric(char: string): boolean {
    if (isAlpha(char) || isNumber(char)) {
        return true;
    } else {
        return false;
    }
}

function isLegalIdentifierChar(char: string) {
    return char === "_" || isAlphaNumeric(char);
}

function isAlpha(char: string): boolean {
    const lower = char.toLowerCase();
    return lower >= "a" && lower <= "z";
}

function isNumber(char: string): boolean {
    return char >= "0" && char <= "9";
}

function makeToken(type: TokenType, literal: any = null): Token {
    const token = new Token(
        type,
        source.slice(startIndex, currentIndex),
        literal,
        new Location(
            [startLine, startColumn],
            [currentLine, currentColumn],
            filename
        )
    );
    if (type === TokenType.NEWLINE) {
        bumpLine();
    }
    // reset start for next token
    startIndex = currentIndex;
    startLine = currentLine;
    startColumn = currentColumn;
    return token;
}

function eatLineComment(): void {
    while (lookAhead() !== "\n" && !atEnd()) {
        eatChar();
    }
    startIndex = currentIndex;
    startColumn = currentColumn;
}

function eatMultiLineComment(): void {
    commentNests += 1;
    while (!atEnd() && commentNests > 0) {
        const char = eatChar();
        if (char === "/") {
            if (lookBehind(2) === "*") {
                commentNests -= 1;
            } else if (match("*")) {
                commentNests += 1;
            }
        } else if (char === "\n") {
            currentLine += 1;
        }
    }
    startIndex = currentIndex;
    startColumn = currentColumn;
    startLine = currentLine;
}

function atEnd(): boolean {
    return currentIndex >= source.length;
}

function eatChar(): string {
    bumpIndex();
    return source[currentIndex - 1];
}

function lookBehind(num: number = 1): string {
    return source[currentIndex - num];
}

function lookAhead(num: number = 1): string {
    if (atEnd()) return "\0";
    return source[currentIndex + num - 1];
}

function match(char: string): boolean {
    if (lookAhead() === char) {
        eatChar();
        return true;
    } else {
        return false;
    }
}

function bumpIndex(): void {
    currentIndex += 1;
    currentColumn += 1;
}

function bumpLine(): void {
    currentLine += 1;
    currentColumn = 1;
}

export { isAlphaNumeric, isAlpha, isNumber, isLegalIdentifierChar };
