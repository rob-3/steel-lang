import { exprEval } from "./Interpreter";
import FunctionExpr from "./nodes/FunctionExpr";
import Scope from "./Scope";
import { Value } from "./Value";

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
            funScope.setLocal(this.funExpr.args[i], [
                callArgs[i],
                this.funExpr.args[i][0] !== "~",
            ]);
        }

        return exprEval(this.funExpr.body, funScope)[0];
    }
}
