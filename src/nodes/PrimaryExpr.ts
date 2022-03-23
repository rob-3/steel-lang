import { ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";
import StlNumber from "../StlNumber.js";
import { Node, x } from "code-red";

export type PrimaryExpr = StlStringExpr | StlBoolExpr | StlNumberExpr;

export const PrimaryExpr = (literal: StlNumber | string | boolean, tokens: Token[] = []): PrimaryExpr => {
	switch (typeof literal) {
		case "string":
			return StlStringExpr(literal, tokens);
		case "boolean":
			return StlBoolExpr(literal, tokens);
		case "object":
			return StlNumberExpr(literal, tokens);
	}
}

export type StlStringExpr = ExprBase & {
	type: "PrimaryExpr";
	literal: string;
	estree(): Node;
};

export const StlStringExpr = (
	literal: string,
	tokens: Token[] = []
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

export type StlBoolExpr = ExprBase & {
	type: "PrimaryExpr";
	literal: boolean;
	estree(): Node;
};

export const StlBoolExpr = (literal: boolean, tokens: Token[] = []): StlBoolExpr => {
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

export type StlNumberExpr = ExprBase & {
	type: "PrimaryExpr";
	literal: StlNumber;
	estree(): Node;
};

export const StlNumberExpr = (
	literal: StlNumber,
	tokens: Token[] = []
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
