import { Expr } from "../Expr";
import { stlPrint } from "../Logger";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";

// TODO: library function
export default class PrintStmt implements Expr {
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
}
