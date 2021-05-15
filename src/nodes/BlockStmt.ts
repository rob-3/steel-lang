import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { execStmts } from "../Interpreter";

export class BlockStmt implements Expr {
    exprs: Expr[];
    tokens: Token[];
    constructor(exprs: Expr[], tokens: Token[] = []) {
        this.exprs = exprs;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        return execStmts(this.exprs, scope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new BlockStmt(this.exprs.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}
