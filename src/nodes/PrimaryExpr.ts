import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value, Box } from "../Value";
import StlNumber from "../StlNumber";

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
