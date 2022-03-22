import { RuntimePanic } from "../Debug.js";
import { Expr } from "../Expr.refactor.js";
import { not, opposite } from "../Interpreter.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import TokenType from "../TokenType.js";
import { Value } from "../Value.js";

export type UnaryExpr = Expr & {
	operator: Token;
	right: Expr;
};

export const UnaryExpr = (
	operator: Token,
	right: Expr,
	tokens: Token[]
): UnaryExpr => {
	return {
		operator,
		right,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			const [value, newScope] = this.right.eval(scope);
			if (value === null) {
				throw RuntimePanic("Operand cannot be nothing!");
			}
			switch (this.operator.type) {
				case TokenType.MINUS:
					return [opposite(value), newScope];
				case TokenType.NOT:
					return [not(value), newScope];
			}
			throw RuntimePanic("Unsupported operator type in UnaryExpr");
		},
	};
};
