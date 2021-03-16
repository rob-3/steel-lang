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
    UntilStmt,
    ReturnStmt,
    MatchStmt,
    MatchCase,
    FunctionDefinition,
    IndexExpr,
    ArrayLiteral,
} from "./Expr";
import Ast from "./Ast";
import astTransforms from "./AstTransforms";
import { ParseError } from "./Debug";
import { Either, Left, Right } from "purify-ts";

type Result<T> = Either<Error, T>;

let tokens: Token[];
let start = 0;
let current = 0;

export default function parse(tokenList: Token[]): Expr[] {
    tokens = tokenList;
    const parseTree: Result<Expr>[] = [];

    eatNewlines();
    while (!atEnd()) {
        parseTree.push(makeStmt());
        eatNewlines();
    }
    reset();
    const exprs: Result<Expr[]> = Either.sequence(parseTree);
    if (exprs.isLeft()) {
        exprs.mapLeft((err) => console.log(err.message));
        return [];
    } else {
        return astTransforms.reduce(
            (acc: Ast, cur: (expr: Expr) => Expr) => acc.map(cur),
            new Ast(exprs.unsafeCoerce())
        ).exprs;
    }
}

function matchType(...types: TokenType[]): boolean {
    if (!atEnd() && types.includes(lookAhead().type)) {
        eatToken();
        return true;
    } else {
        return false;
    }
}

