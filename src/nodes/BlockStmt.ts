import { Expr } from "../Expr.js";
import { execStmts } from "../Interpreter.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export default class BlockStmt implements Expr {
	exprs: Expr[];
	tokens: Token[];
	constructor(exprs: Expr[], tokens: Token[] = []) {
		this.exprs = exprs;
		this.tokens = tokens;
	}

	eval(scope: Scope) {
		return execStmts(this.exprs, scope);
	}
}
