import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export type ReturnStmt = Expr & {
	type: "ReturnStmt";
	value: Expr;
};

export const ReturnStmt = (value: Expr, tokens: Token[]): ReturnStmt => {
	return {
		type: "ReturnStmt",
		value,
		tokens,
		eval(scope: Scope) {
			return this.value.eval(scope);
		},
	};
};
