import TokenType from "./TokenType";
import Token from "./Token";

let startIndex = 0;
let currentIndex = 0;
let source: string;
let line = 1;
let commentNests = 0;

function tokenize(src: string) {
    let tokens = [];
    source = src;
    while (!atEnd()) {
        let maybeToken = scanToken();
        if (maybeToken) {
            tokens.push(maybeToken);
        }
    }
}

function scanToken(): void | Token {
    let char = eatChar();
    switch (char) {
        case "(": return makeToken(TokenType.OPEN_PAREN);
        case ")": return makeToken(TokenType.CLOSE_PAREN);
        case "-": return makeToken(TokenType.MINUS);
        case "+": return makeToken(TokenType.PLUS);
        case "*": return makeToken(TokenType.STAR);
        case "/": 
            if (match("/")) {
                eatLineComment();
            } else if (match("*")) {
                eatMultiLineComment();
            } else {
                makeToken(TokenType.SLASH);
            }
        case "=": return makeToken(TokenType.EQUAL);

    }
    startIndex = currentIndex;
}

function makeToken(type: TokenType): Token {
    return new Token(TokenType, source.slice(startIndex, currentIndex), null , line);
}

// helpers
function eatLineComment(): void {
    while (lookAhead() !== "\n") {
        eatChar();
    }
}

function eatMultiLineComment(): void {
    commentNests += 1;
    while (!atEnd() && commentNests > 0) {
        if (eatChar() === "/") {
            if (lookBehind() === "*") {
                commentNests -= 1;
            } else if (match("*")) {
                commentNests += 1;
            }
        }
    }
}

function atEnd(): boolean {
    return currentIndex >= source.length;
}

function eatChar(): string {
    currentIndex += 1;
    return source[currentIndex - 1];
}

function lookBehind(num: number = 0): string {
    return source[currentIndex - num];
}

function lookAhead(num: number = 0): string {
    if (atEnd()) return "\0";
    return source[currentIndex + num];
}

function match(char: string): boolean {
    if (lookAhead() === char) {
        eatChar();
        return true;
    } else {
        return false;
    }
}
