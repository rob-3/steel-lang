import { RuntimePanic } from "../Debug.js";
import { Expr } from "../Expr.js";
import { call } from "../Interpreter.js";
import Scope from "../Scope.js";
import { StlFunction } from "../StlFunction.js";
import Token from "../Token.js";
import { Value } from "../Value.js";

export default class CallExpr implements Expr {
	callee: Expr;
	args: Expr[];
	tokens: Token[];
	constructor(callee: Expr, args: Expr[], tokens: Token[]) {
		this.callee = callee;
		this.args = args;
		this.tokens = tokens;
	}

	eval(scope: Scope): [Value, Scope] {
		const [maybeFn, newScope] = this.callee.eval(scope);
		if (maybeFn?.value instanceof StlFunction) {
			return call(maybeFn.value, this.args, newScope);
		} else {
			throw RuntimePanic(
				`Can't call ${maybeFn?.value} because it is not a function.`
			);
		}
	}
}
