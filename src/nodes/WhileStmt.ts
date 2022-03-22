import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";
import { RuntimePanic } from "../Debug.js";

export type WhileStmt = ExprBase & {
	type: "WhileStmt";
	condition: Expr;
	body: Expr;
};

export const WhileStmt = (
	condition: Expr,
	body: Expr,
	tokens: Token[]
): WhileStmt => {
	return {
		type: "WhileStmt",
		condition,
		body,
		tokens,
		eval(scope: Scope): [Value | null, Scope] {
			let conditionValue = this.condition.eval(scope)[0]?.value;
			let value: Value | null = null;
			while (typeof conditionValue === "boolean" && conditionValue) {
				const [newVal, newScope] = this.body.eval(scope);
				scope = newScope;
				value = newVal;
				// FIXME is this a bug that it doesn't consider scope?
				conditionValue = this.condition.eval(scope)[0]?.value;
			}
			if (typeof conditionValue !== "boolean") {
				throw RuntimePanic("Condition should not evaluate to nothing!");
			}
			return [value, scope];
		},
	};
};
