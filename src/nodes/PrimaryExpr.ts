import { Expr } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value, Box } from "../Value.js";
import StlNumber from "../StlNumber.js";
import { Node, x } from "code-red";

export default class PrimaryExpr implements Expr {
	literal: StlNumber | boolean | string;
	tokens: Token[];
	constructor(literal: StlNumber | boolean | string, tokens: Token[]) {
		this.literal = literal;
		this.tokens = tokens;
	}

	eval(scope: Scope): [Value, Scope] {
		return [new Box(this.literal), scope];
	}

	estree(): Node {
		switch (typeof this.literal) {
			case "boolean":
				return x`{stlValue: ${this.literal.toString()}}`;
			case "string":
				return x`{stlValue: "${this.literal.toString()}"}`;
			default: {
				return x`{
					stlValue: {
						top: ${`${this.literal.top.toString()}n`},
						bottom: ${`${this.literal.bottom.toString()}n`}
					}
				}`;
			}
		}
	}
}
