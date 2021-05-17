import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { Value } from "../Value";
import { assertBool } from "../Interpreter";

export class UntilStmt implements Expr {
    condition: Expr;
    body: Expr;
    tokens: Token[];
    constructor(condition: Expr, body: Expr, tokens: Token[]) {
        this.condition = condition;
        this.body = body;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        let conditionValue = !this.condition.eval(scope)[0];
        let value: Value = null;
        while (assertBool(conditionValue) && conditionValue) {
            const [newVal, newScope] = this.body.eval(scope);
            scope = newScope;
            value = newVal;
            conditionValue = !this.condition.eval(scope)[0];
        }
        return [value, scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(
            new UntilStmt(
                this.condition.map(fn),
                this.body.map(fn),
                this.tokens
            )
        );
    }

    getDebugInfo = getDebugInfo;
}
