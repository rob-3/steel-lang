import { Expr } from "../Expr.js";
import { stlPrint } from "../Logger.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";
import { RuntimePanic } from "../Debug.js";

// TODO: library function
export default class PrintStmt implements Expr {
	thingToPrint: Expr;
	tokens: Token[];
	constructor(thingToPrint: Expr, tokens: Token[]) {
		this.thingToPrint = thingToPrint;
		this.tokens = tokens;
	}

	eval(scope: Scope): [Value, Scope] {
		const [printValue, newScope] = this.thingToPrint.eval(scope);
		if (printValue === null) {
			throw RuntimePanic("Can't print nothing!");
		}
		stlPrint(printValue.value);
		return [printValue, newScope];
	}
}
