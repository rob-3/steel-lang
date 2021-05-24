import Scope from "./Scope";
import Token from "./Token";
import Location from "./Location";
import { Value } from "./Value";
export interface Expr {
    map(fn: (expr: Expr) => Expr): Expr;
    getDebugInfo(): Location;
    eval(scope: Scope): [Value, Scope];
    tokens: Token[];
}

export function getDebugInfo(this: Expr): Location {
    const tokens = this.tokens;
    const filename = tokens[0].location.filename;

    const startSpot = tokens[0].location.start;
    const endSpot = tokens[tokens.length - 1].location.end;
    const location = new Location(startSpot, endSpot, filename);
    return location;
}

/*
export class FailedParse implements Expr {
    map(_: (expr: Expr) => Expr) {
        return this;
    }

    getDebugInfo = () => null;
}
*/
