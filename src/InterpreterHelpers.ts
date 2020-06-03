import { Scoped, exprEval, getState, getVal } from "./Interpreter";
import { FunctionExpr, ReturnStmt } from "./Expr";
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
            functionScope.setLocal(this.funExpr.args[i], [callArgs[i], false]);
        }

        let result: Scoped<Value>;
        for (let stmt of this.funExpr.body.stmts) {
            result = exprEval(stmt, functionScope)
            functionScope = getState(result);
            if (stmt instanceof ReturnStmt) {
                break;
            }
        }
        return [getVal(result), getState(result).parentScope];
    }
}

export type Value = number | boolean | string | CfxFunction;
