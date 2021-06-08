import { copy } from "copy-anything";
import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";

export default class PrimaryExpr implements Expr {
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
}
