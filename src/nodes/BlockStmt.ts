import { b, Node, x } from "code-red";
import { Expr, ExprBase } from "../Expr.js";
import { execStmts } from "../Interpreter.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { makeLetStatements } from "./MakeLetStatements.js";

export type BlockStmt = ExprBase & {
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
		},
		estree() {
			const bodyEstree = this.exprs.slice(0, -1).map((x) => x.estree());
			const identifierDeclarations = bodyEstree
				.map(({ identifierDeclarations }) => identifierDeclarations)
				.filter(
					(x): x is { identifier: string; immutable: boolean }[] =>
						x !== undefined
				)
				.flat();
			const exprs = bodyEstree
				.map(({ node }) => node)
				.filter((x): x is Node => !!x)
				.map((x) => b`${x}`);
			return {
				node: x`(() => {
						${makeLetStatements(identifierDeclarations)}
						${exprs}
						${b`return ${this.exprs.at(-1)?.estree().node}`}
					})()`,
			};
		},
	};
};
