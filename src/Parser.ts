import Token from "./Token";
import TokenType from "./TokenType";
import { 
    Expr, GroupingExpr, BinaryExpr, 
    PrimaryExpr, UnaryExpr, VariableExpr,
    FunctionExpr, CallExpr, UnderscoreExpr,

    Stmt, PrintStmt, VariableDeclarationStmt, 
    VariableAssignmentStmt, IfStmt, BlockStmt,
    WhileStmt, ReturnStmt, MatchStmt, MatchCase
} from "./Expr";

let tokens: Token[];
let current = 0;

export default function parse(tokenList: Token[]): Stmt[] {
    tokens = tokenList;
    let ast = [];

    eatNewlines();
    try {
        while (!atEnd()) {
            ast.push(makeStmt());
            eatNewlines();
        }
    } finally {
        reset();
    }
    return ast;
}

function matchType(...types: TokenType[]): boolean {
    if (types.includes(lookAhead().type)) {
        eatToken();
        return true;
    } else {
        return false;
    }
}

function atEnd(): boolean {
    // if the counter is beyond the end of the token array we are at EOF as well
    if (current > tokens.length || lookAhead().type === TokenType.EOF) {
        return true;
    } else {
        return false;
    }
}

function lookAhead(): Token {
    return tokens[current];
}

function eatNewlines(): void {
    while (matchType(TokenType.NEWLINE)) continue;
}

function makeStmt(): Stmt {
    if (matchType(TokenType.RETURN)) return new ReturnStmt(makeExpr());
    if (matchType(TokenType.LET)) return finishVariableDeclaration(true);
    if (matchType(TokenType.VAR)) return finishVariableDeclaration(false);
    if (matchType(TokenType.PRINT)) return finishPrintStmt();
    if (matchType(TokenType.IF)) return finishIfStmt();
    if (matchType(TokenType.WHILE)) return finishWhileStmt();
    if (matchType(TokenType.UNTIL)) return finishUntilStmt();
    if (matchType(TokenType.FUN)) return finishFunctionDeclaration();
    if (matchType(TokenType.MATCH)) return finishMatchStmt();
    if (matchType(TokenType.IDENTIFIER)) {
        if (matchType(TokenType.EQUAL)) {
            return finishAssignment(lookBehind(2).lexeme);
        } else {
            backTrack();
        }
    }
    if (matchType(TokenType.OPEN_BRACE)) return finishBlockStmt();
    if (matchType(TokenType.NEWLINE)) throw Error("Unexpected newline; parser bug.");
    return makeExpr();
}

function finishMatchStmt(): Stmt {
    let expr = makeExpr();
    if (!matchType(TokenType.OPEN_BRACE)) {
        throw Error(`Expected "{"; got "${lookAhead().lexeme}"`);
    }
    if (!matchType(TokenType.NEWLINE)) {
        throw Error(`Expected a newline after "{"`);
    }
    let cases: MatchCase[] = [];
    while (!matchType(TokenType.CLOSE_BRACE)) {
        eatNewlines();
        cases.push(makeMatchCase());
    }
    return new MatchStmt(expr, cases);
}

function makeMatchCase(): MatchCase {
    let matchPrimary = makeMatchPrimary();
    if (!matchType(TokenType.RIGHT_DOUBLE_ARROW)) {
        throw Error(`Expected a "=>", got "${lookAhead().lexeme}"`);
    }
    let stmt = makeStmt();
    if (!matchType(TokenType.NEWLINE)) {
        throw Error(`Expected a newline after match case.`);
    }
    return new MatchCase(matchPrimary, stmt);
}

function makeMatchPrimary(): PrimaryExpr | UnderscoreExpr {
    if (matchType(TokenType.TRUE)) return new PrimaryExpr(true);
    if (matchType(TokenType.FALSE)) return new PrimaryExpr(false);
    if (matchType(TokenType.NUMBER, TokenType.STRING)) return new PrimaryExpr(lookBehind().literal);
    if (matchType(TokenType.UNDERSCORE)) return new UnderscoreExpr();
    throw Error(`"${lookAhead().lexeme}" is not a boolean, number, string literal, or "_".`);
}

function finishWhileStmt(): Stmt {
    let condition = makeStmt();
    if (atEnd()) {
        throw Error(`After while expected statement, but reached EOF.`);
    }
    let body = makeStmt();
    return new WhileStmt(condition, body);
}

function finishUntilStmt(): Stmt {
    let condition: Expr = makeStmt();
    if (atEnd()) {
        throw Error(`After until expected statement, but reached EOF.`);
    }
    let body = makeStmt();
    return new WhileStmt(new UnaryExpr(new Token(TokenType.NOT, null, null, null), condition), body);
}

function backTrack(): void {
    current -= 1;
}

function finishFunctionDeclaration(): Stmt {
    if (!matchType(TokenType.IDENTIFIER)) {
        throw Error(`Expected an identifier; got "${lookAhead().lexeme}"`);
    }
    let fnName = lookBehind().lexeme;
    if (!matchType(TokenType.OPEN_PAREN)) {
        throw Error(`Expected "("; got "${lookAhead().lexeme}"`);
    }
    let argsObj = finishFunctDecArgs();
    if (!matchType(TokenType.OPEN_BRACE)) {
        throw Error(`Expected "{"; got "${lookAhead().lexeme}"`);
    }
    let body = finishBlockStmt();
    let fnExp = new FunctionExpr(argsObj, body);
    return new VariableDeclarationStmt(fnName, true, fnExp);
}

