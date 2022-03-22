import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { RuntimePanic } from "../Debug.js";

export type VariableDeclarationStmt = Expr & {
	type: "VariableDeclarationStmt";
	immutable: boolean;
	identifier: string;
	right: Expr;
};

export const VariableDeclarationStmt = (
	identifier: string,
	immutable: boolean,
	right: Expr,
	tokens: Token[]
): VariableDeclarationStmt => {
	return {
		type: "VariableDeclarationStmt",
		identifier,
		immutable,
		right,
		tokens,
		eval(scope: Scope) {
			const [rightVal, newScope] = this.right.eval(scope);
			if (rightVal === null) {
				throw RuntimePanic(
					"Right side of variable declaration should not be nothing!"
				);
			}
			return newScope.define(this.identifier, rightVal, this.immutable);
		},
	};
};
