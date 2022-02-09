import { RuntimePanic } from "../Debug";
import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import { Value } from "../Value";
import StlNumber from "../StlNumber";

export default class IndexExpr implements Expr {
	arr: string;
	index: Expr;
	tokens: Token[];

	constructor(arr: string, index: Expr, tokens: Token[]) {
		this.arr = arr;
		this.index = index;
		this.tokens = tokens;
	}

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
	}
}
