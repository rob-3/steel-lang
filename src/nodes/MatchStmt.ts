import { RuntimePanic } from "../Debug.js";
import { Expr, ExprBase } from "../Expr.js";
import { equal } from "../Interpreter.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";
import { PrimaryExpr } from "./PrimaryExpr.js";

export type MatchStmt = ExprBase & {
	type: "MatchStmt";
	expr: Expr;
	cases: MatchCase[];
};

export const MatchStmt = (
	expr: Expr,
	cases: MatchCase[],
	tokens: Token[]
): MatchStmt => {
	return {
		type: "MatchStmt",
		expr,
		cases,
		tokens,
		eval(scope: Scope) {
			const rootExpr = this.expr;
			let [matchExprValue, newScope] = rootExpr.eval(scope);
			if (matchExprValue === null) {
				throw RuntimePanic("MatchExpr cannot be nothing!");
			}
			for (const matchCase of this.cases) {
				if (matchCase.matchExpr.type === "UnderscoreExpr") {
					return matchCase.expr.eval(newScope);
				}
				// FIXME decide if side effects are legal in a match expression
				const [caseValue, newScope2] = matchCase.matchExpr.eval(newScope);
				newScope = newScope2;
				// FIXME
				if (equal(caseValue!, matchExprValue).value) {
					return matchCase.expr.eval(newScope);
				}
			}
			throw RuntimePanic("Pattern match failed.");
		},
	};
};

export type MatchCase = {
	matchExpr: UnderscoreExpr | PrimaryExpr;
	expr: Expr;
};

export const MatchCase = (
	matchExpr: UnderscoreExpr | PrimaryExpr,
	expr: Expr
): MatchCase => {
	return {
		matchExpr,
		expr,
	};
};

export type UnderscoreExpr = ExprBase & {
	type: "UnderscoreExpr";
};

export const UnderscoreExpr = (tokens: Token[]): UnderscoreExpr => {
	return {
		type: "UnderscoreExpr",
		tokens,
		eval(scope: Scope): [Value, Scope] {
			// FIXME
			throw RuntimePanic("Tried to evaluate an UnderscoreExpr");
		},
	};
};
