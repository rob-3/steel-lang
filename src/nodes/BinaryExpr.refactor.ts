import { RuntimePanic } from "../Debug.js";
import { Expr } from "../Expr.refactor.js";
import {
	and,
	equal,
	greater,
	greaterEqual,
	less,
	lessEqual,
	minus,
	mod,
	or,
	plus,
	plusPlus,
	slash,
	star,
} from "../Interpreter.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import TokenType from "../TokenType.js";
import { Value } from "../Value.js";

export type BinaryExpr = Expr & {
	type: "BinaryExpr";
	left: Expr;
	operator: Token;
	right: Expr;
};

export const BinaryExpr = (
	left: Expr,
	operator: Token,
	right: Expr,
	tokens: Token[]
): BinaryExpr => {
	return {
		type: "BinaryExpr",
		left,
		operator,
		right,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			const [leftVal, newScope] = this.left.eval(scope);
			const [rightVal, newScope2] = this.right.eval(newScope);
			if (leftVal === null || rightVal === null) {
				throw RuntimePanic("Operand cannot evaluate to nothing");
			}
			switch (this.operator.type) {
				case TokenType.PLUS:
					return [plus(leftVal, rightVal), newScope2];
				case TokenType.MINUS:
					return [minus(leftVal, rightVal), newScope2];
				case TokenType.PLUS_PLUS:
					return [plusPlus(leftVal, rightVal), newScope2];
				case TokenType.STAR:
					return [star(leftVal, rightVal), newScope2];
				case TokenType.SLASH:
					return [slash(leftVal, rightVal), newScope2];
				case TokenType.MOD:
					return [mod(leftVal, rightVal), newScope2];
				case TokenType.AND:
					return [and(leftVal, rightVal), newScope2];
				case TokenType.OR:
					return [or(leftVal, rightVal), newScope2];
				case TokenType.GREATER_EQUAL:
					return [greaterEqual(leftVal, rightVal), newScope2];
				case TokenType.GREATER:
					return [greater(leftVal, rightVal), newScope2];
				case TokenType.LESS_EQUAL:
					return [lessEqual(leftVal, rightVal), newScope2];
				case TokenType.LESS:
					return [less(leftVal, rightVal), newScope2];
				case TokenType.EQUAL_EQUAL:
					return [equal(leftVal, rightVal), newScope2];
				default:
					throw RuntimePanic(
						`FIXME: Unhandled operator type "${this.operator}"`
					);
			}
		},
	};
};
