import { x } from "code-red";
import { RuntimePanic } from "../Debug.js";
import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Box, Value } from "../Value.js";

export type ArrayLiteral = ExprBase & {
	type: "ArrayLiteral";
	exprs: Expr[];
};

export const ArrayLiteral = (
	exprs: Expr[],
	tokens: Token[] = []
): ArrayLiteral => {
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
		estree() {
			const estrees = this.exprs.map((e) => e.estree().node);
			return {
				node: x`{stlValue: [${estrees}]}`,
			};
		},
	};
};
