import { b } from "code-red";
import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export type ReturnStmt = ExprBase & {
	type: "ReturnStmt";
	value: Expr;
};

export const ReturnStmt = (value: Expr, tokens: Token[] = []): ReturnStmt => {
	return {
		type: "ReturnStmt",
		value,
		tokens,
		eval(scope: Scope) {
			return this.value.eval(scope);
		},
		estree() {
			return {
				node: b`return ${this.value.estree().node}`[0],
			};
		},
	};
};
