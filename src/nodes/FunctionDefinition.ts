import { Node } from "code-red";
import { ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { VariableDeclarationStmt } from "./VariableDeclarationStmt.js";

export type FunctionDefinition = ExprBase & {
	type: "FunctionDefinition";
	definition: VariableDeclarationStmt;
	estree(): Node;
};

export const FunctionDefinition = (
	definition: VariableDeclarationStmt,
	tokens: Token[] = []
): FunctionDefinition => {
	return {
		type: "FunctionDefinition",
		definition,
		tokens,
		eval(scope: Scope) {
			return this.definition.eval(scope);
		},
		estree() {
			return this.definition.estree();
		},
	};
};
