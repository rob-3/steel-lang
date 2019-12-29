import Token from "./Token";
import TokenType from "./TokenType";
import Expr from "./Expr";
import Stmt from "./Stmt";

let tokens: Token[];
let current = 0;

export default function parse(tokenList: Token[]): Stmt[] {
    tokens = tokenList;
    let ast = [];
    try {
        while (!atEnd()) {
            ast.push(makeStmt());
        }
    } finally {
        reset();
    }
    return ast;
}

function expectAndEat(tt: TokenType[], err: string): void {
    if (matchType(...tt)) {
        return;
    } else {
        throw Error(err);
    }
}

function matchType(...types: TokenType[]): boolean {
    if (atEnd()) {
        if (types.includes(TokenType.EOF)) {
            // we don't eat the EOF so that the top level loop won't try to
            // lookAhead past the end of the source array
            return true;
        } else {
            return false;
        }
    } else {
        if (types.includes(lookAhead().type)) {
            eatToken();
            return true;
        } else {
            return false;
        }
    }
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

function makeStmt(): Stmt {
    return makeExprStmt();
}

function makeExprStmt(): Stmt {
    let expr = makeExpr();
    expectAndEat([TokenType.STMT_TERM, TokenType.EOF], "Expected a newline!");
    return expr;
}

function makeExpr(): Expr {
    return makeEquality();
}

function makeEquality(): Expr {
    return makeBinaryExpr([TokenType.EQUAL_EQUAL], makeComparision);
}

function makeComparision(): Expr {
    return makeBinaryExpr([TokenType.GREATER, TokenType.GREATER_EQUAL,
                          TokenType.LESS, TokenType.LESS_EQUAL], makeConcat);
}

function makeConcat(): Expr {
    return makeBinaryExpr([TokenType.PLUS_PLUS], makeAddition);
}

function makeAddition(): Expr {
    return makeBinaryExpr([TokenType.PLUS, TokenType.MINUS], makeMultiplication);
}

function makeMultiplication(): Expr {
    return makeBinaryExpr([TokenType.STAR, TokenType.SLASH], makeUnary);
}

function makeUnary(): Expr {
    if (matchType(TokenType.MINUS, TokenType.NOT)) {
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

function reset() {
    current = 0;
}
