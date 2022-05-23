import { Node, x } from "code-red";
import { RuntimePanic } from "../Debug.js";
import { Expr, ExprBase } from "../Expr.js";
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

export type BinaryExpr = ExprBase & {
	type: "BinaryExpr";
	left: Expr;
	operator: TokenType;
	right: Expr;
};

export const BinaryExpr = (
	left: Expr,
	operator: TokenType,
	right: Expr,
	tokens: Token[] = []
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
			switch (this.operator) {
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
		estree() {
			const leftVal = this.left.estree().node;
			const rightVal = this.right.estree().node;
			let node: Node;
			switch (this.operator) {
				case TokenType.PLUS:
					node = x`stlAdd(${leftVal}, ${rightVal})`;
					break;
				case TokenType.MINUS:
					node = x`stlSubtract(${leftVal}, ${rightVal})`;
					break;
				case TokenType.PLUS_PLUS:
					node = x`stlConcat(${leftVal}, ${rightVal})`;
					break;
				case TokenType.STAR:
					node = x`stlMultiply(${leftVal}, ${rightVal})`;
					break;
				case TokenType.SLASH:
					node = x`stlDivide(${leftVal}, ${rightVal})`;
					break;
				case TokenType.MOD:
					node = x`stlMod(${leftVal}, ${rightVal})`;
					break;
				case TokenType.AND:
					node = x`stlLogicalAnd(${leftVal}, ${rightVal})`;
					break;
				case TokenType.OR:
					node = x`stlLogicalOr(${leftVal}, ${rightVal})`;
					break;
				case TokenType.GREATER_EQUAL:
					node = x`stlGreaterEqual(${leftVal}, ${rightVal})`;
					break;
				case TokenType.GREATER:
					node = x`stlGreater(${leftVal}, ${rightVal})`;
					break;
				case TokenType.LESS_EQUAL:
					node = x`stlLessEqual(${leftVal}, ${rightVal})`;
					break;
				case TokenType.LESS:
					node = x`stlLess(${leftVal}, ${rightVal})`;
					break;
				case TokenType.EQUAL_EQUAL:
					node = x`stlEqual(${leftVal}, ${rightVal})`;
					break;
				default:
					throw RuntimePanic(
						`FIXME: Unhandled operator type "${this.operator}"`
					);
			}
			return { node };
		},
	};
};
