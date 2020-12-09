import Token from "./Token";
import TokenType from "./TokenType";
import {
    Expr,
    GroupingExpr,
    BinaryExpr,
    PrimaryExpr,
    UnaryExpr,
    VariableExpr,
    FunctionExpr,
    CallExpr,
    UnderscoreExpr,
    PrintStmt,
    VariableDeclarationStmt,
    VariableAssignmentStmt,
    IfStmt,
    BlockStmt,
    WhileStmt,
    ReturnStmt,
    MatchStmt,
    MatchCase,
    FunctionDefinition
} from "./Expr";
import Ast from "./Ast";
import astTransforms from "./AstTransforms";
import { parseError, runtimePanic } from "./Debug";

let tokens: Token[];
let start = 0;
let current = 0;

export default function parse(tokenList: Token[]): Expr[] {
    tokens = tokenList;
    let exprs = [];

    eatNewlines();
    while (!atEnd()) {
        try {
            exprs.push(makeStmt());
        } catch (e) {
            console.log(e.message);
            eatToken();
        }
        eatNewlines();
    }
    reset();
    return astTransforms.reduce(
        (acc: Ast, cur: (expr: Expr) => Expr) => acc.map(cur),
        new Ast(exprs)
    ).exprs;
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

function makeStmt(): Expr {
    if (matchType(TokenType.OPEN_BRACKET)) {
        return finishArrayLiteral();
    }
    if (matchType(TokenType.RETURN))
        return new ReturnStmt(makeExpr(), getTokens());
    if (matchType(TokenType.VAR)) return finishVariableDeclaration();
    if (matchType(TokenType.PRINT)) return finishPrintStmt();
    if (matchType(TokenType.IF)) return finishIfStmt();
    if (matchType(TokenType.WHILE)) return finishWhileStmt();
    if (matchType(TokenType.UNTIL)) return finishUntilStmt();
    if (matchType(TokenType.FUN)) return finishFunctionDeclaration();
    if (matchType(TokenType.MATCH)) return finishMatchStmt();
    if (matchType(TokenType.IDENTIFIER)) {
        if (matchType(TokenType.LEFT_SINGLE_ARROW)) {
            let identifier = lookBehind(2).lexeme;
            return finishAssignment(identifier);
        } else if (matchType(TokenType.EQUAL)) {
            let identifier = lookBehind(2).lexeme;
            return finishImmutableDeclaration(identifier);
        } else {
            backTrack();
        }
    }
    if (matchType(TokenType.OPEN_BRACE)) return finishBlockStmt();
    if (matchType(TokenType.NEWLINE))
        throw Error("Unexpected newline; parser bug.");
    return makeExpr();
}

function finishArrayLiteral(): Expr {
    const items = readCommaDelimitedList();
    if (!matchType(TokenType.CLOSE_BRACKET)) {
        throw parseError(`Expected "]", got ${lookAhead().lexeme}`, lookAhead());
    }
    return new PrimaryExpr(items, getTokens());
}

function finishVariableDeclaration(): Expr {
    if (!matchType(TokenType.IDENTIFIER)) {
        throw parseError(
            `Expected identifier; got "${lookAhead().lexeme}"`,
            lookAhead()
        );
    }
    let identifier: string = lookBehind().lexeme;
    if (!matchType(TokenType.LEFT_SINGLE_ARROW)) {
        if (matchType(TokenType.EQUAL)) {
            throw parseError(
                `Must use "<-" for variable declaration, not "=".`,
                lookBehind()
            );
        } else {
            throw parseError(
                `Expected "<-", got "${lookAhead().lexeme}"`,
                lookAhead()
            );
        }
    }
    eatNewlines();
    let right: Expr = makeStmt();
    if (matchType(TokenType.NEWLINE) || atEnd()) {
        return new VariableDeclarationStmt(
            identifier,
            false,
            right,
            getTokens()
        );
    } else {
        throw parseError("Expected a newline!", lookBehind());
    }
}

function finishImmutableDeclaration(identifier: string): Expr {
    eatNewlines();
    let expr: Expr = makeStmt();
    if (matchType(TokenType.NEWLINE) || atEnd() || lookAhead().lexeme === "}") {
        return new VariableDeclarationStmt(identifier, true, expr, getTokens());
    } else {
        throw parseError("Expected a newline!", lookAhead());
    }
}

function finishMatchStmt(): Expr {
    let expr = makeExpr();
    if (!matchType(TokenType.OPEN_BRACE)) {
        throw parseError(
            `Expected "{"; got "${lookAhead().lexeme}"`,
            lookAhead()
        );
    }
    if (!matchType(TokenType.NEWLINE)) {
        throw parseError(`Expected a newline after "{"`, lookAhead());
    }
    let cases: MatchCase[] = [];
    while (!matchType(TokenType.CLOSE_BRACE)) {
        eatNewlines();
        cases.push(makeMatchCase());
    }
    return new MatchStmt(expr, cases, getTokens());
}

function makeMatchCase(): MatchCase {
    let matchPrimary = makeMatchPrimary();
    if (!matchType(TokenType.RIGHT_DOUBLE_ARROW)) {
        throw parseError(
            `Expected a "=>", got "${lookAhead().lexeme}"`,
            lookAhead()
        );
    }
    let expr = makeStmt();
    if (!matchType(TokenType.NEWLINE)) {
        throw parseError(`Expected a newline after match case.`, lookAhead());
    }
    return new MatchCase(matchPrimary, expr);
}

function makeMatchPrimary(): PrimaryExpr | UnderscoreExpr {
    if (matchType(TokenType.TRUE)) return new PrimaryExpr(true, getTokens());
    if (matchType(TokenType.FALSE)) return new PrimaryExpr(false, getTokens());
    if (matchType(TokenType.NUMBER, TokenType.STRING))
        return new PrimaryExpr(lookBehind().literal, getTokens());
    if (matchType(TokenType.UNDERSCORE)) return new UnderscoreExpr(getTokens());
    throw parseError(
        `"${
            lookAhead().lexeme
        }" is not a boolean, number, string literal, or "_".`,
        lookAhead()
    );
}

function finishWhileStmt(): Expr {
    let condition = makeStmt();
    if (atEnd()) {
        throw parseError(
            `After while expected statement, but reached EOF.`,
            lookBehind()
        );
    }
    let body = makeStmt();
    return new WhileStmt(condition, body, getTokens());
}

function finishUntilStmt(): Expr {
    let condition: Expr = makeStmt();
    if (atEnd()) {
        throw parseError(
            `After until expected statement, but reached EOF.`,
            lookBehind()
        );
    }
    let body = makeStmt();
    return new WhileStmt(
        new UnaryExpr(
            new Token(TokenType.NOT, null, null, null),
            condition,
            getTokens()
        ),
        body,
        getTokens()
    );
}

function backTrack(): void {
    current -= 1;
}

function finishFunctionDeclaration(): Expr {
    if (!matchType(TokenType.IDENTIFIER)) {
        throw parseError(
            `Expected an identifier; got "${lookAhead().lexeme}"`,
            lookAhead()
        );
    }
    let fnName = lookBehind().lexeme;
    // FIXME better error
    if (!matchType(TokenType.EQUAL))
        throw parseError("Expected =", lookAhead());
    eatNewlines();
    let lambda = makeLambda();
    return new FunctionDefinition(
        new VariableDeclarationStmt(fnName, true, lambda, getTokens()),
        getTokens()
    );
}

function makeLambda(): FunctionExpr {
    let args: string[];
    if (matchType(TokenType.IDENTIFIER)) {
        args = [lookBehind().lexeme];
    } else if (matchType(TokenType.OPEN_PAREN)) {
        args = finishFunctDecArgs();
    } else {
        // FIXME better error
        throw parseError("Expected identifier or open paren", lookAhead());
    }
    // FIXME better error
    if (!matchType(TokenType.RIGHT_SINGLE_ARROW))
        throw parseError("Expected ->", lookAhead());
    return finishLambda(args);
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
        throw parseError(
            `Expected ")"; got "${lookAhead().lexeme}"`,
            lookAhead()
        );
    }
    return args;
}

