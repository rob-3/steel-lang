import Token from "./Token";
import TokenType from "./TokenType";
import { 
    Expr, GroupingExpr, BinaryExpr, 
    PrimaryExpr, UnaryExpr, VariableExpr,
    FunctionExpr, CallExpr,

    Stmt, PrintStmt, VariableDeclarationStmt, 
    VariableAssignmentStmt, IfStmt, BlockStmt,
    WhileStmt, ReturnStmt
} from "./Expr";

let tokens: Token[];
let current = 0;

export default function parse(tokenList: Token[]): Stmt[] {
    tokens = tokenList;
    let ast = [];
    try {
        while (!atEnd()) {
            let maybeStmt = makeStmt();
            if (maybeStmt) {
                ast.push(maybeStmt);
            }
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
    if (matchType(TokenType.RETURN)) return new ReturnStmt(makeExpr());
    if (matchType(TokenType.LET)) return finishVariableDeclaration(true);
    if (matchType(TokenType.VAR)) return finishVariableDeclaration(false);
    if (matchType(TokenType.PRINT)) return finishPrintStmt();
    if (matchType(TokenType.IF)) return finishIfStmt();
    if (matchType(TokenType.WHILE)) return finishWhileStmt();
    if (matchType(TokenType.FUN)) return finishFunctionDeclaration();
    if (matchType(TokenType.IDENTIFIER)) {
        // TODO support for dot notation here
        if (matchType(TokenType.EQUAL)) {
            return finishAssignment(lookBehind(2).lexeme);
        } else {
            backTrack();
        }
    }
    if (matchType(TokenType.OPEN_BRACE)) return finishBlockStmt();
    if (matchType(TokenType.NEWLINE)) return null;
    return makeExpr();
}

function finishWhileStmt(): Stmt {
    if (!matchType(TokenType.OPEN_PAREN)) {
        throw Error(`Expected "("; got "${lookAhead().lexeme}"`);
    }
    let condition = makeExpr();
    if (!matchType(TokenType.CLOSE_PAREN)) {
        throw Error(`Expected ")"; got "${lookAhead().lexeme}"`);
    }
    let body = makeStmt();
    if (!body) {
        throw Error(`After while expected statement, but got ${lookAhead().lexeme}`);
    }
    return new WhileStmt(condition, body);
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
        //FIXME checks are needed
    }
    if (!matchType(TokenType.CLOSE_PAREN)) {
        throw Error(`Expected ")"; got "${lookAhead().lexeme}"`);
    }
    return args;
}

function finishBlockStmt(): BlockStmt {
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
    let condition = makeExpr();
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
    let right = makeExpr();
    if (matchType(TokenType.NEWLINE, TokenType.EOF)) {
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
    let right = makeExpr();
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
            return finishVeryShortLambda(lookBehind(2).lexeme);
        } else {
            let identifier = lookBehind().lexeme;
            return new VariableExpr(identifier);
        }
    }

    if(matchType(TokenType.FUN)) return finishLambda();

    if (matchType(TokenType.OPEN_PAREN)) {
        if (matchType(TokenType.IDENTIFIER)) {
            if (matchType(TokenType.COMMA, TokenType.CLOSE_PAREN)) {
                current -= 2;
                return finishShortLambda();
            } else {
                current -= 1;
            }
        }
        return finishGrouping();
    }

    // should be impossible to get here
    throw Error(`Expected a primary; got "${lookAhead().lexeme}"`);
}

function finishVeryShortLambda(arg: string): FunctionExpr {
    // TODO: add checks and error productions
    matchType(TokenType.OPEN_BRACE);
    let body = makeExpr();
    return new FunctionExpr([arg], new BlockStmt([body]));
}

function finishShortLambda() {
    let args: string[] = finishFunctDecArgs();
    if (!matchType(TokenType.RIGHT_SINGLE_ARROW)) {
        throw Error(`Expected "->", got "${lookAhead().lexeme}"`);
    }
    if (matchType(TokenType.OPEN_BRACE)) {
        let body = finishBlockStmt();
        return new FunctionExpr(args, body);
    } else {
        let body = makeExpr();
        return new FunctionExpr(args, new BlockStmt([body]));
    }
}

function finishLambda(): FunctionExpr {
    if (!matchType(TokenType.OPEN_PAREN)) {
        throw Error(`Expected "("; got "${lookAhead().lexeme}"`);
    }
    let argsObj: string[] = finishFunctDecArgs();
    matchType(TokenType.OPEN_BRACE);
    let body = finishBlockStmt();
    // TODO: add checks and nice error messages
    return new FunctionExpr(argsObj, body);
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
