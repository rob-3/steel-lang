import { ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";
import StlNumber from "../StlNumber.js";
import { x } from "code-red";

export type PrimaryExpr = StlStringExpr | StlBoolExpr | StlNumberExpr;

export const PrimaryExpr = (
	literal: StlNumber | string | boolean,
	tokens: Token[] = []
): PrimaryExpr => {
	switch (typeof literal) {
		case "string":
			return StlStringExpr(literal, tokens);
		case "boolean":
			return StlBoolExpr(literal, tokens);
		case "object":
			return StlNumberExpr(literal, tokens);
	}
};

export type StlStringExpr = ExprBase & {
	type: "PrimaryExpr";
	literal: string;
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
		estree() {
			return { node: x`{stlValue: "${this.literal.toString()}"}` };
		},
	};
};

export type StlBoolExpr = ExprBase & {
	type: "PrimaryExpr";
	literal: boolean;
};

export const StlBoolExpr = (
	literal: boolean,
	tokens: Token[] = []
): StlBoolExpr => {
	return {
		type: "PrimaryExpr",
		literal,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			return [new Box(this.literal), scope];
		},
		estree() {
			return { node: x`{stlValue: ${this.literal.toString()}}` };
		},
	};
};

export type StlNumberExpr = ExprBase & {
	type: "PrimaryExpr";
	literal: StlNumber;
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
		estree() {
			return {
				node: x`{
					stlValue: {
						top: ${`${this.literal.top.toString()}n`},
						bottom: ${`${this.literal.bottom.toString()}n`}
					}
				}`,
			};
		},
	};
};
