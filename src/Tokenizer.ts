import { Either, Right, Left } from "purify-ts";
import Token from "./Token";
import Location from "./Location";
import TokenType from "./TokenType";
import StlNumber from "./StlNumber";

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
): Either<Error[], Token[]> {
    filename = filepath;
    const fullTokens: Either<Error, Token>[] = [];
    let tokens;
    try {
        source = src;
        while (!atEnd()) {
            fullTokens.push(scanToken());
        }
        tokens = fullTokens.filter((t) =>
            t.either(
                (_) => true,
                (token) =>
                    token.type !== TokenType.WHITESPACE &&
                    token.type !== TokenType.COMMENT
            )
        );
        tokens.push(
            Right(
                new Token(
                    TokenType.EOF,
                    "",
                    null,
                    new Location(
                        [startLine, startColumn],
                        [startLine, startColumn], // EOF doesn't take up any space
                        filename,
                        source
                    )
                )
            )
        );
    } finally {
        reset();
    }
    const errors = Either.lefts(tokens);
    if (errors.length > 0) {
        return Left(errors);
    }
    return Right(Either.rights(tokens));
}

function scanToken(): Either<Error, Token> {
    const char = eatChar();
    switch (char) {
        case "(":
            return Right(makeToken(TokenType.OPEN_PAREN));
        case ")":
            return Right(makeToken(TokenType.CLOSE_PAREN));
        case "[":
            return Right(makeToken(TokenType.OPEN_BRACKET));
        case "]":
            return Right(makeToken(TokenType.CLOSE_BRACKET));
        case "{":
            return Right(makeToken(TokenType.OPEN_BRACE));
        case "}":
            return Right(makeToken(TokenType.CLOSE_BRACE));
        case ".":
            return Right(makeToken(TokenType.DOT));
        case "%":
            return Right(makeToken(TokenType.MOD));
        case "*":
            return Right(makeToken(TokenType.STAR));
        case "/":
            if (match("/")) {
                eatLineComment();
            } else if (match("*")) {
                eatMultiLineComment();
            } else {
                return Right(makeToken(TokenType.SLASH));
            }
            return Right(makeToken(TokenType.COMMENT));
        case "+":
            return match("+")
                ? Right(makeToken(TokenType.PLUS_PLUS))
                : Right(makeToken(TokenType.PLUS));
        case "-":
            return match(">")
                ? Right(makeToken(TokenType.RIGHT_SINGLE_ARROW))
                : Right(makeToken(TokenType.MINUS));
        case "=":
            return match("=")
                ? Right(makeToken(TokenType.EQUAL_EQUAL))
                : match(">")
                ? Right(makeToken(TokenType.RIGHT_DOUBLE_ARROW))
                : Right(makeToken(TokenType.EQUAL));
        case ">":
            return match("=")
                ? Right(makeToken(TokenType.GREATER_EQUAL))
                : Right(makeToken(TokenType.GREATER));
        case "<":
            return match("=")
                ? Right(makeToken(TokenType.LESS_EQUAL))
                : match("-")
                ? Right(makeToken(TokenType.LEFT_SINGLE_ARROW))
                : Right(makeToken(TokenType.LESS));
        case ",":
            return Right(makeToken(TokenType.COMMA));
        case "_":
            return Right(makeToken(TokenType.UNDERSCORE));
        case ":":
            return Right(makeToken(TokenType.COLON));
        case "\t":
        case " ":
            // move the start pointers forward and try again
            return Right(makeToken(TokenType.WHITESPACE));
        case "\n":
            const token = Right(makeToken(TokenType.NEWLINE));
            return token;
        case '"':
            return makeString();
        //case "\'": return stringInterpolation();
        default:
            if (isNumber(char)) {
                return Right(makeNumber());
            } else if (isAlpha(char) || char === "~") {
                return Right(makeIdentifierOrKeyword());
            } else {
                return Left(
                    new Error(
                        `Unrecognized character "${char}". Perhaps you intended to put this in a string?`
                    )
                );
            }
    }
}

// literal makers

function makeString(): Either<Error, Token> {
    let cache = lookAhead();
    while (cache !== '"') {
        if (cache === "\n" || atEnd()) {
            return Left(new Error("Unterminated string literal."));
        }
        eatChar();
        cache = lookAhead();
    }
    eatChar();
    return Right(
        makeToken(
            TokenType.STRING,
            source.slice(startIndex + 1, currentIndex - 1)
        )
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
        StlNumber.of(source.slice(startIndex, currentIndex))
    );
}

function makeIdentifierOrKeyword(): Token {
    if (lookAhead() === "~") eatChar();
    while (!atEnd() && isLegalIdentifierChar(lookAhead())) {
        eatChar();
    }
    const lexeme = source.slice(startIndex, currentIndex);
    switch (lexeme) {
        case "let":
            return makeToken(TokenType.LET);
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
        /*
        case "print":
            return makeToken(TokenType.PRINT);
            */
        case "return":
            return makeToken(TokenType.RETURN);
        case "match":
            return makeToken(TokenType.MATCH);
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
            filename,
            source
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
