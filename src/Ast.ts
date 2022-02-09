import { Expr } from "./Expr";

export default class Ast {
	exprs: Expr[];

	constructor(exprs: Expr[]) {
		this.exprs = exprs;
	}
}
