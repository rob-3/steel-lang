import { b, Node } from "code-red";
import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export type ReturnStmt = ExprBase & {
	type: "ReturnStmt";
	value: Expr;
	estree(): Node;
};

export const ReturnStmt = (value: Expr, tokens: Token[] = []): ReturnStmt => {
	return {
		type: "ReturnStmt",
		value,
		tokens,
		eval(scope: Scope) {
			return this.value.eval(scope);
		},
		estree(): Node {
			return b`return ${this.value.estree()}`[0];
		},
	};
};
