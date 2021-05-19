import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { stlPrint } from "../Logger";
import { Value } from "../Value";

// TODO: library function
export class PrintStmt implements Expr {
    thingToPrint: Expr;
    tokens: Token[];
    constructor(thingToPrint: Expr, tokens: Token[]) {
        this.thingToPrint = thingToPrint;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [printValue, newScope] = this.thingToPrint.eval(scope);
        stlPrint(printValue);
        return [printValue, newScope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new PrintStmt(this.thingToPrint.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}
