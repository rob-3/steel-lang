import { Expr, getDebugInfo } from "../Expr";
import Token from "../Token";
import Scope from "../Scope";
import { printfn } from "../Interpreter";

// TODO: library function
export class PrintStmt implements Expr {
    thingToPrint: Expr;
    tokens: Token[];
    constructor(thingToPrint: Expr, tokens: Token[]) {
        this.thingToPrint = thingToPrint;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        const [printValue, newScope] = this.thingToPrint.eval(scope);
        return printfn(printValue, newScope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new PrintStmt(this.thingToPrint.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}
