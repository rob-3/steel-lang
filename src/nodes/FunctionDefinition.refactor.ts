import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import VariableDeclarationStmt from "./VariableDeclarationStmt.js";

export type FunctionDefinition = Expr & {
	type: "FunctionDefinition";
	definition: VariableDeclarationStmt;
};

export const FunctionDefinition = (
	definition: VariableDeclarationStmt,
	tokens: Token[]
): FunctionDefinition => {
	return {
		type: "FunctionDefinition",
		definition,
		tokens,
		eval(scope: Scope) {
			return this.definition.eval(scope);
		},
	};
};
