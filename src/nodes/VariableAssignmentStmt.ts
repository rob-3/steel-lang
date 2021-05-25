import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";

export class VariableAssignmentStmt implements Expr {
    identifier: string;
    right: Expr;
    tokens: Token[];
    constructor(identifier: string, right: Expr, tokens: Token[]) {
        this.identifier = identifier;
        this.right = right;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        const [rightVal, newScope] = this.right.eval(scope);
        return newScope.assign(this.identifier, rightVal);
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(
            new VariableAssignmentStmt(
                this.identifier,
                this.right.map(fn),
                this.tokens
            )
        );
    }
}
