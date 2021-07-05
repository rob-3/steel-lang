import { RuntimePanic } from "../Debug";
import { Expr } from "../Expr";
import { assertBool } from "../Interpreter";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";

export default class IfStmt implements Expr {
    condition: Expr;
    body: Expr;
    elseBody: Expr | null;
    tokens: Token[];
    constructor(
        condition: Expr,
        body: Expr,
        elseBody: Expr | null,
        tokens: Token[]
    ) {
        this.condition = condition;
        this.body = body;
        this.elseBody = elseBody;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value | null, Scope] {
        const [boxedMaybeBool, newScope] = this.condition.eval(scope);
        const shouldBeBool = boxedMaybeBool?.value;
        if (!assertBool(shouldBeBool)) {
            throw RuntimePanic("Condition doesn't evaluate to a boolean.");
        }
        if (shouldBeBool) {
            return this.body.eval(newScope);
        } else if (this.elseBody !== null) {
            return this.elseBody.eval(newScope);
        } else {
            // FIXME: hack we need to address
            return [null, newScope];
        }
    }
}
