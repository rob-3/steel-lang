import { copy } from "copy-anything";
import { RuntimePanic } from "../Debug";
import { Expr, getDebugInfo } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";

export class IndexExpr implements Expr {
    arr: string;
    index: Expr;
    tokens: Token[];

    constructor(arr: string, index: Expr, tokens: Token[]) {
        this.arr = arr;
        this.index = index;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [index, newScope] = this.index.eval(scope);
        if (typeof index !== "number") {
            throw RuntimePanic(
                "Indexing expression must evaluate to a number!"
            );
        }
        const array = newScope.lookup(this.arr);
        if (!Array.isArray(array)) {
            throw RuntimePanic(`${this.arr} is not an array!`);
        }
        return [array[index], newScope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new IndexExpr(copy(this.arr), this.index, copy(this.tokens)));
    }

    getDebugInfo = getDebugInfo;
}
