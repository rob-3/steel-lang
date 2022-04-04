import {b, Node, x} from "code-red";
import { Expr, ExprBase } from "../Expr.js";
import { execStmts } from "../Interpreter.js";
import Scope from "../Scope.js";
import Token from "../Token.js";

export type BlockStmt = ExprBase & {
	type: "BlockStmt";
	exprs: Expr[];
	tokens: Token[];
	estree(): Node;
};

export const BlockStmt = (exprs: Expr[], tokens: Token[] = []): BlockStmt => {
	return {
		type: "BlockStmt",
		exprs,
		tokens,
		eval(scope: Scope) {
			return execStmts(this.exprs, scope);
		},
		estree(): Node {
			const exprs: Node[] = this.exprs.map(x => x.estree());
			return x`(() => {
				${exprs.slice(0, -1)}
				${b`return ${exprs.at(-1)}`}
			})()`
		}
	}
}
