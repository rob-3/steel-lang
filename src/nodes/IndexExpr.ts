import { RuntimePanic } from "../Debug.js";
import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { Value } from "../Value.js";
import StlNumber from "../StlNumber.js";

export type IndexExpr = ExprBase & {
	type: "IndexExpr";
	arr: string;
	index: Expr;
};

export const IndexExpr = (
	arr: string,
	index: Expr,
	tokens: Token[] = []
): IndexExpr => {
	return {
		type: "IndexExpr",
		arr,
		index,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			const [boxedIndex, newScope] = this.index.eval(scope);
			const index = boxedIndex?.value;
			if (!(index instanceof StlNumber) || index.bottom > 1n) {
				throw RuntimePanic("Indexing expression must evaluate to a integer!");
			}
			const array = newScope.lookup(this.arr).value;
			if (!Array.isArray(array)) {
				throw RuntimePanic(`${this.arr} is not an array!`);
			}
			// FIXME lossy conversion
			const indexResult: Value | undefined = array[Number(index.top)];
			if (indexResult === undefined) {
				throw RuntimePanic(`Index is out of bounds!`);
			}
			return [indexResult, newScope];
		},
	};
};
