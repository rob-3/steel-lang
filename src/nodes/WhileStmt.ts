import { Expr } from "../Expr";
import { assertBool } from "../Interpreter";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";

export default class WhileStmt implements Expr {
    condition: Expr;
    body: Expr;
    tokens: Token[];
    constructor(condition: Expr, body: Expr, tokens: Token[]) {
        this.condition = condition;
        this.body = body;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        let conditionValue = this.condition.eval(scope)[0];
        let value: Value = null;
        while (assertBool(conditionValue) && conditionValue) {
            const [newVal, newScope] = this.body.eval(scope);
            scope = newScope;
            value = newVal;
            // FIXME is this a bug that it doesn't consider scope?
            conditionValue = this.condition.eval(scope)[0];
        }
        return [value, scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(
            new WhileStmt(
                this.condition.map(fn),
                this.body.map(fn),
                this.tokens
            )
        );
    }
}
