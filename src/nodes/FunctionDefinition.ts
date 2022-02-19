import { Expr } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import VariableDeclarationStmt from "./VariableDeclarationStmt.js";

export default class FunctionDefinition implements Expr {
	definition: VariableDeclarationStmt;
	tokens: Token[];

	constructor(definition: VariableDeclarationStmt, tokens: Token[]) {
		this.definition = definition;
		this.tokens = tokens;
	}

	eval(scope: Scope) {
		return this.definition.eval(scope);
	}
}