function finishFunctDecArgs(): string[] {
    let args: string[] = [];
    while (matchType(TokenType.IDENTIFIER)) {
        args.push(lookBehind().lexeme);
        matchType(TokenType.COMMA);
        eatNewlines();
        //FIXME checks are needed
    }
    if (!matchType(TokenType.CLOSE_PAREN)) {
        throw Error(`Expected ")"; got "${lookAhead().lexeme}"`);
    }
    return args;
}

function finishBlockStmt(): BlockStmt {
    let stmts: Stmt[] = [];
    eatNewlines();
    while (!matchType(TokenType.CLOSE_BRACE)) {
        if (atEnd()) {
            throw Error("Encountered EOF before end of block statement.");
        }
        stmts.push(makeStmt());
        eatNewlines();
    }
    return new BlockStmt(stmts);
}

function finishIfStmt(): Stmt {
    eatNewlines();
    let condition = makeExpr();
    eatNewlines();
    // optionally match then
    matchType(TokenType.THEN);
    eatNewlines();
    if (atEnd()) throw Error(`After if expected statement, but reached EOF.`);
    let maybeBody = makeStmt();
    eatNewlines();

    let elseBody: Stmt = null;
    if (matchType(TokenType.ELSE)) {
        if (atEnd()) throw Error(`After if expected statement, but reached EOF.`);
        let maybeElseBody = makeStmt();
        eatNewlines();
        if (maybeElseBody) {
            elseBody = maybeElseBody;
        } else {
            throw Error(`After else expected statement, but got ${lookAhead().lexeme}`);
        }
    }
    return new IfStmt(condition, maybeBody, elseBody);
}

function finishPrintStmt(): Stmt {
    let stmt = new PrintStmt(makeStmt());
    return stmt;
}

function makeExpr(): Expr {
    return makeBinaryLogical();
}

function finishVariableDeclaration(immutable: boolean): Stmt {
    // TODO check if variable has already been declared
    if (!matchType(TokenType.IDENTIFIER)) {
        if (matchType(TokenType.STRING)) throw Error(`Expected identifier; got a string literal.`);
        throw Error(`Expected identifier; got "${lookAhead().lexeme}".`);
    }
    let identifier = lookBehind().lexeme;
    if (!matchType(TokenType.EQUAL)) {
        throw Error(`Expected "="; got "${lookAhead().lexeme}".`);
    }
    eatNewlines();
    let right = makeStmt();
    if (matchType(TokenType.NEWLINE) || atEnd()) {
        return new VariableDeclarationStmt(identifier, immutable, right);
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
    let right = makeStmt();
    return new VariableAssignmentStmt(identifier, right);
}

function makeBinaryLogical(): Expr {
    return makeBinaryExpr([TokenType.AND, TokenType.OR], makeEquality);
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
    return makeBinaryExpr([TokenType.STAR, TokenType.SLASH], makeMod);
}

function makeMod(): Expr {
    return makeBinaryExpr([TokenType.MOD], makeUnary);
}

function makeUnary(): Expr {
    if (matchType(TokenType.MINUS, TokenType.NOT)) {
        let operator = lookBehind();
        let right = makeUnary();
        return new UnaryExpr(operator, right);
    }
    return makeCall();
}

function makeCall(): Expr {
    let expr: Expr = makePrimary();

    while (true) {
        if (matchType(TokenType.OPEN_PAREN)) {
            expr = finishCall(expr);
        } else {
            break;
        }
    }
    return expr;
}

function finishCall(callee: Expr) {
    let args: Expr[] = [];
    if (!matchType(TokenType.CLOSE_PAREN)) {
        do {
            args.push(makeExpr());
        } while (matchType(TokenType.COMMA));
        if (!matchType(TokenType.CLOSE_PAREN)) {
            throw Error(`Must terminate function call with ")"`);
        }
    }
    return new CallExpr(callee, args);
}

function makePrimary(): Expr {
    if (matchType(TokenType.TRUE)) return new PrimaryExpr(true);
    if (matchType(TokenType.FALSE)) return new PrimaryExpr(false);
    if (matchType(TokenType.NUMBER, TokenType.STRING)) return new PrimaryExpr(lookBehind().literal);
    if (matchType(TokenType.IDENTIFIER)) {
        if (matchType(TokenType.RIGHT_SINGLE_ARROW)) {
            return finishLambda([lookBehind(2).lexeme]);
        } else {
            let identifier = lookBehind().lexeme;
            return new VariableExpr(identifier);
        }
    }

    if (matchType(TokenType.OPEN_PAREN)) {
        if (matchType(TokenType.IDENTIFIER)) {
            if (matchType(TokenType.COMMA, TokenType.CLOSE_PAREN)) {
                current -= 2;
                let args: string[] = finishFunctDecArgs();
                if (!matchType(TokenType.RIGHT_SINGLE_ARROW)) {
                    throw Error(`Expected "->", got "${lookAhead().lexeme}"`);
                }
                return finishLambda(args);
            } else {
                current -= 1;
            }
        }
        return finishGrouping();
    }

    // should be impossible to get here
    throw Error(`Expected a primary; got "${lookAhead().lexeme}"`);
}

function finishLambda(args: string[]): FunctionExpr {
    eatNewlines();
    let body = makeStmt();
    // TODO: add checks and nice error messages
    return new FunctionExpr(args, body);
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
