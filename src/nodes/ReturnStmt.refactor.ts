import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export type ReturnStmt = Expr & {
	value: Expr;
};

export const ReturnStmt = (value: Expr, tokens: Token[]): ReturnStmt => {
	return {
		value,
		tokens,
		eval(scope: Scope) {
			return this.value.eval(scope);
		},
	};
};
