import { Node, x } from "code-red";
import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import { StlFunction } from "../StlFunction.js";
import Token from "../Token.js";
import { Box, Value } from "../Value.js";

export type FunctionExpr = ExprBase & {
	type: "FunctionExpr";
	args: string[];
	body: Expr;
	toString(): string;
};

export const FunctionExpr = (
	args: string[],
	body: Expr,
	tokens: Token[] = []
): FunctionExpr => {
	return {
		type: "FunctionExpr",
		args,
		body,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			return [new Box(new StlFunction(this, scope)), scope];
		},
		toString() {
			return "[anonymous function]";
		},
		estree() {
			const args: Node[] = this.args.map((id) => x`${id}`);
			return {
				node: x`(${args}) => ${this.body.estree().node}`,
			};
		},
	};
};
