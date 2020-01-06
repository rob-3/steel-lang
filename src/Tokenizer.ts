import TokenType from "./TokenType";
import Token from "./Token";

let startIndex = 0;
let currentIndex = 0;
let source: string;
let line = 1;
let commentNests = 0;

export default function tokenize(src: string): Token[] {
    let tokens = [];
    try {
        source = src;
        while (!atEnd()) {
            let maybeToken = scanToken();
            if (maybeToken) {
                tokens.push(maybeToken);
            }
            // reset start for next token
            startIndex = currentIndex;
        }
        tokens.push(new Token(TokenType.EOF, "", null, line));
    } finally {
        reset();
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
            return null;
        case "+": return match("+") ? makeToken(TokenType.PLUS_PLUS) : makeToken(TokenType.PLUS);
        case "-": return match(">") ? makeToken(TokenType.SINGLE_ARROW) : makeToken(TokenType.MINUS);
        case "=": return match("=") ? makeToken(TokenType.EQUAL_EQUAL) : makeToken(TokenType.EQUAL);
        case " ": return;
        case "\n": 
            let token = makeToken(TokenType.STMT_TERM);
            line += 1;
            return token;
        case "\"": return makeString();
        //case "\'": return stringInterpolation();
        default:
            if (isNumber(char)) {
                return makeNumber();
            } else if (isAlpha(char)) {
                return makeIdentifierOrKeyword();
            } else {
                throw `Unrecognized character "${char}". Perhaps you intended to put this in a string?`;
            }
    }
}

// literal makers

function makeString(): Token {
    let cache = lookAhead()
    while (cache !== "\"") {
        if(cache === "\n" || atEnd()) {
            throw "Unterminated string literal.";
        }
        eatChar();
        cache = lookAhead();
    }
    eatChar();
    return makeToken(TokenType.STRING, source.slice(startIndex + 1, currentIndex - 1));
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
    return makeToken(TokenType.NUMBER, Number(source.slice(startIndex, currentIndex)));
}

function makeIdentifierOrKeyword(): Token {
    while (!atEnd() && isLegalIdentifierChar(lookAhead())) {
        eatChar();
    }
    let lexeme = source.slice(startIndex, currentIndex);
    switch (lexeme) {
        case "let": return makeToken(TokenType.LET);
        case "var": return makeToken(TokenType.VAR);
        case "true": return makeToken(TokenType.TRUE, true);
        case "false": return makeToken(TokenType.FALSE, false);
        case "fun": return makeToken(TokenType.FUN);
        case "if": return makeToken(TokenType.IF);
        case "else": return makeToken(TokenType.ELSE);
        case "for": return makeToken(TokenType.FOR);
        case "while": return makeToken(TokenType.WHILE);
        case "and": return makeToken(TokenType.AND);
        case "or": return makeToken(TokenType.OR);
        case "not": return makeToken(TokenType.NOT);
        case "in": return makeToken(TokenType.IN);
        default: return makeToken(TokenType.IDENTIFER);
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
    line = 1;
    commentNests = 0;
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
    while (lookAhead() !== "\n" && !atEnd()) {
        eatChar();
    }
}

function eatMultiLineComment(): void {
    commentNests += 1;
    while (!atEnd() && commentNests > 0) {
        if (eatChar() === "/") {
            if (lookBehind(2) === "*") {
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

export { isAlphaNumeric, isAlpha, isNumber, isLegalIdentifierChar };
