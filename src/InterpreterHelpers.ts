import { Scoped, exprEval } from "./Interpreter";
import { FunctionExpr } from "./Expr";
import Scope from "./Scope";
import { State } from "./lib/Monads";

export class CfxFunction {
    funExpr: FunctionExpr;
    constructor(funExpr: FunctionExpr) {
        this.funExpr = funExpr;
    }

    call(callArgs: Value[], scope: Scope): Scoped<Value> {
        let functionScope = new Scope(scope);
        for (let i = 0; i < this.funExpr.args.length; i++) {
            // FIXME typecheck args
            functionScope.setLocal(this.funExpr.args[i], [callArgs[i], false]);
        }
        let { value, state } = exprEval(this.funExpr.body, functionScope);
        return State.of(value, state.parentScope);
    }
}

export type Value = number | boolean | string | CfxFunction;
