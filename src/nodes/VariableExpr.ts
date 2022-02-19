import { Expr } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";

export default class VariableExpr implements Expr {
	identifier: string;
	tokens: Token[];
	constructor(identifier: string, tokens: Token[]) {
		this.identifier = identifier;
		this.tokens = tokens;
	}

	eval(scope: Scope): [Value, Scope] {
		return [scope.lookup(this.identifier), scope];
	}
}
