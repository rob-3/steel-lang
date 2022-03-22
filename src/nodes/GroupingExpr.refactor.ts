import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export type GroupingExpr = Expr & {
	type: "GroupingExpr";
	expr: Expr;
};

export const GroupingExpr = (expr: Expr, tokens: Token[]): GroupingExpr => {
	return {
		type: "GroupingExpr",
		expr,
		tokens,
		eval(scope: Scope) {
			return this.expr.eval(scope);
		},
	};
};
