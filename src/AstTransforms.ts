import { Expr, BlockStmt, FunctionDefinition } from "./Expr";

const astTransforms: ((expr: Expr) => Expr)[] = [hoistFunctions];

export default astTransforms;

function hoistFunctions(expr: Expr) {
    if (expr instanceof BlockStmt) {
        const children: Expr[] = expr.exprs;
        const reorderedChildren: Expr[] = children.reduce<Expr[]>(
            (acc: Expr[], cur: Expr) => {
                if (cur instanceof FunctionDefinition) {
                    acc.unshift(cur);
                } else {
                    acc.push(cur);
                }
                return acc;
            },
            []
        );
        return new BlockStmt(reorderedChildren, expr.tokens);
    } else {
        return expr;
    }
}
