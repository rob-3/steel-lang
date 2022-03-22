import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";
import StlNumber from "../StlNumber.js";
import { Node, x } from "code-red";

export type PrimaryExpr = StlStringExpr | StlBoolExpr | StlNumberExpr;

export type StlStringExpr = Expr & {
	literal: string;
	estree(): Node;
};

export const StlStringExpr = (
	literal: string,
	tokens: Token[]
): StlStringExpr => {
	return {
		literal,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			return [new Box(this.literal), scope];
		},
		estree(): Node {
			return x`{stlValue: "${this.literal.toString()}"}`;
		},
	};
};

export type StlBoolExpr = Expr & {
	literal: boolean;
	estree(): Node;
};

export const StlBoolExpr = (literal: boolean, tokens: Token[]): StlBoolExpr => {
	return {
		literal,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			return [new Box(this.literal), scope];
		},
		estree(): Node {
			return x`{stlValue: ${this.literal.toString()}}`;
		},
	};
};

export type StlNumberExpr = Expr & {
	literal: StlNumber;
	estree(): Node;
};

export const StlNumberExpr = (
	literal: StlNumber,
	tokens: Token[]
): StlNumberExpr => {
	return {
		literal,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			return [new Box(this.literal), scope];
		},
		estree(): Node {
			return x`{
					stlValue: {
						top: ${`${this.literal.top.toString()}n`},
						bottom: ${`${this.literal.bottom.toString()}n`}
					}
				}`;
		},
	};
};
