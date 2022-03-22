import { ExprBase, Expr } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";
import { RuntimePanic } from "../Debug.js";
import { Node, x } from "code-red";

export type ArrayLiteral = ExprBase & {
	type: "ArrayLiteral";
	exprs: Expr[];
	estree(): Node;
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
		estree(): Node {
			const estrees = this.exprs.map((e) => e.estree());
			return x`{stlValue: [${estrees}]}`;
		},
	};
};
