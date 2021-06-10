import { Expr } from "../Expr";
import Scope from "../Scope";
import { StlFunction } from "../StlFunction";
import Token from "../Token";
import { Value } from "../Value";

export default class FunctionExpr implements Expr {
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
}
