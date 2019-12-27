import Token from "./Token";
import TokenType from "./TokenType";
import Expr from "./Expr";

let tokens: Token[];
let current = 0;

export function parse(tokenList: Token[]): Expr[] {
    tokens = tokenList;
    let ast = [];
    while (!atEnd()) {
        ast.push(makeExpr());
    }
    return ast;
}

function consume(tt: TokenType, err: string): Token {
    if (matchType(tt)) {
        current += 1;
        return tokens[current];
    } else {
        throw err;
    }
}

function matchType(...types: TokenType[]): boolean {
    return types.reduce((acc, cur) => acc || (tokens[current].type === cur), false);
}

function atEnd(): boolean {
    if (lookAhead().type === TokenType.EOF) {
        return true;
    } else {
        return false;
    }
}

function lookAhead(): Token {
    return tokens[current];
}

function makeExpr(): Expr {
    return makeEquality();
}

function makeEquality(): Expr {
    return makeBinaryExpr([TokenType.EQUAL_EQUAL], makeComparision);
}

function makeComparision(): Expr {
    return makeBinaryExpr([TokenType.GREATER, TokenType.GREATER_EQUAL,
                          TokenType.LESS, TokenType.LESS_EQUAL], makeAddition);
}

function makeAddition(): Expr {
    return makeBinaryExpr([TokenType.PLUS, TokenType.MINUS], makeMultiplication);
}

function makeMultiplication(): Expr {
    return makeBinaryExpr([TokenType.STAR, TokenType.SLASH], makeUnary);
}

function makeUnary(): Expr {
    if (matchType(TokenType.MINUS)) {
        let operator = lookBehind();
        let right = makeUnary();
        return new Expr.Unary(operator, right);
    }
    return makePrimary();
}

function makePrimary(): Expr {
    if (matchType(TokenType.TRUE)) return new Expr.Primary(true);
    if (matchType(TokenType.FALSE)) return new Expr.Primary(false);
    if (matchType(TokenType.NUMBER, TokenType.STRING)) return new Expr.Primary(lookBehind().literal);

    // TODO: paren and grouping handing
}

function lookBehind(): Token {
    return tokens[current - 1];
}

function eatToken(): Token {
    current += 1;
    return tokens[current - 1];
}

function makeBinaryExpr(matches: TokenType[], higherPrecedenceOperation: () => Expr) {
    let expr = higherPrecedenceOperation();

    while (matchType(...matches)) {
        let operator = lookBehind();
        let right = higherPrecedenceOperation();
        expr = new Expr.Binary(expr, operator, right);
    }
    return expr;
}
