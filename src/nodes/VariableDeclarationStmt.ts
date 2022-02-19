import { Expr } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { RuntimePanic } from "../Debug.js";

export default class VariableDeclarationStmt implements Expr {
	immutable: boolean;
	identifier: string;
	right: Expr;
	tokens: Token[];
	constructor(
		identifier: string,
		immutable: boolean,
		right: Expr,
		tokens: Token[]
	) {
		this.immutable = immutable;
		this.identifier = identifier;
		this.right = right;
		this.tokens = tokens;
	}

	eval(scope: Scope) {
		const [rightVal, newScope] = this.right.eval(scope);
		if (rightVal === null) {
			throw RuntimePanic(
				"Right side of variable declaration should not be nothing!"
			);
		}
		return newScope.define(this.identifier, rightVal, this.immutable);
	}
}
