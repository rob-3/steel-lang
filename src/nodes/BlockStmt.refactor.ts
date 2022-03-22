import { Expr } from "../Expr.refactor.js";
import { execStmts } from "../Interpreter.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export type BlockStmt = Expr & {
	type: "BlockStmt";
	exprs: Expr[];
	tokens: Token[];
};

export const BlockStmt = (exprs: Expr[], tokens: Token[] = []): BlockStmt => {
	return {
		type: "BlockStmt",
		exprs,
		tokens,
		eval(scope: Scope) {
			return execStmts(this.exprs, scope);
		}
	}
}
