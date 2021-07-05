import { copy } from "copy-anything";
import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value, Box } from "../Value";

export default class PrimaryExpr implements Expr {
    literal: number | boolean | string;
    tokens: Token[];
    constructor(literal: number | boolean | string, tokens: Token[]) {
        this.literal = literal;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        return [new Box(this.literal), scope];
    }
}
