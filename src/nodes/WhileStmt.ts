import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { Value } from "../InterpreterHelpers";
import { getVal, getState, assertBool } from "../Interpreter";

export class WhileStmt implements Expr {
    condition: Expr;
    body: Expr;
    tokens: Token[];
    constructor(condition: Expr, body: Expr, tokens: Token[]) {
        this.condition = condition;
        this.body = body;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        let conditionValue = getVal(this.condition.eval(scope));
        let value: Value = null;
        while (assertBool(conditionValue) && conditionValue) {
            const pair = this.body.eval(scope);
            scope = getState(pair);
            value = getVal(pair);
            conditionValue = getVal(this.condition.eval(scope));
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

    getDebugInfo = getDebugInfo;
}