function finishBlockStmt(): BlockStmt {
    let stmts: Expr[] = [];
    eatNewlines();
    while (!matchType(TokenType.CLOSE_BRACE)) {
        if (atEnd()) {
            throw parseError(
                "Encountered EOF before end of block statement.",
                lookAhead()
            );
        }
        stmts.push(makeStmt());
        eatNewlines();
    }
    return new BlockStmt(stmts, getTokens());
}

function finishIfStmt(): Expr {
    eatNewlines();
    let condition = makeExpr();
    eatNewlines();
    // optionally match then
    matchType(TokenType.THEN);
    eatNewlines();
    if (atEnd())
        throw parseError(
            `After if expected statement, but reached EOF.`,
            lookBehind()
        );
    let maybeBody = makeStmt();
    eatNewlines();

    let elseBody: Expr = null;
    if (matchType(TokenType.ELSE)) {
        if (atEnd())
            throw parseError(
                `After if expected statement, but reached EOF.`,
                lookBehind()
            );
        let maybeElseBody = makeStmt();
        eatNewlines();
        if (maybeElseBody) {
            elseBody = maybeElseBody;
        } else {
            throw parseError(
                `After else expected statement, but got ${lookAhead().lexeme}`,
                lookAhead()
            );
        }
    }
    return new IfStmt(condition, maybeBody, elseBody, getTokens());
}

