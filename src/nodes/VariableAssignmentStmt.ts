import { Expr, ExprBase } from "../Expr.js";
import Scope from "../Scope.js";
import Token from "../Token.js";
import { VariableExpr } from "./VariableExpr.js";
import { DotAccess } from "./DotAccess.js";
import StlObject from "../StlObject.js";
import { RuntimePanic } from "../Debug.js";
import { Value, UnboxedValue } from "../Value.js";
import { IndexExpr } from "./IndexExpr.js";
import StlNumber from "../StlNumber.js";
import { x } from "code-red";

export type AssignmentLeft = VariableExpr | DotAccess | IndexExpr;

export function isAssignmentLeft(expr: Expr): expr is AssignmentLeft {
	return (
		expr.type === "VariableExpr" ||
		expr.type === "DotAccess" ||
		expr.type === "IndexExpr"
	);
}

export type VariableAssignmentStmt = ExprBase & {
	type: "VariableAssignmentStmt";
	left: AssignmentLeft;
	right: Expr;
};

export const VariableAssignmentStmt = (
	left: AssignmentLeft,
	right: Expr,
	tokens: Token[] = []
): VariableAssignmentStmt => {
	return {
		type: "VariableAssignmentStmt",
		left,
		right,
		tokens,
		eval(scope: Scope): [Value, Scope] {
			const [rightVal, newScope] = this.right.eval(scope);
			if (rightVal === null) {
				throw RuntimePanic("Right side of assignment cannot be nothing!");
			}
			if (this.left.type === "VariableExpr") {
				return newScope.assign(this.left.identifier, rightVal);
			} else if (this.left.type === "DotAccess") {
				const dotAccess: DotAccess = this.left;
				if (dotAccess.left.type !== "VariableExpr") {
					throw RuntimePanic("Invalid left hand side of assignment!");
				}
				const [boxedObject, newNewScope] = dotAccess.left.eval(newScope);
				// FIXME
				const object = boxedObject!.value;
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
			} else if (this.left.type === "IndexExpr") {
				const pair = scope.getPair(this.left.arr);
				if (!pair) {
					throw RuntimePanic(`Array "${this.left.arr}" does not exist.`);
				}
				const [{ value: array }, isImmutable] = pair;
				if (!Array.isArray(array)) {
					throw RuntimePanic(`${this.left.arr} is not an array!`);
				}
				if (isImmutable) {
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
		estree() {
			return {
				node: x`${this.left.estree().node} = ${this.right.estree().node}`
			};
		},
	};
};
