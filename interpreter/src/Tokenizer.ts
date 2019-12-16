import TokenType from "./TokenType";
import Token from "./Token";

let startIndex = 0;
let currentIndex = 0;
let source: string;
let line = 1;
let commentNests = 0;

export default function tokenize(src: string): Token[] {
    let tokens = [];
    source = src;
    while (!atEnd()) {
        let maybeToken = scanToken();
        if (maybeToken) {
            tokens.push(maybeToken);
        }
    }
    return tokens;
}

function scanToken(): void | Token {
    let char = eatChar();
    switch (char) {
        case "(": return makeToken(TokenType.OPEN_PAREN);
        case ")": return makeToken(TokenType.CLOSE_PAREN);
        case "[": return makeToken(TokenType.OPEN_BRACKET);
        case "]": return makeToken(TokenType.CLOSE_BRACKET);
        case "{": return makeToken(TokenType.OPEN_BRACE);
        case "}": return makeToken(TokenType.CLOSE_BRACE);
        case ".": return makeToken(TokenType.DOT);
        case "*": return makeToken(TokenType.STAR);
        case "/": 
            if (match("/")) {
                eatLineComment();
            } else if (match("*")) {
                eatMultiLineComment();
            } else {
                return makeToken(TokenType.SLASH);
            }
            break;
        case "+": return match("+") ? makeToken(TokenType.PLUS_PLUS) : makeToken(TokenType.PLUS);
        case "-": return match(">") ? makeToken(TokenType.SINGLE_ARROW) : makeToken(TokenType.MINUS);
        case "=": return match("=") ? makeToken(TokenType.EQUAL_EQUAL) : makeToken(TokenType.EQUAL);
        case " ": break;
        case "\n": return makeToken(TokenType.STMT_TERM);
        case "\"": return makeString();
        //case "\'": return stringInterpolation();
        default:
            if (isNumber(char)) {
                return makeNumber();
            } else if (isAlphaNumeric(char)) {
                return makeIdentifier();
            } else {
                throw `Unrecognized character "${char}". Perhaps you intended to put this in a string?`;
            }
    }
    // reset start for next token
    startIndex = currentIndex;
}

// literal makers

// TODO disallow newlines in strings
function makeString(): Token {
    while (!atEnd() && eatChar() !== "\"") {}
    return makeToken(TokenType.STRING, source.slice(startIndex + 1, currentIndex - 1));
}

function makeNumber(): Token {
    // optimized to avoid calls and cache results
    let char: string = "0";
    while (!atEnd() && isNumber(char)) {
        char = eatChar();
    }
    if (char === ".") {
        while (!atEnd() && isNumber(char)) {
            char = eatChar();
        }
    }
    return makeToken(TokenType.NUMBER, Number(source.slice(startIndex, currentIndex)));
}

function makeIdentifier(): Token {
    let char: string = "a";
    while (!atEnd() && isAlphaNumeric(char)) {
        char = eatChar();
    }
    return makeToken(TokenType.IDENTIFER, source.slice(startIndex, currentIndex));
}

/* TODO implement
function stringInterpolation(): Token {
    while (!atEnd() && eatChar() !== "\"") {
        
    }
    
}
*/

// helpers
function isAlphaNumeric(char: string): boolean {
    if (isAlpha(char) || isNumber(char) || char === "_") {
        return true;
    } else {
        return false;
    }
}

function isAlpha(char: string): boolean {
    let lower = char.toLowerCase();
    return lower >= "a" && lower <= "z";
}

function isNumber(char: string): boolean {
    return char >= "0" && char <= "9";
}

function makeToken(type: TokenType, literal: any = null): Token {
    return new Token(type, source.slice(startIndex, currentIndex), literal, line);
}

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

export { isAlphaNumeric, isAlpha, isNumber };
