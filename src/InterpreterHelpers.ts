import { Scoped, stmtExec } from "./Interpreter";
import { FunctionExpr } from "./Expr";
import Scope from "./Scope";

export class CfxFunction {
    funExpr: FunctionExpr;
    constructor(funExpr: FunctionExpr) {
        this.funExpr = funExpr;
    }

    call(callArgs: Value[], scope: Scope): Scoped<Value> {
        let functionScope = new Scope(scope);
        for (let i = 0; i < this.funExpr.args.length; i++) {
            // FIXME typecheck args
            functionScope.set(this.funExpr.args[i], [callArgs[i], false]);
        }
        return stmtExec(this.funExpr.body, functionScope);
    }
}

export type Value = number | boolean | string | CfxFunction;
