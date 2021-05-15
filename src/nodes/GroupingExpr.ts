import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";

export class GroupingExpr implements Expr {
    expr: Expr;
    tokens: Token[];
    constructor(expr: Expr, tokens: Token[]) {
        this.expr = expr;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        return this.expr.eval(scope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new GroupingExpr(this.expr.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}
