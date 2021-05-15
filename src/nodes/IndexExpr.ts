import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { copy } from "copy-anything";
import { RuntimePanic } from "../Debug";
import { Value } from "../InterpreterHelpers";

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
            // FIXME we probably should throw every RuntimePanic since
            // TypeScript isn't smart enough to know we throw
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
