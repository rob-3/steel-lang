import { Expr } from "./Expr";
import { BlockStmt } from "./nodes/BlockStmt";

export default class Ast {
    exprs: Expr[];

    constructor(exprs: Expr[]) {
        this.exprs = exprs;
    }

    map(fn: (expr: Expr) => Expr): Ast {
        const a = fn(
            new BlockStmt(this.exprs).map((expr: Expr) => fn(expr.map(fn)))
        );
        if (a instanceof BlockStmt) {
            return new Ast(a.exprs);
        } else {
            return new Ast([a]);
        }
    }
}
