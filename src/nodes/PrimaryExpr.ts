import { Expr } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";
import StlNumber from "../StlNumber.js";

export default class PrimaryExpr implements Expr {
	literal: StlNumber | boolean | string;
	tokens: Token[];
	constructor(literal: StlNumber | boolean | string, tokens: Token[]) {
		this.literal = literal;
		this.tokens = tokens;
	}

	eval(scope: Scope): [Value, Scope] {
		return [new Box(this.literal), scope];
	}
}
