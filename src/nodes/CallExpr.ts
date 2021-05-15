import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { RuntimePanic } from "../Debug";
import { StlFunction } from "../InterpreterHelpers";
import { call } from "../Interpreter";

export class CallExpr implements Expr {
    callee: Expr;
    args: Expr[];
    tokens: Token[];
    constructor(callee: Expr, args: Expr[], tokens: Token[]) {
        this.callee = callee;
        this.args = args;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        const [maybeFn, newScope] = this.callee.eval(scope);
        if (maybeFn instanceof StlFunction) {
            return call(maybeFn, this.args, newScope);
        } else {
            throw RuntimePanic(
                `Can't call ${maybeFn} because it is not a function.`
            );
        }
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(
            new CallExpr(this.callee.map(fn), this.args.map(fn), this.tokens)
        );
    }

    getDebugInfo = getDebugInfo;
}