function atEnd(): boolean {
    // if the counter is beyond the end of the token array we are at EOF as well
    if (current >= tokens.length || lookAhead().type === TokenType.EOF) {
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

function makeStmt(): Result<Expr> {
    if (matchType(TokenType.OPEN_BRACKET)) {
        return finishArrayLiteral();
    }
    if (matchType(TokenType.RETURN))
        return Right(new ReturnStmt(makeExpr().unsafeCoerce(), getTokens()));
    if (matchType(TokenType.VAR)) return finishVariableDeclaration();
    if (matchType(TokenType.PRINT)) return finishPrintStmt();
    if (matchType(TokenType.IF)) return finishIfStmt();
    if (matchType(TokenType.WHILE)) return finishWhileStmt();
    if (matchType(TokenType.UNTIL)) return finishUntilStmt();
    if (matchType(TokenType.FUN)) return finishFunctionDeclaration();
    if (matchType(TokenType.MATCH)) return finishMatchStmt();
    if (matchType(TokenType.IDENTIFIER)) {
        if (matchType(TokenType.LEFT_SINGLE_ARROW)) {
            const identifier = lookBehind(2).lexeme;
            return finishAssignment(identifier);
        } else if (matchType(TokenType.EQUAL)) {
            const identifier = lookBehind(2).lexeme;
            return finishImmutableDeclaration(identifier);
        } else {
            backTrack();
        }
    }
    if (matchType(TokenType.OPEN_BRACE)) return finishBlockStmt();
    if (matchType(TokenType.NEWLINE))
        return Left(Error("Unexpected newline; parser bug."));
    return makeExpr();
}

function finishArrayLiteral(): Result<Expr> {
    if (matchType(TokenType.CLOSE_BRACKET))
        return Right(new ArrayLiteral([], getTokens()));
    const items: Result<Expr[]> = readCommaDelimitedList();
    if (!matchType(TokenType.CLOSE_BRACKET)) {
        return Left(
            ParseError(`Expected "]", got ${lookAhead().lexeme}`, lookAhead())
        );
    }
    return items.map((items) => new ArrayLiteral(items, getTokens()));
}

function finishVariableDeclaration(): Result<Expr> {
    if (!matchType(TokenType.IDENTIFIER)) {
        return Left(
            ParseError(
                `Expected identifier; got "${lookAhead().lexeme}"`,
                lookAhead()
            )
        );
    }
    const identifier: string = lookBehind().lexeme;
    if (!matchType(TokenType.LEFT_SINGLE_ARROW)) {
        if (matchType(TokenType.EQUAL)) {
            return Left(
                ParseError(
                    `Must use "<-" for variable declaration, not "=".`,
                    lookBehind()
                )
            );
        } else {
            return Left(
                ParseError(
                    `Expected "<-", got "${lookAhead().lexeme}"`,
                    lookAhead()
                )
            );
        }
    }
    eatNewlines();
    return makeStmt().chain((stmt) => {
        if (matchType(TokenType.NEWLINE) || atEnd()) {
            return Right(
                new VariableDeclarationStmt(
                    identifier,
                    false,
                    stmt,
                    getTokens()
                )
            );
        } else {
            return Left(ParseError("Expected a newline!", lookBehind()));
        }
    });
}

function finishImmutableDeclaration(identifier: string): Result<Expr> {
    eatNewlines();
    return makeStmt().chain((expr) => {
        if (
            matchType(TokenType.NEWLINE) ||
            atEnd() ||
            lookAhead().lexeme === "}"
        ) {
            return Right(
                new VariableDeclarationStmt(identifier, true, expr, getTokens())
            );
        } else {
            return Left(ParseError("Expected a newline!", lookAhead()));
        }
    });
}

function finishMatchStmt(): Result<Expr> {
    return makeExpr().chain((expr) => {
        if (!matchType(TokenType.OPEN_BRACE)) {
            return Left(
                ParseError(
                    `Expected "{"; got "${lookAhead().lexeme}"`,
                    lookAhead()
                )
            );
        }
        if (!matchType(TokenType.NEWLINE)) {
            return Left(
                ParseError(`Expected a newline after "{"`, lookAhead())
            );
        }
        const cases: MatchCase[] = [];
        while (!matchType(TokenType.CLOSE_BRACE)) {
            eatNewlines();
            cases.push(makeMatchCase().unsafeCoerce());
        }
        return Right(new MatchStmt(expr, cases, getTokens()));
    });
}

function makeMatchCase(): Result<MatchCase> {
    return makeMatchPrimary().chain((matchPrimary) => {
        if (!matchType(TokenType.RIGHT_DOUBLE_ARROW)) {
            return Left(
                ParseError(
                    `Expected a "=>", got "${lookAhead().lexeme}"`,
                    lookAhead()
                )
            );
        }
        const expr = makeStmt();
        if (!matchType(TokenType.NEWLINE)) {
            return Left(
                ParseError(`Expected a newline after match case.`, lookAhead())
            );
        }
        return expr.map((expr) => new MatchCase(matchPrimary, expr));
    });
}

function makeMatchPrimary(): Result<PrimaryExpr | UnderscoreExpr> {
    if (matchType(TokenType.TRUE))
        return Right(new PrimaryExpr(true, getTokens()));
    if (matchType(TokenType.FALSE))
        return Right(new PrimaryExpr(false, getTokens()));
    if (matchType(TokenType.NUMBER, TokenType.STRING))
        return Right(new PrimaryExpr(lookBehind().literal, getTokens()));
    if (matchType(TokenType.UNDERSCORE))
        return Right(new UnderscoreExpr(getTokens()));
    return Left(
        ParseError(
            `"${
                lookAhead().lexeme
            }" is not a boolean, number, string literal, or "_".`,
            lookAhead()
        )
    );
}

function finishWhileStmt(): Result<Expr> {
    return makeStmt().chain((condition) => {
        if (atEnd()) {
            return Left(
                ParseError(
                    `After while expected statement, but reached EOF.`,
                    lookBehind()
                )
            );
        }
        return makeStmt().map(
            (body) => new WhileStmt(condition, body, getTokens())
        );
    });
}

function finishUntilStmt(): Result<Expr> {
    return makeStmt().chain((condition) => {
        if (atEnd()) {
            return Left(
                ParseError(
                    `After until expected statement, but reached EOF.`,
                    lookBehind()
                )
            );
        }
        return makeStmt().map((body) => {
            return new UntilStmt(condition, body, getTokens());
        });
    });
}

function backTrack(): void {
    current -= 1;
}

function finishFunctionDeclaration(): Result<Expr> {
    if (!matchType(TokenType.IDENTIFIER)) {
        return Left(
            ParseError(
                `Expected an identifier; got "${lookAhead().lexeme}"`,
                lookAhead()
            )
        );
    }
    const fnName = lookBehind().lexeme;
    // FIXME better error
    if (!matchType(TokenType.EQUAL))
        return Left(ParseError("Expected =", lookAhead()));
    eatNewlines();
    return makeLambda().map((lambda) => {
        return new FunctionDefinition(
            new VariableDeclarationStmt(fnName, true, lambda, getTokens()),
            getTokens()
        );
    });
}

function makeLambda(): Result<FunctionExpr> {
    let args: string[];
    if (matchType(TokenType.IDENTIFIER)) {
        args = [lookBehind().lexeme];
    } else if (matchType(TokenType.OPEN_PAREN)) {
        args = finishFunctDecArgs().unsafeCoerce();
    } else {
        // FIXME better error
        return Left(
            ParseError("Expected identifier or open paren", lookAhead())
        );
    }
    // FIXME better error
    if (!matchType(TokenType.RIGHT_SINGLE_ARROW))
        return Left(ParseError("Expected ->", lookAhead()));
    return finishLambda(args);
}

function finishFunctDecArgs(): Result<string[]> {
    const args: string[] = [];
    while (matchType(TokenType.IDENTIFIER)) {
        args.push(lookBehind().lexeme);
        matchType(TokenType.COMMA);
        eatNewlines();
        //FIXME checks are needed
    }
    if (!matchType(TokenType.CLOSE_PAREN)) {
        return Left(
            ParseError(`Expected ")"; got "${lookAhead().lexeme}"`, lookAhead())
        );
    }
    return Right(args);
}

function finishBlockStmt(): Result<BlockStmt> {
    const stmts: Expr[] = [];
    eatNewlines();
    while (!matchType(TokenType.CLOSE_BRACE)) {
        if (atEnd()) {
            return Left(
                ParseError(
                    "Encountered EOF before end of block statement.",
                    lookAhead()
                )
            );
        }
        stmts.push(makeStmt().unsafeCoerce());
        eatNewlines();
    }
    return Right(new BlockStmt(stmts, getTokens()));
}

function finishIfStmt(): Result<Expr> {
    eatNewlines();
    const condition: Result<Expr> = makeExpr();
    eatNewlines();
    // optionally match then
    matchType(TokenType.THEN);
    eatNewlines();
    if (atEnd())
        return Left(
            ParseError(
                `After if expected statement, but reached EOF.`,
                lookBehind()
            )
        );
    const maybeBody: Result<Expr> = makeStmt();
    eatNewlines();

    if (matchType(TokenType.ELSE)) {
        if (atEnd())
            return Left(
                ParseError(
                    `After if expected statement, but reached EOF.`,
                    lookBehind()
                )
            );
        return makeStmt()
            .chain((elseBody) => {
                eatNewlines();
                return Right(
                    new IfStmt(
                        condition.unsafeCoerce(),
                        maybeBody.unsafeCoerce(),
                        elseBody,
                        getTokens()
                    )
                );
            })
            .chainLeft((_) => {
                return Left(
                    ParseError(
                        `After else expected statement, but got ${
                            lookAhead().lexeme
                        }`,
                        lookAhead()
                    )
                );
            });
    }
    return Right(
        new IfStmt(
            condition.unsafeCoerce(),
            maybeBody.unsafeCoerce(),
            null,
            getTokens()
        )
    );
}

function finishPrintStmt(): Result<Expr> {
    return makeStmt().map((stmt) => new PrintStmt(stmt, getTokens()));
}

function makeExpr(): Result<Expr> {
    return makeBinaryLogical();
}

function finishAssignment(identifier: string): Result<Expr> {
    // TODO check if identifier has already been declared
    eatNewlines();
    return makeStmt().map(
        (right) => new VariableAssignmentStmt(identifier, right, getTokens())
    );
}

function makeBinaryLogical(): Result<Expr> {
    return makeBinaryExpr([TokenType.AND, TokenType.OR], makeEquality);
}

function makeEquality(): Result<Expr> {
    return makeBinaryExpr([TokenType.EQUAL_EQUAL], makeComparision);
}

function makeComparision(): Result<Expr> {
    return makeBinaryExpr(
        [
            TokenType.GREATER,
            TokenType.GREATER_EQUAL,
            TokenType.LESS,
            TokenType.LESS_EQUAL,
        ],
        makeConcat
    );
}

function makeConcat(): Result<Expr> {
    return makeBinaryExpr([TokenType.PLUS_PLUS], makeAddition);
}

function makeAddition(): Result<Expr> {
    return makeBinaryExpr(
        [TokenType.PLUS, TokenType.MINUS],
        makeMultiplication
    );
}

function makeMultiplication(): Result<Expr> {
    return makeBinaryExpr([TokenType.STAR, TokenType.SLASH], makeMod);
}

function makeMod(): Result<Expr> {
    return makeBinaryExpr([TokenType.MOD], makeUnary);
}

function makeUnary(): Result<Expr> {
    if (matchType(TokenType.MINUS, TokenType.NOT)) {
        const operator = lookBehind();
        return makeUnary().map(
            (right) => new UnaryExpr(operator, right, getTokens())
        );
    }
    return makeCall();
}

function readCommaDelimitedList(): Result<Expr[]> {
    const list: Result<Expr>[] = [];
    do {
        list.push(makeExpr());
    } while (matchType(TokenType.COMMA));
    return Either.sequence(list);
}

function makeCall(): Result<Expr> {
    const primary: Result<Expr> = makePrimary();
    return primary.chain((primary) => makeCall2(primary));
}

function makeCall2(callee: Expr): Result<Expr> {
    if (!matchType(TokenType.OPEN_PAREN)) {
        return Right(callee);
    }
    let args: Result<Expr[]> = Right([]);
    if (!matchType(TokenType.CLOSE_PAREN)) {
        args = readCommaDelimitedList();
        if (!matchType(TokenType.CLOSE_PAREN)) {
            return Left(
                ParseError(`Must terminate function call with ")"`, lookAhead())
            );
        }
    }
    return args
        .map((goodArgs) => new CallExpr(callee, goodArgs, getTokens()))
        .chain(makeCall2);
}

function makePrimary(): Result<Expr> {
    if (matchType(TokenType.TRUE))
        return Right(new PrimaryExpr(true, getTokens()));
    if (matchType(TokenType.FALSE))
        return Right(new PrimaryExpr(false, getTokens()));
    if (matchType(TokenType.NUMBER, TokenType.STRING))
        return Right(new PrimaryExpr(lookBehind().literal, getTokens()));
    if (matchType(TokenType.IDENTIFIER)) {
        const id = lookBehind().lexeme;
        if (matchType(TokenType.RIGHT_SINGLE_ARROW)) {
            return finishLambda([lookBehind(2).lexeme]);
        } else if (matchType(TokenType.OPEN_BRACKET)) {
            return makeExpr().chain((expr) => {
                if (!matchType(TokenType.CLOSE_BRACKET)) {
                    return Left(
                        ParseError(
                            `Expected "]", got ${lookAhead().lexeme}`,
                            lookAhead()
                        )
                    );
                }
                return Right(new IndexExpr(id, expr, getTokens()));
            });
        } else {
            const identifier = lookBehind().lexeme;
            return Right(new VariableExpr(identifier, getTokens()));
        }
    }

    if (matchType(TokenType.OPEN_PAREN)) {
        if (matchType(TokenType.IDENTIFIER)) {
            if (matchType(TokenType.COMMA, TokenType.CLOSE_PAREN)) {
                current -= 2;
                const args: string[] = finishFunctDecArgs().unsafeCoerce();
                if (!matchType(TokenType.RIGHT_SINGLE_ARROW)) {
                    return Left(
                        ParseError(
                            `Expected "->", got "${lookAhead().lexeme}"`,
                            lookAhead()
                        )
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
    if (lookAhead().type === TokenType.EOF) {
        return Left(
            ParseError(`Reached EOF before reading a primary`, lookBehind())
        );
    } else {
        return Left(
            ParseError(
                `Expected a primary; got "${lookAhead().lexeme}"`,
                lookAhead()
            )
        );
    }
}

function finishLambda(args: string[]): Result<FunctionExpr> {
    eatNewlines();
    return makeStmt().map((body) => new FunctionExpr(args, body, getTokens()));
    // TODO: add checks and nice error messages
}

function finishGrouping(): Result<Expr> {
    return makeExpr().chain((expr) => {
        if (matchType(TokenType.CLOSE_PAREN))
            return Right(new GroupingExpr(expr, getTokens()));
        else
            return Left(
                ParseError(
                    `Expected ")", got "${lookAhead().lexeme}"`,
                    lookAhead()
                )
            );
    });
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
    higherPrecedenceOperation: () => Result<Expr>
): Result<Expr> {
    let expr: Result<Expr> = higherPrecedenceOperation();

    while (matchType(...matches)) {
        const operator = lookBehind();
        const right = higherPrecedenceOperation();
        expr = Right(
            new BinaryExpr(
                expr.unsafeCoerce(),
                operator,
                right.unsafeCoerce(),
                getTokens()
            )
        );
    }
    return expr;
}

function reset() {
    start = 0;
    current = 0;
    tokens = [];
}

function getTokens(): Token[] {
    return tokens.slice(start, current);
}
