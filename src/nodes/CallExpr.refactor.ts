import { RuntimePanic } from "../Debug.js";
import { Expr } from "../Expr.refactor.js";
import { call } from "../Interpreter.js";
import Scope from "../Scope.js";
import { StlFunction } from "../StlFunction.js";
import Token from "../Token.js";
import { Value } from "../Value.js";

export type CallExpr = Expr & {
	callee: Expr;
	args: Expr[];
};

export const CallExpr = (
	callee: Expr,
	args: Expr[],
	tokens: Token[]
): CallExpr => {
	return {
		callee,
		args,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			const [maybeFn, newScope] = this.callee.eval(scope);
			if (maybeFn?.value instanceof StlFunction) {
				return call(maybeFn.value, this.args, newScope);
			} else {
				throw RuntimePanic(
					`Can't call ${maybeFn?.value} because it is not a function.`
				);
			}
		},
	};
};
