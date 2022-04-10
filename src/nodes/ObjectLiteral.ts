import { Expr, ExprBase } from "../Expr.js";
import Token from "../Token.js";
import Scope from "../Scope.js";
import { Value, Box } from "../Value.js";
import StlObject from "../StlObject.js";
import { RuntimePanic } from "../Debug.js";
import { Node, x } from "code-red";

export type ObjectLiteral = ExprBase & {
	type: "ObjectLiteral";
	properties: Map<string, Expr>;
	estree(): Node;
};

export const ObjectLiteral = (
	properties: Map<string, Expr>,
	tokens: Token[] = []
): ObjectLiteral => {
	return {
		type: "ObjectLiteral",
		properties,
		tokens,
		eval(scope: Scope): [Box<StlObject>, Scope] {
			const map = new Map<string, Value>();
			let currentScope = scope;
			for (const [key, value] of this.properties.entries()) {
				const [result, newScope]: [Value | null, Scope] =
					value.eval(currentScope);
				currentScope = newScope;
				if (result === null) {
					throw RuntimePanic("Object value cannot be nothing!");
				}
				map.set(key, result);
			}
			return [new Box(new StlObject(map)), currentScope];
		},
		estree() {
			const pairs = Array.from(this.properties.entries());
			if (pairs.length === 0) {
				return x`{stlValue: {}}`;
			}
			const colonsAndCommas = Array(pairs.length).fill([":", ","]).flat();
			colonsAndCommas.pop();
			const strings = ["{stlValue: {", ...colonsAndCommas, "}}"];
			return x(
				strings as unknown as TemplateStringsArray,
				...pairs.flatMap(([key, value]) => [key, value.estree()])
			);
		},
	};
};
