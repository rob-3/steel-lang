import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { copy } from "copy-anything";
import { Value } from "../InterpreterHelpers";

export class PrimaryExpr implements Expr {
    literal: number | boolean | string;
    tokens: Token[];
    constructor(literal: number | boolean | string, tokens: Token[]) {
        this.literal = literal;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        return [this.literal, scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(copy(this));
    }

    getDebugInfo = getDebugInfo;
}
