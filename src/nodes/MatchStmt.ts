import { RuntimePanic } from "../Debug.js";
import { Expr } from "../Expr.js";
import { equal } from "../Interpreter.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";
import PrimaryExpr from "./PrimaryExpr.js";

export default class MatchStmt implements Expr {
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
		if (matchExprValue === null) {
			throw RuntimePanic("MatchExpr cannot be nothing!");
		}
		for (const matchCase of this.cases) {
			if (matchCase.matchExpr instanceof UnderscoreExpr) {
				return matchCase.expr.eval(newScope);
			}
			// FIXME decide if side effects are legal in a match expression
			const [caseValue, newScope2] = matchCase.matchExpr.eval(newScope);
			newScope = newScope2;
			if (equal(caseValue, matchExprValue).value) {
				return matchCase.expr.eval(newScope);
			}
		}
		throw RuntimePanic("Pattern match failed.");
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
}
