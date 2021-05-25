import { copy } from "copy-anything";
import { RuntimePanic } from "../Debug";
import { Expr } from "../Expr";
import { equal } from "../Interpreter";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";
import { PrimaryExpr } from "./PrimaryExpr";

export class MatchStmt implements Expr {
    expr: Expr;
    cases: MatchCase[];
    tokens: Token[];
    constructor(expr: Expr, cases: MatchCase[], tokens: Token[]) {
        this.expr = expr;
        this.cases = cases;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        const rootExpr = this.expr;
        let [matchExprValue, newScope] = rootExpr.eval(scope);
        for (const matchCase of this.cases) {
            if (matchCase.matchExpr instanceof UnderscoreExpr) {
                return matchCase.expr.eval(newScope);
            }
            // FIXME decide if side effects are legal in a match expression
            const [caseValue, newScope2] = matchCase.matchExpr.eval(newScope);
            newScope = newScope2;
            if (equal(caseValue, matchExprValue)) {
                return matchCase.expr.eval(newScope);
            }
        }
        throw RuntimePanic("Pattern match failed.");
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new MatchStmt(this.expr.map(fn), this.cases, this.tokens));
    }
}

export class MatchCase {
    matchExpr: UnderscoreExpr | PrimaryExpr;
    expr: Expr;

    constructor(matchExpr: UnderscoreExpr | PrimaryExpr, expr: Expr) {
        this.matchExpr = matchExpr;
        this.expr = expr;
    }
}

export class UnderscoreExpr implements Expr {
    tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        // FIXME
        throw RuntimePanic("Tried to evaluate an UnderscoreExpr");
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(copy(this));
    }
}
