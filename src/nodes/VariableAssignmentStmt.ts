import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";

export default class VariableAssignmentStmt implements Expr {
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
}
