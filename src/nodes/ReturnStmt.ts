import { Expr } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export default class ReturnStmt implements Expr {
	value: Expr;
	tokens: Token[];
	constructor(value: Expr, tokens: Token[]) {
		this.value = value;
		this.tokens = tokens;
	}

	eval(scope: Scope) {
		return this.value.eval(scope);
	}
}
