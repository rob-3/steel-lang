import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { UnboxedValue, Value } from "../Value.js";
import { RuntimePanic } from "../Debug.js";
import { x } from "code-red";

export type PrintStmt = ExprBase & {
	type: "PrintStmt";
	thingToPrint: Expr;
};

// TODO: library function
export const PrintStmt =
	(stlPrint: (value: UnboxedValue) => void) =>
	(thingToPrint: Expr, tokens: Token[] = []): PrintStmt => {
		return {
			type: "PrintStmt",
			thingToPrint,
			tokens,
			eval(scope: Scope): [Value, Scope] {
				const [printValue, newScope] = this.thingToPrint.eval(scope);
				if (printValue === null) {
					throw RuntimePanic("Can't print nothing!");
				}
				stlPrint(printValue.value);
				return [printValue, newScope];
			},
			estree() {
				return {
					node: x`stlPrint(${this.thingToPrint.estree().node})`,
				};
			},
		};
	};
