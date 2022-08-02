import { Either, Left, Right } from "purify-ts";
import { ParseError } from "./Debug.js";
import { Expr } from "./Expr.js";
import { ArrayLiteral } from "./nodes/ArrayLiteral.js";
import { BinaryExpr } from "./nodes/BinaryExpr.js";
import { BlockStmt } from "./nodes/BlockStmt.js";
import { CallExpr } from "./nodes/CallExpr.js";
import { FunctionDefinition } from "./nodes/FunctionDefinition.js";
import { FunctionExpr } from "./nodes/FunctionExpr.js";
import { GroupingExpr } from "./nodes/GroupingExpr.js";
import { IfStmt } from "./nodes/IfStmt.js";
import { IndexExpr } from "./nodes/IndexExpr.js";
import { MatchStmt, MatchCase, UnderscoreExpr } from "./nodes/MatchStmt.js";
import { PrimaryExpr, StlBoolExpr } from "./nodes/PrimaryExpr.js";
import { ReturnStmt } from "./nodes/ReturnStmt.js";
import { UnaryExpr } from "./nodes/UnaryExpr.js";
import {
	VariableAssignmentStmt,
	isAssignmentLeft,
	AssignmentLeft,
} from "./nodes/VariableAssignmentStmt.js";
import { VariableDeclarationStmt } from "./nodes/VariableDeclarationStmt.js";
import { VariableExpr } from "./nodes/VariableExpr.js";
import { WhileStmt } from "./nodes/WhileStmt.js";
import Token from "./Token.js";
import TokenType from "./TokenType.js";
import { ObjectLiteral } from "./nodes/ObjectLiteral.js";
import { DotAccess } from "./nodes/DotAccess.js";

let tokens: Token[];
let start = 0;
let current = 0;