function finishPrintStmt(): Expr {
    let stmt = new PrintStmt(makeStmt(), getTokens());
    return stmt;
}

function makeExpr(): Expr {
    return makeBinaryLogical();
}

function finishAssignment(identifier: string): Expr {
    // TODO check if identifier has already been declared
    eatNewlines();
    let right = makeStmt();
    return new VariableAssignmentStmt(identifier, right, getTokens());
}

function makeBinaryLogical(): Expr {
    return makeBinaryExpr([TokenType.AND, TokenType.OR], makeEquality);
}

function makeEquality(): Expr {
    return makeBinaryExpr([TokenType.EQUAL_EQUAL], makeComparision);
}

function makeComparision(): Expr {
    return makeBinaryExpr(
        [
            TokenType.GREATER,
            TokenType.GREATER_EQUAL,
            TokenType.LESS,
            TokenType.LESS_EQUAL
        ],
        makeConcat
    );
}

function makeConcat(): Expr {
    return makeBinaryExpr([TokenType.PLUS_PLUS], makeAddition);
}

function makeAddition(): Expr {
    return makeBinaryExpr(
        [TokenType.PLUS, TokenType.MINUS],
        makeMultiplication
    );
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
        return new UnaryExpr(operator, right, getTokens());
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

function readCommaDelimitedList(): Expr[] {
    let list: Expr[] = [];
    do {
        list.push(makeExpr());
    } while (matchType(TokenType.COMMA));
    return list;
}

function finishCall(callee: Expr) {
    let args: Expr[] = [];
    if (!matchType(TokenType.CLOSE_PAREN)) {
        args = readCommaDelimitedList();
        if (!matchType(TokenType.CLOSE_PAREN)) {
            throw parseError(
                `Must terminate function call with ")"`,
                lookAhead()
            );
        }
    }
    return new CallExpr(callee, args, getTokens());
}

function makePrimary(): Expr {
    if (matchType(TokenType.TRUE)) return new PrimaryExpr(true, getTokens());
    if (matchType(TokenType.FALSE)) return new PrimaryExpr(false, getTokens());
    if (matchType(TokenType.NUMBER, TokenType.STRING))
        return new PrimaryExpr(lookBehind().literal, getTokens());
    if (matchType(TokenType.IDENTIFIER)) {
        if (matchType(TokenType.RIGHT_SINGLE_ARROW)) {
            return finishLambda([lookBehind(2).lexeme]);
        } else {
            let identifier = lookBehind().lexeme;
            return new VariableExpr(identifier, getTokens());
        }
    }

    if (matchType(TokenType.OPEN_PAREN)) {
        if (matchType(TokenType.IDENTIFIER)) {
            if (matchType(TokenType.COMMA, TokenType.CLOSE_PAREN)) {
                current -= 2;
                let args: string[] = finishFunctDecArgs();
                if (!matchType(TokenType.RIGHT_SINGLE_ARROW)) {
                    throw parseError(
                        `Expected "->", got "${lookAhead().lexeme}"`,
                        lookAhead()
                    );
                }
                return finishLambda(args);
            } else {
                current -= 1;
            }
        } else if (
            matchType(TokenType.CLOSE_PAREN) &&
            matchType(TokenType.RIGHT_SINGLE_ARROW)
        ) {
            return finishLambda([]);
        }
        // be careful moving this statement
        // the state machine above is subtle
        return finishGrouping();
    }

    if (matchType(TokenType.OPEN_BRACKET)) {
        return finishArrayLiteral();
    }

    // should be impossible to get here
    throw parseError(
        `Expected a primary; got "${lookAhead().lexeme}"`,
        lookAhead()
    );
}

function finishLambda(args: string[]): FunctionExpr {
    eatNewlines();
    let body = makeStmt();
    // TODO: add checks and nice error messages
    return new FunctionExpr(args, body, getTokens());
}

function finishGrouping(): Expr {
    let expr = makeExpr();
    if (matchType(TokenType.CLOSE_PAREN))
        return new GroupingExpr(expr, getTokens());
    else
        throw parseError(
            `Expected ")", got "${lookAhead().lexeme}"`,
            lookAhead()
        );
}

function lookBehind(distance: number = 1): Token {
    return tokens[current - distance];
}

function eatToken(): Token {
    current += 1;
    return tokens[current - 1];
}

function makeBinaryExpr(
    matches: TokenType[],
    higherPrecedenceOperation: () => Expr
) {
    let expr = higherPrecedenceOperation();

    while (matchType(...matches)) {
        let operator = lookBehind();
        let right = higherPrecedenceOperation();
        expr = new BinaryExpr(expr, operator, right, getTokens());
    }
    return expr;
}

function reset() {
    start = 0;
    current = 0;
    tokens = null;
}

function getTokens(): Token[] {
    return tokens.slice(start, current);
}
