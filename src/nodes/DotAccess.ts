import { RuntimePanic } from "../Debug";
import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";
import { ObjectLiteral } from "./ObjectLiteral";
import StlObject from "../StlObject";
import { copy } from "copy-anything";

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
        if (!assertStlObject(object)) {
            throw RuntimePanic(`${this.left} is not an object!`);
        } else {
            const value: Value | undefined = object.properties.get(this.right);
            if (value === undefined) {
                throw RuntimePanic(`Property "${this.right}" does not exist!`);
            }
            return [value, newScope];
        }
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new DotAccess(copy(this.left), this.right, this.tokens));
    }
}

function assertStlObject(
    maybeSteelObject: Value
): maybeSteelObject is StlObject {
    return maybeSteelObject instanceof StlObject;
}
