import { RuntimePanic } from "../Debug";
import { Expr } from "../Expr";
import { call } from "../Interpreter";
import Scope from "../Scope";
import { StlFunction } from "../StlFunction";
import Token from "../Token";

export default class CallExpr implements Expr {
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
}