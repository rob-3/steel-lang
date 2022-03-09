import { Expr } from "../Expr.js";
import Scope from "../Scope.js";
import { StlFunction } from "../StlFunction.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";

export default class FunctionExpr implements Expr {
	args: string[];
	body: Expr;
	tokens: Token[];
	constructor(args: string[], body: Expr, tokens: Token[]) {
		this.args = args;
		this.body = body;
		this.tokens = tokens;
	}

	eval(scope: Scope): [Value, Scope] {
		return [new Box(new StlFunction(this, scope)), scope];
	}

	toString() {
		return "[anonymous function]";
	}
}
