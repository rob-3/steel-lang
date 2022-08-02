import { Node, x } from "code-red";
import { Expr, ExprBase } from "../Expr.js";
import { Binding } from "../Parser.js";
import Scope from "../Scope.js";
import { StlFunction } from "../StlFunction.js";
import Token from "../Token.js";
import { Box, Value } from "../Value.js";

export type FunctionExpr = ExprBase & {
	type: "FunctionExpr";
	args: Binding[];
	body: Expr;
	toString(): string;
};

export const FunctionExpr = (
	args: Binding[],
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
			const args: Node[] = this.args.map(({ name }) => x`${name}`);
			return {
				node: x`(${args}) => ${this.body.estree().node}`,
			};
		},
	};
};
