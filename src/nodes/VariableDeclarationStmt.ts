import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { RuntimePanic } from "../Debug.js";
import { Node, x } from "code-red";

export type VariableDeclarationStmt = ExprBase & {
	type: "VariableDeclarationStmt";
	immutable: boolean;
	identifier: string;
	right: Expr;
	estree(): Node;
};

export const VariableDeclarationStmt = (
	identifier: string,
	immutable: boolean,
	right: Expr,
	tokens: Token[] = []
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
		estree(): Node {
			// FIXME we need to signal that a top level variable declaration is needed
			return x`${this.identifier} = ${this.right.estree()}`;
		},
	};
};
