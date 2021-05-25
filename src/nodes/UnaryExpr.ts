import { RuntimePanic } from "../Debug";
import { Expr } from "../Expr";
import { not, opposite } from "../Interpreter";
import Scope from "../Scope";
import Token from "../Token";
import TokenType from "../TokenType";
import { Value } from "../Value";

export class UnaryExpr implements Expr {
    operator: Token;
    right: Expr;
    tokens: Token[];
    constructor(operator: Token, right: Expr, tokens: Token[]) {
        this.operator = operator;
        this.right = right;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [value, newScope] = this.right.eval(scope);
        switch (this.operator.type) {
            case TokenType.MINUS:
                return [opposite(value), newScope];
            case TokenType.NOT:
                return [not(value), newScope];
        }
        throw RuntimePanic("Unsupported operator type in UnaryExpr");
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(
            new UnaryExpr(this.operator, this.right.map(fn), this.tokens)
        );
    }
}
