import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";

export class VariableDeclarationStmt implements Expr {
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

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(
            new VariableDeclarationStmt(
                this.identifier,
                this.immutable,
                this.right.map(fn),
                this.tokens
            )
        );
    }

    getDebugInfo = getDebugInfo;
}
