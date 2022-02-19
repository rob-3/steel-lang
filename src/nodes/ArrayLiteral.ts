import { Expr } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";
import { RuntimePanic } from "../Debug.js";

export default class ArrayLiteral implements Expr {
	exprs: Expr[];
	tokens: Token[];

	constructor(exprs: Expr[], tokens: Token[]) {
		this.exprs = exprs;
		this.tokens = tokens;
	}

	eval(scope: Scope): [Value, Scope] {
		const resolved: Value[] = [];
		const newScope = this.exprs.reduce((acc: Scope, cur: Expr) => {
			const [val, scope]: [Value | null, Scope] = cur.eval(acc);
			if (val === null) {
				throw RuntimePanic("Array item cannot evaluate to nothing");
			}
			resolved.push(val);
			return scope;
		}, scope);
		return [new Box(resolved), newScope];
	}
}
