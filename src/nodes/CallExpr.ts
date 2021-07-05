import { RuntimePanic } from "../Debug";
import { Expr } from "../Expr";
import { call } from "../Interpreter";
import Scope from "../Scope";
import { StlFunction } from "../StlFunction";
import Token from "../Token";
import { Value } from "../Value";

export default class CallExpr implements Expr {
    callee: Expr;
    args: Expr[];
    tokens: Token[];
    constructor(callee: Expr, args: Expr[], tokens: Token[]) {
        this.callee = callee;
        this.args = args;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [maybeFn, newScope] = this.callee.eval(scope);
        if (maybeFn?.value instanceof StlFunction) {
            return call(maybeFn.value, this.args, newScope);
        } else {
            throw RuntimePanic(
                `Can't call ${maybeFn?.value} because it is not a function.`
            );
        }
    }
}
