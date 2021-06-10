import { Expr } from "../Expr";
import { execStmts } from "../Interpreter";
import Scope from "../Scope";
import Token from "../Token";

export default class BlockStmt implements Expr {
    exprs: Expr[];
    tokens: Token[];
    constructor(exprs: Expr[], tokens: Token[] = []) {
        this.exprs = exprs;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        return execStmts(this.exprs, scope);
    }
}
