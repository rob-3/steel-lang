import { Expr, BlockStmt, FunctionDefinition } from "./Expr";

const astTransforms: ((expr: Expr) => Expr)[] = [hoistFunctions];

export default astTransforms;

function hoistFunctions(expr: Expr) {
    if (expr instanceof BlockStmt) {
        let children: Expr[] = expr.exprs;
        let reorderedChildren = children.reduce((acc: Expr[], cur: Expr) => {
            if (cur instanceof FunctionDefinition) {
                acc.unshift(cur);
            } else {
                acc.push(cur);
            }
            return acc;
        }, []);
        return new BlockStmt(reorderedChildren);
    } else {
        return expr;
    }
}
