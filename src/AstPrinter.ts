import { Expr, BinaryExpr, UnaryExpr, PrimaryExpr, GroupingExpr } from "./Expr";

export default function stringify(expr: Expr): string {
    if (expr instanceof BinaryExpr) {
        return `(${stringify(expr.left)} ${expr.operator.lexeme} ${stringify(expr.right)})`;
    }
    if (expr instanceof UnaryExpr) {
        return `(${expr.operator.lexeme}${stringify(expr.right)})`
    }
    if (expr instanceof PrimaryExpr) {
        return `${JSON.stringify(expr.literal)}`;
    }
    if (expr instanceof GroupingExpr) {
        return `(${stringify(expr.expr)})`;
    }
    throw "Unhandled expr: " + JSON.stringify(expr);
}
