import { Scoped, exprEval, getVal } from "./Interpreter";
import { FunctionExpr } from "./Expr";
import Scope from "./Scope";

export class StlFunction {
    funExpr: FunctionExpr;
    scope: Scope;
    constructor(funExpr: FunctionExpr) {
        this.funExpr = funExpr;
    }

    call(callArgs: Value[]): Value {
        const funScope = new Scope(this.scope);
        for (let i = 0; i < this.funExpr.args.length; i++) {
            // FIXME typecheck args
            funScope.setLocal(this.funExpr.args[i], [callArgs[i], false]);
        }

        const result: Scoped<Value> = exprEval(this.funExpr.body, funScope);
        return getVal(result);
    }
}

export type Value = number | boolean | string | StlFunction | Value[];
