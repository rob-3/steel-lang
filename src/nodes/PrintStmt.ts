import { Expr } from "../Expr";
import { stlPrint } from "../Logger";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";
import { RuntimePanic } from "../Debug";

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
        if (printValue === null) {
            throw RuntimePanic("Can't print nothing!");
        }
        stlPrint(printValue);
        return [printValue, newScope];
    }
}
