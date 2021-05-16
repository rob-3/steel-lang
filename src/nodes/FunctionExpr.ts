import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { Value } from "../Value";
import { StlFunction } from "../StlFunction";

export class FunctionExpr implements Expr {
    args: string[];
    body: Expr;
    tokens: Token[];
    constructor(args: string[], body: Expr, tokens: Token[]) {
        this.args = args;
        this.body = body;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        return [new StlFunction(this, scope), scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new FunctionExpr(this.args, this.body.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}
