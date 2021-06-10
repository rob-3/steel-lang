import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";

export default class VariableDeclarationStmt implements Expr {
    immutable: boolean;
    identifier: string;
    right: Expr;
    tokens: Token[];
    constructor(
        identifier: string,
        immutable: boolean,
        right: Expr,
        tokens: Token[]
    ) {
        this.immutable = immutable;
        this.identifier = identifier;
        this.right = right;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        const [rightVal, newScope] = this.right.eval(scope);
        return newScope.define(this.identifier, rightVal, this.immutable);
    }
}
