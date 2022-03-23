import { RuntimePanic } from "../Debug.js";
import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";
import StlObject from "../StlObject.js";

export type DotAccess = ExprBase & {
	type: "DotAccess";
	left: Expr;
	right: string;
};

export const DotAccess = (
	left: Expr,
	right: string,
	tokens: Token[] = []
): DotAccess => {
	return {
		type: "DotAccess",
		left,
		right,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			const [boxedObject, newScope]: [Value | null, Scope] =
				this.left.eval(scope);
			const object = boxedObject?.value;
			if (object === null) {
				throw RuntimePanic(
					"Left side of dot operator cannot evaluate to nothing!"
				);
			}
			if (!(object instanceof StlObject)) {
				throw RuntimePanic(`${this.left} is not an object!`);
			} else {
				const value: Value | undefined = object.properties.get(this.right);
				if (value === undefined) {
					throw RuntimePanic(`Property "${this.right}" does not exist!`);
				}
				return [value, newScope];
			}
		},
	};
};
