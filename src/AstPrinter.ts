import Expr from "./Expr";

export default function stringify(expr: Expr): string {
    if (expr instanceof Expr.Binary) {
        return `(${stringify(expr.left)} ${expr.operator.lexeme} ${stringify(expr.right)})`;
    }
    if (expr instanceof Expr.Unary) {
        return `(${expr.operator.lexeme}${stringify(expr.right)})`
    }
    if (expr instanceof Expr.Primary) {
        return `${JSON.stringify(expr.literal)}`;
    }
    if (expr instanceof Expr.Grouping) {
        return `(${stringify(expr.expr)})`;
    }
    throw "Unhandled expr: " + JSON.stringify(expr);
}
