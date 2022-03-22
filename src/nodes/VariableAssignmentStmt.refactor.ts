import { Expr } from "../Expr.refactor.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import VariableExpr from "./VariableExpr.js";
import DotAccess from "./DotAccess.js";
import StlObject from "../StlObject.js";
import { RuntimePanic } from "../Debug.js";
import { Value, UnboxedValue } from "../Value.js";
import IndexExpr from "./IndexExpr.js";
import StlNumber from "../StlNumber.js";

export type AssignmentLeft = VariableExpr | DotAccess | IndexExpr;

export function isAssignmentLeft(expr: Expr): expr is AssignmentLeft {
	return (
		expr instanceof VariableExpr ||
		expr instanceof DotAccess ||
		expr instanceof IndexExpr
	);
}

export type VariableAssignmentStmt = Expr & {
	left: AssignmentLeft;
	right: Expr;
};

export const VariableAssignmentStmt = (
	left: AssignmentLeft,
	right: Expr,
	tokens: Token[]
): VariableAssignmentStmt => {
	return {
		left,
		right,
		tokens,
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
					const value: Value | undefined = object.properties.get(
						dotAccess.right
					);
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
		},
	};
};