export default function parse(tokenList: Token[]): Either<Error[], Expr[]> {
	tokens = tokenList;
	const parseTree: Either<Error, Expr>[] = [];

	eatNewlines();
	while (!atEnd()) {
		parseTree.push(makeExpr());
		eatNewlines();
	}
	reset();
	const errors = Either.lefts(parseTree);
	if (errors.length > 0) {
		return Left(errors);
	} else {
		return Right(Either.rights(parseTree));
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

function lookAhead(count: number = 1): Token {
	return tokens[current - 1 + count];
}

function eatNewlines(): void {
	while (matchType(TokenType.NEWLINE)) continue;
}

function eatUntilNewline(): void {
	while (!atEnd() && eatToken().type !== TokenType.NEWLINE);
}

function makeExpr(): Either<Error, Expr> {
	if (matchType(TokenType.RETURN))
		return makeExpr().chain((expr) => Right(ReturnStmt(expr, getTokens())));
	if (matchType(TokenType.VAR)) return finishVariableDeclaration();
	if (matchType(TokenType.IF)) return finishIfStmt();
	if (matchType(TokenType.WHILE)) return finishWhileStmt();
	if (matchType(TokenType.FUN)) return finishFunctionDeclaration();
	if (matchType(TokenType.MATCH)) return finishMatchStmt();
	if (matchType(TokenType.IDENTIFIER)) {
		if (matchType(TokenType.EQUAL)) {
			const identifier = lookBehind(2).lexeme;
			return finishImmutableDeclaration(identifier);
		} else if (matchType(TokenType.LEFT_SINGLE_ARROW)) {
			const identifier = lookBehind(2).lexeme;
			return finishAssignment(VariableExpr(identifier, getTokens()));
		} else {
			backTrack();
		}
	}
	if (matchType(TokenType.LEFT_SINGLE_ARROW))
		return Left(Error("Unexpected left single arrow!"));
	if (matchType(TokenType.NEWLINE))
		return Left(Error("Unexpected newline; parser bug."));
	const expr = makeBinaryLogical();
	return expr.chain((e) => {
		// FIXME add error messages for invalid assignments
		if (isAssignmentLeft(e) && matchType(TokenType.LEFT_SINGLE_ARROW)) {
			return finishAssignment(e);
		}
		return expr;
	});
}

function finishArrayLiteral(): Either<Error, Expr> {
	if (matchType(TokenType.CLOSE_BRACKET))
		return Right(ArrayLiteral([], getTokens()));
	const items: Either<Error, Expr[]> = readCommaDelimitedList();
	if (!matchType(TokenType.CLOSE_BRACKET)) {
		return Left(
			ParseError(`Expected "]", got ${lookAhead().lexeme}`, lookAhead())
		);
	}
	return items.map((items) => ArrayLiteral(items, getTokens()));
}

function finishVariableDeclaration(): Either<Error, Expr> {
	if (!matchType(TokenType.IDENTIFIER)) {
		const next = lookAhead();
		eatUntilNewline();
		return Left(
			ParseError(
				next.type === TokenType.VAR
					? `Using "var" as a variable name is not allowed`
					: `"var" is used to create a variable, but instead you put "${next.lexeme}"`,
				next
			)
		);
	}
	const identifier: string = lookBehind().lexeme;
	if (!matchType(TokenType.LEFT_SINGLE_ARROW)) {
		return Left(
			ParseError(`Expected "<-" got "${lookAhead().lexeme}"`, lookAhead())
		);
	}
	eatNewlines();
	return makeExpr().chain((stmt) => {
		if (matchType(TokenType.NEWLINE) || atEnd()) {
			return Right(
				VariableDeclarationStmt(identifier, false, stmt, getTokens())
			);
		} else {
			return Left(ParseError("Expected a newline!", lookBehind()));
		}
	});
}

function finishImmutableDeclaration(identifier: string): Either<Error, Expr> {
	eatNewlines();
	const expr = makeExpr();
	return expr.chain((expr) => {
		if (matchType(TokenType.NEWLINE) || atEnd() || lookAhead().lexeme === "}") {
			return Right(
				VariableDeclarationStmt(identifier, true, expr, getTokens())
			);
		} else {
			return Left(ParseError("Expected a newline!", lookAhead()));
		}
	});
}

function finishMatchStmt(): Either<Error, Expr> {
	return makeExpr().chain((expr) => {
		if (!matchType(TokenType.OPEN_BRACE)) {
			return Left(
				ParseError(`Expected "{"; got "${lookAhead().lexeme}"`, lookAhead())
			);
		}
		if (!matchType(TokenType.NEWLINE)) {
			return Left(ParseError(`Expected a newline after "{"`, lookAhead()));
		}
		const cases: Either<Error, MatchCase>[] = [];
		while (!matchType(TokenType.CLOSE_BRACE)) {
			eatNewlines();
			cases.push(makeMatchCase());
		}
		return Either.sequence(cases).chain((cases) =>
			Right(MatchStmt(expr, cases, getTokens()))
		);
	});
}

function makeMatchCase(): Either<Error, MatchCase> {
	return makeMatchPrimary().chain((matchPrimary) => {
		if (!matchType(TokenType.RIGHT_DOUBLE_ARROW)) {
			return Left(
				ParseError(`Expected a "=>", got "${lookAhead().lexeme}"`, lookAhead())
			);
		}
		const expr = makeExpr();
		if (!matchType(TokenType.NEWLINE)) {
			return Left(
				ParseError(`Expected a newline after match case.`, lookAhead())
			);
		}
		return expr.map((expr) => MatchCase(matchPrimary, expr));
	});
}

function makeMatchPrimary(): Either<Error, PrimaryExpr | UnderscoreExpr> {
	if (matchType(TokenType.TRUE)) return Right(StlBoolExpr(true, getTokens()));
	if (matchType(TokenType.FALSE)) return Right(StlBoolExpr(false, getTokens()));
	if (matchType(TokenType.NUMBER, TokenType.STRING))
		return Right(PrimaryExpr(lookBehind().literal, getTokens()));
	if (matchType(TokenType.UNDERSCORE))
		return Right(UnderscoreExpr(getTokens()));
	return Left(
		ParseError(
			`"${
				lookAhead().lexeme
			}" is not a boolean, number, string literal, or "_".`,
			lookAhead()
		)
	);
}

function finishWhileStmt(): Either<Error, Expr> {
	return makeExpr().chain((condition) => {
		if (atEnd()) {
			return Left(
				ParseError(
					`After while expected statement, but reached EOF.`,
					lookBehind()
				)
			);
		}
		return makeExpr().map((body) => WhileStmt(condition, body, getTokens()));
	});
}

function backTrack(): void {
	current -= 1;
}

function finishFunctionDeclaration(): Either<Error, Expr> {
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
		return FunctionDefinition(
			VariableDeclarationStmt(fnName, true, lambda, getTokens()),
			getTokens()
		);
	});
}

