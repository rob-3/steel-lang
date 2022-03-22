import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";

export type VariableExpr = Expr & {
	type: "VariableExpr";
	identifier: string;
};

export const VariableExpr = (
	identifier: string,
	tokens: Token[]
): VariableExpr => {
	return {
		type: "VariableExpr",
		identifier,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			return [scope.lookup(this.identifier), scope];
		},
	};
};
