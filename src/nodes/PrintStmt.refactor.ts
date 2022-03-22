import { Expr } from "../Expr.refactor.js";
import { stlPrint } from "../Logger.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";
import { RuntimePanic } from "../Debug.js";

export type PrintStmt = Expr & {
	thingToPrint: Expr;
};

// TODO: library function
export const PrintStmt = (thingToPrint: Expr, tokens: Token[]): PrintStmt => {
	return {
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
	};
};
