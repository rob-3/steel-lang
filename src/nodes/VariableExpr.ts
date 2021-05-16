import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { copy } from "copy-anything";
import { Value } from "../Value";

export class VariableExpr implements Expr {
    identifier: string;
    tokens: Token[];
    constructor(identifier: string, tokens: Token[]) {
        this.identifier = identifier;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        return [scope.lookup(this.identifier), scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(copy(this));
    }

    getDebugInfo = getDebugInfo;
}
