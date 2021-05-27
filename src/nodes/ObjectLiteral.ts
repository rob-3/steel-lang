import { Expr } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { Value } from "../Value";
import { copy } from "copy-anything";
import StlObject from "../StlObject";

export class ObjectLiteral implements Expr {
    properties: Map<string, Expr>;
    tokens: Token[];

    constructor(properties: Map<string, Expr>, tokens: Token[]) {
        this.properties = properties;
        this.tokens = tokens;
    }

    eval(scope: Scope): [StlObject, Scope] {
        const map = new Map<string, Value>();
        let currentScope = scope;
        for (const [key, value] of this.properties.entries()) {
            const [result, newScope]: [Value, Scope] = value.eval(currentScope);
            currentScope = newScope;
            map.set(key, result);
        }
        return [new StlObject(map), currentScope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new ObjectLiteral(copy(this.properties), this.tokens));
    }
}
