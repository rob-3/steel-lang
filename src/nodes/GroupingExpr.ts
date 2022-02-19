import { Expr } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export default class GroupingExpr implements Expr {
	expr: Expr;
	tokens: Token[];
	constructor(expr: Expr, tokens: Token[]) {
		this.expr = expr;
		this.tokens = tokens;
	}

	eval(scope: Scope) {
		return this.expr.eval(scope);
	}
}
