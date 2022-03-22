import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";
import StlNumber from "../StlNumber.js";
import { Node, x } from "code-red";

export type PrimaryExpr = StlStringExpr | StlBoolExpr | StlNumberExpr;

export type StlStringExpr = Expr & {
	type: "PrimaryExpr";
	literal: string;
	estree(): Node;
};

export const StlStringExpr = (
	literal: string,
	tokens: Token[]
): StlStringExpr => {
	return {
		type: "PrimaryExpr",
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
	type: "PrimaryExpr";
	literal: boolean;
	estree(): Node;
};

export const StlBoolExpr = (literal: boolean, tokens: Token[]): StlBoolExpr => {
	return {
		type: "PrimaryExpr",
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
	type: "PrimaryExpr";
	literal: StlNumber;
	estree(): Node;
};

export const StlNumberExpr = (
	literal: StlNumber,
	tokens: Token[]
): StlNumberExpr => {
	return {
		type: "PrimaryExpr",
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
