import Token from "./Token";
import TokenType from "./TokenType";
import { 
    Expr, GroupingExpr, BinaryExpr, 
    PrimaryExpr, UnaryExpr, VariableExpr 
} from "./Expr";
import { 
    Stmt, PrintStmt, VariableDeclarationStmt, 
    VariableAssignmentStmt, IfStmt, BlockStmt
} from "./Stmt";

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

function makeStmt(): Stmt | void {
    if (matchType(TokenType.LET)) return finishVariableDeclaration(true);
    if (matchType(TokenType.VAR)) return finishVariableDeclaration(false);
    if (matchType(TokenType.PRINT)) return finishPrintStmt();
    if (matchType(TokenType.IF)) return finishIfStmt();
    if (matchType(TokenType.IDENTIFIER)) {
        // TODO support for dot notation here
        if (matchType(TokenType.EQUAL)) {
            return finishAssignment(lookBehind(2).lexeme);
        } else {
            backTrack();
        }
    }
    if (matchType(TokenType.OPEN_BRACE)) return finishBlockStmt();
    if (matchType(TokenType.STMT_TERM)) return null;
    return makeExprStmt();
}

function backTrack(): void {
    current -= 1;
}

function finishBlockStmt(): Stmt {
    let stmts: Stmt[] = [];
    while (!matchType(TokenType.CLOSE_BRACE)) {
        let maybeStmt = makeStmt();
        if (maybeStmt) stmts.push(maybeStmt);
        if (atEnd()) {
            throw Error("Encountered EOF before end of block statement.");
        }
    }
    return new BlockStmt(stmts);
}

function finishIfStmt(): Stmt {
    if (!matchType(TokenType.OPEN_PAREN)) {
        throw Error(`Expected "("; got "${lookAhead().lexeme}"`);
    }
    let condition = makeExpr();
    if (!matchType(TokenType.CLOSE_PAREN)) {
        throw Error(`Expected ")"; got "${lookAhead().lexeme}"`);
    }
    let maybeBody = makeStmt();
    if (!maybeBody) {
        throw Error(`After if expected statement, but got ${lookAhead().lexeme}`);
    }
    let elseBody: Stmt = null;
    if (matchType(TokenType.ELSE)) {
        let maybeElseBody = makeStmt();
        if (maybeElseBody) {
            elseBody = maybeElseBody;
        } else {
            throw Error(`After else expected statement, but got ${lookAhead().lexeme}`);
        }
    }
    return new IfStmt(condition, maybeBody, elseBody);
}

function finishPrintStmt(): Stmt {
    let stmt = new PrintStmt(makeExpr());
    return stmt;
}

function makeExprStmt(): Stmt {
    let expr = makeExpr();
    if (!matchType(TokenType.STMT_TERM, TokenType.EOF)) {
        throw Error(`Expected a newline; got "${lookAhead().lexeme}"`);
    }
    return expr;
}

function makeExpr(): Expr {
    return makeEquality();
}

function finishVariableDeclaration(immutable: boolean): Stmt {
    // TODO check if variable has already been declared
    if (!matchType(TokenType.IDENTIFIER)) {
        if (matchType(TokenType.STRING)) throw Error(`Expected identifier; got a string literal.`);
        throw Error(`Expected identifier; got "${lookAhead().lexeme}".`);
    }
    let identifier = lookBehind();
    if (!matchType(TokenType.EQUAL)) {
        throw Error(`Expected "="; got "${lookAhead().lexeme}".`);
    }
    let right = makeExpr();

    if (matchType(TokenType.STMT_TERM, TokenType.EOF)) {
        return new VariableDeclarationStmt(identifier.lexeme, immutable, right);
    } else {
        throw Error("Expected a newline!");
    }
}

function finishAssignment(identifier: string): Stmt {
    // TODO check if identifier has already been declared
    /*
    if (!matchType(TokenType.EQUAL)) {
        throw Error(`Expected "=", got ${lookAhead().lexeme}.`);
    }
    */
    let right = makeExpr();
    return new VariableAssignmentStmt(identifier, right);
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
        return new UnaryExpr(operator, right);
    }
    return makePrimary();
}

function makePrimary(): Expr {
    if (matchType(TokenType.TRUE)) return new PrimaryExpr(true);
    if (matchType(TokenType.FALSE)) return new PrimaryExpr(false);
    if (matchType(TokenType.NUMBER, TokenType.STRING)) return new PrimaryExpr(lookBehind().literal);
    if (matchType(TokenType.IDENTIFIER)) return new VariableExpr(lookBehind());

    if (matchType(TokenType.OPEN_PAREN)) return finishGrouping();

    // should be impossible to get here
    throw Error(`Expected a primary; got "${lookAhead().lexeme}"`);
}

function finishGrouping(): Expr {
    let expr = makeExpr();
    if (matchType(TokenType.CLOSE_PAREN)) return new GroupingExpr(expr);
    else throw Error(`Expected ")", got "${lookAhead().lexeme}"`);
}

function lookBehind(distance: number = 1): Token {
    return tokens[current - distance];
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
        expr = new BinaryExpr(expr, operator, right);
    }
    return expr;
}

function reset() {
    current = 0;
}
