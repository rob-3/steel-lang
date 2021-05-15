import { Expr, getDebugInfo } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../InterpreterHelpers";
import { copy } from "copy-anything";

export class ArrayLiteral implements Expr {
    exprs: Expr[];
    tokens: Token[];

    constructor(exprs: Expr[], tokens: Token[]) {
        this.exprs = exprs;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const resolved: Value[] = [];
        const newScope = this.exprs.reduce((acc: Scope, cur: Expr) => {
            const [val, scope]: [Value, Scope] = cur.eval(acc);
            resolved.push(val);
            return scope;
        }, scope);
        return [resolved, newScope];
    }

    map(fn: (expr: Expr) => Expr) {
        return new ArrayLiteral(
            this.exprs.map((e) => e.map(fn)),
            copy(this.tokens)
        );
    }

    getDebugInfo = getDebugInfo;
}
