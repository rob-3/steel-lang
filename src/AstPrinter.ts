import Expr from "./Expr";

export default function stringify(expr: Expr): string {
    if (expr instanceof Expr.Binary) {
        return `(${stringify(expr.left)} ${expr.operator.lexeme} ${stringify(expr.right)})`;
    }
    if (expr instanceof Expr.Unary) {
        return `(${expr.operator.lexeme}${stringify(expr.right)})`
    }
    if (expr instanceof Expr.Primary) {
        return `${expr.literal}`;
    }
    throw "Unhandled expr: " + JSON.stringify(expr);
}
