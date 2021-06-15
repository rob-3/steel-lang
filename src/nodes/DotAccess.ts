import { RuntimePanic } from "../Debug";
import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";
import StlObject from "../StlObject";

export default class DotAccess implements Expr {
    left: Expr;
    right: string;
    tokens: Token[];

    constructor(left: Expr, right: string, tokens: Token[]) {
        this.left = left;
        this.right = right;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [object, newScope]: [Value, Scope] = this.left.eval(scope);
        if (!(object instanceof StlObject)) {
            throw RuntimePanic(`${this.left} is not an object!`);
        } else {
            const value: Value | undefined = object.properties.get(this.right);
            if (value === undefined) {
                throw RuntimePanic(`Property "${this.right}" does not exist!`);
            }
            return [value, newScope];
        }
    }
}
