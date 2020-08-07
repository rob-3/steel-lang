import { Scoped, exprEval, getState, getVal } from "./Interpreter";
import { FunctionExpr } from "./Expr";
import Scope from "./Scope";

export class StlFunction {
    funExpr: FunctionExpr;
    constructor(funExpr: FunctionExpr) {
        this.funExpr = funExpr;
    }

    call(callArgs: Value[], scope: Scope): Scoped<Value> {
        let funScope = new Scope(scope);
        for (let i = 0; i < this.funExpr.args.length; i++) {
            // FIXME typecheck args
            funScope.setLocal(this.funExpr.args[i], [callArgs[i], false]);
        }

        let result: Scoped<Value> = exprEval(this.funExpr.body, funScope);
        return [getVal(result), getState(result).parentScope];
    }
}

export type Value = number | boolean | string | StlFunction;
