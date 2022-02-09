import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";

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
