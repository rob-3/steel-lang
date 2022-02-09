import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import VariableExpr from "./VariableExpr";
import DotAccess from "./DotAccess";
import StlObject from "../StlObject";
import { RuntimePanic } from "../Debug";
import { Value, UnboxedValue } from "../Value";
import IndexExpr from "./IndexExpr";
import StlNumber from "../StlNumber";

export type AssignmentLeft = VariableExpr | DotAccess | IndexExpr;

export function isAssignmentLeft(expr: Expr): expr is AssignmentLeft {
	return (
		expr instanceof VariableExpr ||
		expr instanceof DotAccess ||
		expr instanceof IndexExpr
	);
}

export default class VariableAssignmentStmt implements Expr {
	left: AssignmentLeft;
	right: Expr;
	tokens: Token[];
	constructor(left: AssignmentLeft, right: Expr, tokens: Token[]) {
		this.left = left;
		this.right = right;
		this.tokens = tokens;
	}

	eval(scope: Scope): [Value, Scope] {
		const [rightVal, newScope] = this.right.eval(scope);
		if (rightVal === null) {
			throw RuntimePanic("Right side of assignment cannot be nothing!");
		}
		if (this.left instanceof VariableExpr) {
			return newScope.assign(this.left.identifier, rightVal);
		} else if (this.left instanceof DotAccess) {
			const dotAccess: DotAccess = this.left;
			if (!(dotAccess.left instanceof VariableExpr)) {
				throw RuntimePanic("Invalid left hand side of assignment!");
			}
			const [boxedObject, newNewScope] = dotAccess.left.eval(newScope);
			const object = boxedObject.value;
			if (!(object instanceof StlObject)) {
				throw RuntimePanic(`${object} is not an object!`);
			} else {
				const value: Value | undefined = object.properties.get(dotAccess.right);
				if (value === undefined) {
					throw RuntimePanic(`Property "${dotAccess.right}" does not exist.`);
				} else {
					const isImmutable = newNewScope.getPair(
						dotAccess.left.identifier
					)?.[1];
					// should be impossible
					if (isImmutable === undefined) {
						throw RuntimePanic("Interpreter bug: isImmutable is undefined!");
					}
					if (isImmutable) {
						throw RuntimePanic(
							"Cannot assign to property of immutable object!"
						);
					} else {
						object.properties.set(dotAccess.right, rightVal);
						return [rightVal, newNewScope];
					}
				}
			}
		} else if (this.left instanceof IndexExpr) {
			const array: UnboxedValue = scope.lookup(this.left.arr).value;
			if (!Array.isArray(array)) {
				throw RuntimePanic(`${this.left.arr} is not an array!`);
			}
			if (this.left.arr.slice(0, 1) !== "~") {
				throw RuntimePanic(
					`Cannot assign to index of immutable array "${this.left.arr}"`
				);
			}
			const [boxedIndex, newScope] = this.left.index.eval(scope);
			if (boxedIndex === null) {
				throw RuntimePanic(`Index cannot evaluate to null`);
			}
			const index: UnboxedValue = boxedIndex.value;
			if (!(index instanceof StlNumber)) {
				throw RuntimePanic(`${index} is not a number!`);
			}
			if (index.bottom !== 1n) {
				throw RuntimePanic(`Index must be an integer!`);
			}
			const [rightVal, newNewScope] = this.right.eval(newScope);
			if (rightVal === null) {
				throw RuntimePanic(`Right side of assignment cannot be null`);
			}
			array[Number(index.top)] = rightVal;
			return [rightVal, newNewScope];
		} else {
			// TODO
			throw RuntimePanic("Unsupported left side of expression");
		}
	}
}
