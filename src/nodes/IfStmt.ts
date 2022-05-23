import { x } from "code-red";
import { RuntimePanic } from "../Debug.js";
import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";

export type IfStmt = ExprBase & {
	type: "IfStmt";
	condition: Expr;
	body: Expr;
	elseBody: Expr | null;
};

export const IfStmt = (
	condition: Expr,
	body: Expr,
	elseBody: Expr | null,
	tokens: Token[] = []
): IfStmt => {
	return {
		type: "IfStmt",
		condition,
		body,
		elseBody,
		tokens,
		eval(scope: Scope): [Value | null, Scope] {
			const [boxedMaybeBool, newScope] = this.condition.eval(scope);
			const shouldBeBool = boxedMaybeBool?.value;
			if (typeof shouldBeBool !== "boolean") {
				throw RuntimePanic("Condition doesn't evaluate to a boolean.");
			}
			if (shouldBeBool) {
				return this.body.eval(newScope);
			} else if (this.elseBody !== null) {
				return this.elseBody.eval(newScope);
			} else {
				// FIXME: hack we need to address
				return [null, newScope];
			}
		},
		estree() {
			return {
				node: x`
				stlUnwrap(${this.condition.estree().node}) ? 
					${this.body.estree().node} :
					${this.elseBody?.estree().node ?? "null"}
				`,
			};
		},
	};
};
