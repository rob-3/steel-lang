import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";
import { RuntimePanic } from "../Debug.js";

export type ArrayLiteral = Expr & {
	type: "ArrayLiteral";
	exprs: Expr[];
};

export const ArrayLiteral = (exprs: Expr[], tokens: Token[]): ArrayLiteral => {
	return {
		type: "ArrayLiteral",
		exprs,
		tokens,
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
		},
	};
};
