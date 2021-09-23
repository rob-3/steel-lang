import { RuntimePanic } from "../Debug";
import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";

export default class IndexExpr implements Expr {
    arr: string;
    index: Expr;
    tokens: Token[];

    constructor(arr: string, index: Expr, tokens: Token[]) {
        this.arr = arr;
        this.index = index;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [boxedIndex, newScope] = this.index.eval(scope);
        const index = boxedIndex?.value;
        if (typeof index !== "number") {
            throw RuntimePanic(
                "Indexing expression must evaluate to a number!"
            );
        }
        const array = newScope.lookup(this.arr).value;
        if (!Array.isArray(array)) {
            throw RuntimePanic(`${this.arr} is not an array!`);
        }
        return [array[index], newScope];
    }
}
