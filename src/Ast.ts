import { Expr } from "./Expr.js";

export default class Ast {
	exprs: Expr[];

	constructor(exprs: Expr[]) {
		this.exprs = exprs;
	}
}