export type Binding = {
	name: string;
	isImmutable: boolean;
};

function makeLambda(): Either<Error, FunctionExpr> {
	let args: Either<Error, Binding[]>;
	if (matchType(TokenType.IDENTIFIER)) {
		args = Right([
			{
				name: lookBehind().lexeme,
				isImmutable: true,
			},
		]);
	} else if (matchType(TokenType.VAR) && matchType(TokenType.IDENTIFIER)) {
		args = Right([
			{
				name: lookBehind().lexeme,
				isImmutable: false,
			},
		]);
	} else if (matchType(TokenType.OPEN_PAREN)) {
		args = finishFunctDecArgs();
	} else {
		// FIXME better error
		return Left(ParseError("Expected identifier or open paren", lookAhead()));
	}
	// FIXME better error
	if (!matchType(TokenType.RIGHT_SINGLE_ARROW))
		return Left(ParseError("Expected ->", lookAhead()));
	return args.chain(finishLambda);
}

function finishFunctDecArgs(): Either<Error, Binding[]> {
	const args: Binding[] = [];
	while (true) {
		if (matchType(TokenType.IDENTIFIER)) {
			args.push({
				name: lookBehind().lexeme,
				isImmutable: true,
			});
		} else if (matchType(TokenType.VAR) && matchType(TokenType.IDENTIFIER)) {
			args.push({
				name: lookBehind().lexeme,
				isImmutable: false,
			});
		} else {
			break;
		}
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

function finishBlockStmtOrObjectLiteral(): Either<
	Error,
	BlockStmt | ObjectLiteral
> {
	eatNewlines();
	if (
		lookAhead().type === TokenType.IDENTIFIER &&
		lookAhead(2).type === TokenType.COLON
	) {
		const object: Map<string, Expr> = new Map();
		let failed = false;
		while (
			lookAhead().type === TokenType.IDENTIFIER &&
			lookAhead(2).type === TokenType.COLON
		) {
			const pair = makeStringExprPair();
			pair.bimap(
				(_: Error) => {
					failed = true;
				},
				([key, value]) => {
					object.set(key, value);
					matchType(TokenType.COMMA);
				}
			);
			eatNewlines();
			if (matchType(TokenType.CLOSE_BRACE)) {
				return Right(ObjectLiteral(object, getTokens()));
			}
		}
		return Left(ParseError(`Unexpected token`, lookAhead()));
	} else {
		const stmts: Either<Error, Expr>[] = [];
		while (!matchType(TokenType.CLOSE_BRACE)) {
			if (atEnd()) {
				return Left(
					ParseError(
						"Encountered EOF before end of block statement.",
						lookAhead()
					)
				);
			}
			stmts.push(makeExpr());
			eatNewlines();
		}
		const maybeStmts: Either<Error, Expr[]> = Either.sequence(stmts);
		const maybeBlock: Either<Error, BlockStmt> = maybeStmts.chain((stmts) =>
			Right(BlockStmt(stmts, getTokens()))
		);
		return maybeBlock;
	}
}

function makeStringExprPair(): Either<Error, [string, Expr]> {
	if (!matchType(TokenType.IDENTIFIER)) {
		return Left(ParseError("Expected an identifier here.", lookAhead()));
	}
	if (!matchType(TokenType.COLON)) {
		return Left(ParseError('Expected a ":" here.', lookAhead()));
	}
	const identifier = lookBehind(2).lexeme;
	return makeExpr().chain((e) => Right([identifier, e]));
}

function finishIfStmt(): Either<Error, Expr> {
	eatNewlines();
	const condition: Either<Error, Expr> = makeExpr();
	eatNewlines();
	// optionally match then
	matchType(TokenType.THEN);
	eatNewlines();
	if (atEnd())
		return Left(
			ParseError(`After if expected statement, but reached EOF.`, lookBehind())
		);
	const maybeBody: Either<Error, Expr> = makeExpr();
	eatNewlines();

	if (matchType(TokenType.ELSE)) {
		if (atEnd())
			return Left(
				ParseError(
					`After if expected statement, but reached EOF.`,
					lookBehind()
				)
			);
		return makeExpr()
			.chain((elseBody) => {
				eatNewlines();
				return condition.chain((condition) => {
					return maybeBody.chain((maybeBody) => {
						return Right(IfStmt(condition, maybeBody, elseBody, getTokens()));
					});
				});
			})
			.chainLeft((_) => {
				return Left(
					ParseError(
						`After else expected statement, but got ${lookAhead().lexeme}`,
						lookAhead()
					)
				);
			});
	}
	return condition.chain((condition) => {
		return maybeBody.chain((maybeBody) => {
			return Right(IfStmt(condition, maybeBody, null, getTokens()));
		});
	});
}

function finishAssignment(left: AssignmentLeft): Either<Error, Expr> {
	// TODO check if identifier has already been declared
	eatNewlines();
	return makeExpr().map((right) =>
		VariableAssignmentStmt(left, right, getTokens())
	);
}

function makeBinaryLogical(): Either<Error, Expr> {
	return makeBinaryExpr([TokenType.AND, TokenType.OR], makeEquality);
}

function makeEquality(): Either<Error, Expr> {
	return makeBinaryExpr([TokenType.EQUAL_EQUAL], makeComparision);
}

function makeComparision(): Either<Error, Expr> {
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

function makeConcat(): Either<Error, Expr> {
	return makeBinaryExpr([TokenType.PLUS_PLUS], makeAddition);
}

function makeAddition(): Either<Error, Expr> {
	return makeBinaryExpr([TokenType.PLUS, TokenType.MINUS], makeMultiplication);
}

function makeMultiplication(): Either<Error, Expr> {
	return makeBinaryExpr([TokenType.STAR, TokenType.SLASH], makeMod);
}

function makeMod(): Either<Error, Expr> {
	return makeBinaryExpr([TokenType.MOD], makeUnary);
}

function makeUnary(): Either<Error, Expr> {
	if (matchType(TokenType.MINUS, TokenType.NOT)) {
		const operator = lookBehind();
		return makeUnary().map((right) => UnaryExpr(operator, right, getTokens()));
	}
	return makeCallOrDotAccess();
}

function readCommaDelimitedList(): Either<Error, Expr[]> {
	const list: Either<Error, Expr>[] = [];
	do {
		list.push(makeExpr());
	} while (matchType(TokenType.COMMA));
	return Either.sequence(list);
}

function makeCallOrDotAccess(): Either<Error, Expr> {
	const primary: Either<Error, Expr> = makePrimary();
	return primary.chain((primary) => makeCallOrDotAccessRecursive(primary));
}

function makeCallOrDotAccessRecursive(callee: Expr): Either<Error, Expr> {
	if (!matchType(TokenType.OPEN_PAREN, TokenType.DOT)) {
		return Right(callee);
	}
	// check for dot access
	if (lookBehind().type === TokenType.DOT) {
		if (!matchType(TokenType.IDENTIFIER)) {
			return Left(
				ParseError(`Property name expected here after "."`, lookAhead())
			);
		} else {
			const propertyName = lookBehind().lexeme;
			return Right(DotAccess(callee, propertyName, getTokens())).chain(
				makeCallOrDotAccessRecursive
			);
		}
	}
	// else we have a function call
	else {
		let args: Either<Error, Expr[]> = Right([]);
		if (!matchType(TokenType.CLOSE_PAREN)) {
			args = readCommaDelimitedList();
			if (!matchType(TokenType.CLOSE_PAREN)) {
				return Left(
					ParseError(`Must terminate function call with ")"`, lookAhead())
				);
			}
		}
		return args
			.map((goodArgs) => CallExpr(callee, goodArgs, getTokens()))
			.chain(makeCallOrDotAccessRecursive);
	}
}

function makePrimary(): Either<Error, Expr> {
	if (matchType(TokenType.OPEN_BRACKET)) return finishArrayLiteral();
	if (matchType(TokenType.OPEN_BRACE)) return finishBlockStmtOrObjectLiteral();
	if (matchType(TokenType.TRUE)) return Right(PrimaryExpr(true, getTokens()));
	if (matchType(TokenType.FALSE)) return Right(PrimaryExpr(false, getTokens()));
	if (matchType(TokenType.NUMBER, TokenType.STRING))
		return Right(PrimaryExpr(lookBehind().literal, getTokens()));
	if (matchType(TokenType.IDENTIFIER)) {
		const id = lookBehind().lexeme;
		if (matchType(TokenType.RIGHT_SINGLE_ARROW)) {
			return finishLambda([{
				name: lookBehind(2).lexeme,
				isImmutable: true
			}]);
		} else if (matchType(TokenType.OPEN_BRACKET)) {
			return makeExpr().chain((expr) => {
				if (!matchType(TokenType.CLOSE_BRACKET)) {
					return Left(
						ParseError(`Expected "]", got ${lookAhead().lexeme}`, lookAhead())
					);
				}
				return Right(IndexExpr(id, expr, getTokens()));
			});
		} else {
			const identifier = lookBehind().lexeme;
			return Right(VariableExpr(identifier, getTokens()));
		}
	}

	if (matchType(TokenType.OPEN_PAREN)) {
		if (matchType(TokenType.IDENTIFIER)) {
			if (matchType(TokenType.COMMA, TokenType.CLOSE_PAREN)) {
				current -= 2;
				return finishFunctDecArgs().chain((args) => {
					if (!matchType(TokenType.RIGHT_SINGLE_ARROW)) {
						return Left(
							ParseError(
								`Expected "->", got "${lookAhead().lexeme}"`,
								lookAhead()
							)
						);
					}
					return finishLambda(args);
				});
			} else {
				current -= 1;
			}
		} else if (
			matchType(TokenType.CLOSE_PAREN) &&
			matchType(TokenType.RIGHT_SINGLE_ARROW)
		) {
			return finishLambda([]);
		} else if (
      // this is a buggy and bad idea
			matchType(TokenType.VAR) &&
			matchType(TokenType.IDENTIFIER)
		) {
      current -= 2;
      return finishFunctDecArgs().chain((args) => {
        if (!matchType(TokenType.RIGHT_SINGLE_ARROW)) {
          return Left(
            ParseError(
              `Expected "->", got "${lookAhead().lexeme}"`,
              lookAhead()
            )
          );
        }
        return finishLambda(args);
      });
    }
    // be careful moving this statement
    // the state machine above is subtle
    return finishGrouping();
  }

	if (matchType(TokenType.OPEN_BRACKET)) {
		return finishArrayLiteral();
	}

	// if we get here, it is an error
	if (lookAhead().type === TokenType.EOF) {
		// FIXME
		//eatToken();
		return Left(
			ParseError(`Reached EOF before reading a primary`, lookBehind())
		);
	} else {
		eatToken();
		return Left(
			ParseError(
				`Expected a primary; got "${lookBehind().lexeme}"`,
				lookBehind()
			)
		);
	}
}

function finishLambda(args: Binding[]): Either<Error, FunctionExpr> {
	eatNewlines();
	return makeExpr().map((body) => FunctionExpr(args, body, getTokens()));
	// TODO: add checks and nice error messages
}

function finishGrouping(): Either<Error, Expr> {
	return makeExpr().chain((expr) => {
		if (matchType(TokenType.CLOSE_PAREN))
			return Right(GroupingExpr(expr, getTokens()));
		else
			return Left(
				ParseError(`Expected ")", got "${lookAhead().lexeme}"`, lookAhead())
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
	higherPrecedenceOperation: () => Either<Error, Expr>
): Either<Error, Expr> {
	let expr: Either<Error, Expr> = higherPrecedenceOperation();

	while (matchType(...matches)) {
		const operator = lookBehind();
		const right = higherPrecedenceOperation();
		expr = expr.chain((expr) => {
			return right.chain((right) => {
				return Right(BinaryExpr(expr, operator.type, right, getTokens()));
			});
		});
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
