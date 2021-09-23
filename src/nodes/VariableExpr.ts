import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";

export default class VariableExpr implements Expr {
    identifier: string;
    tokens: Token[];
    constructor(identifier: string, tokens: Token[]) {
        this.identifier = identifier;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        return [scope.lookup(this.identifier), scope];
    }
}
