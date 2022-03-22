import { Expr } from "./Expr.js";

export type Ast = {
	exprs: Expr[];
};

export const Ast = (exprs: Expr[]) => {
	return {
		exprs,
	};
};
