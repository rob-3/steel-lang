import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export type GroupingExpr = ExprBase & {
	type: "GroupingExpr";
	expr: Expr;
};

export const GroupingExpr = (expr: Expr, tokens: Token[] = []): GroupingExpr => {
	return {
		type: "GroupingExpr",
		expr,
		tokens,
		eval(scope: Scope) {
			return this.expr.eval(scope);
		},
	};
};
