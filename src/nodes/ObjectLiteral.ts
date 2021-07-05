import { Expr } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { Value, Box } from "../Value";
import { copy } from "copy-anything";
import StlObject from "../StlObject";
import { RuntimePanic } from "../Debug";

export class ObjectLiteral implements Expr {
    properties: Map<string, Expr>;
    tokens: Token[];

    constructor(properties: Map<string, Expr>, tokens: Token[]) {
        this.properties = properties;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Box<StlObject>, Scope] {
        const map = new Map<string, Value>();
        let currentScope = scope;
        for (const [key, value] of this.properties.entries()) {
            const [result, newScope]: [Value | null, Scope] =
                value.eval(currentScope);
            currentScope = newScope;
            if (result === null) {
                throw RuntimePanic("Object value cannot be nothing!");
            }
            map.set(key, result);
        }
        return [new Box(new StlObject(map)), currentScope];
    }
}
