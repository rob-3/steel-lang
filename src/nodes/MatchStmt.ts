import { Node, x } from "code-red";
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
	tokens: Token[] = []
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
		estree() {
			// FIXME this should be accounted for
			if (this.cases.length === 0) {
				return { errors: [Error("Cannot be no cases!")] };
			}
			/*
			for (const matchCase of this.cases.slice(0, -1)) {
				if (matchCase.matchExpr.type === "UnderscoreExpr") {
					return Error("UnderscoreExpr must be last in match statement");
				}
			}
			*/
			const hasUnderscore =
				this.cases.at(-1)?.matchExpr.type === "UnderscoreExpr";
			const skeletonCode = [
				"((val) => { if (stlEqual(val, ",
				")) return ",
				...Array(this.cases.length - (hasUnderscore ? 2 : 1))
					.fill([";if (stlEqual(val, ", ")) return "])
					.flat(),
			];
			skeletonCode.push(";return ");
			skeletonCode.push(";})(");
			skeletonCode.push(")");
			const subEstrees = this.cases.flatMap(({ matchExpr, expr }, i, arr) => {
				if (matchExpr.type === "UnderscoreExpr" && i === arr.length - 1) {
					return [expr.estree()];
				}
				return [matchExpr.estree(), expr.estree()];
			});
			if (!hasUnderscore) {
				subEstrees.push({ node: x`null` });
			}
			subEstrees.push(this.expr.estree());
			// SAFETY: return an Error if any part is an error
			for (const estree of subEstrees) {
				// FIXME we should send multiple errors back
				if (Array.isArray(estree)) return estree;
			}
			const subEstreesChecked: { node: Node }[] = subEstrees as {
				node: Node;
			}[];
			return {
				node: x(
					skeletonCode as unknown as TemplateStringsArray,
					...subEstreesChecked.map((x) => x.node)
				),
			};
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

export const UnderscoreExpr = (tokens: Token[] = []): UnderscoreExpr => {
	return {
		type: "UnderscoreExpr",
		tokens,
		eval(scope: Scope): [Value, Scope] {
			// FIXME
			throw RuntimePanic("Tried to evaluate an UnderscoreExpr");
		},
		estree() {
			throw Error("Cannot compile an UnderscoreExpr");
		},
	};
};
