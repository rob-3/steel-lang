import { Expr, getDebugInfo } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";

export default class ReturnStmt implements Expr {
    value: Expr;
    tokens: Token[];
    constructor(value: Expr, tokens: Token[]) {
        this.value = value;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        return this.value.eval(scope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new ReturnStmt(this.value.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}
