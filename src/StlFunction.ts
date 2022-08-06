import { exprEval } from "./Interpreter.js";
import { FunctionExpr } from "./nodes/FunctionExpr.js";
import Scope from "./Scope.js";
import { Value } from "./Value.js";

export class StlFunction {
	funExpr: FunctionExpr;
	scope: Scope;
	constructor(funExpr: FunctionExpr, scope: Scope) {
		this.funExpr = funExpr;
		this.scope = scope;
	}

	call(callArgs: Value[]): Value | null {
		const funScope = new Scope(this.scope);
		for (let i = 0; i < this.funExpr.args.length; i++) {
			// FIXME typecheck args
			const { name, isImmutable } = this.funExpr.args[i];
			funScope.setLocal(name, [callArgs[i], isImmutable]);
		}

		return exprEval(this.funExpr.body, funScope)[0];
	}
}
