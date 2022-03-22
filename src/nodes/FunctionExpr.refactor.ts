import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import { StlFunction } from "../StlFunction.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";

export type FunctionExpr = Expr & {
	args: string[];
	body: Expr;
	toString(): string;
};

export const FunctionExpr = (
	args: string[],
	body: Expr,
	tokens: Token[]
): FunctionExpr => {
	return {
		args,
		body,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			return [new Box(new StlFunction(this, scope)), scope];
		},

		toString() {
			return "[anonymous function]";
		},
	};
};
