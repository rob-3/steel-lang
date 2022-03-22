import { Either } from "purify-ts";
import { RuntimePanic } from "./Debug.js";
import { Expr } from "./Expr.js";
import parse from "./Parser.js";
import Scope from "./Scope.js";
import { StlFunction } from "./StlFunction.js";
import tokenize from "./Tokenizer.js";
import { Value, Box } from "./Value.js";
import StlNumber from "./StlNumber.js";
import StlObject from "./StlObject.js";

export function execStmts(stmts: Expr[], scope: Scope): [Value, Scope] {
	let value: Value | null = null;
	for (const stmt of stmts) {
		const [newValue, newScope] = exprEval(stmt, scope);
		if (stmt.type === "ReturnStmt") {
			if (newValue === null) {
				throw RuntimePanic("Return value cannot be nothing");
			}
			return [newValue, newScope];
		} else {
			scope = newScope;
			value = newValue;
		}
	}
	if (value === null) {
		throw RuntimePanic("Unexpected null");
	}
	return [value, scope];
}

/**
 * Evaluates some given source code in the context of the given Scope.
 *
 * @param src string to eval
 * @param scope Scope to evaluate src in
 * @return pair of resultant Value and Scope
 */
export function stlEval(
	src: string,
	scope: Scope,
	filename: string = "<anonymous>"
): Either<Error[], [Value | null, Scope]> {
	const ast = tokenize(src, filename).chain(parse);
	return ast.map((goodAst: Expr[]) => {
		let value: Value | null = null;
		let curScope = scope;
		for (const stmt of goodAst) {
			const [newVal, newScope] = stmt.eval(curScope);
			value = newVal;
			curScope = newScope;
		}
		const pair: [Value | null, Scope] = [value, curScope];
		return pair;
	});
}

/*
 * Ast-based eval() for steel. Pass in any expression and get the evaluated result.
 */
export function exprEval(expr: Expr, scope: Scope): [Value | null, Scope] {
	return expr.eval(scope);
}

export function call(
	fn: StlFunction,
	args: Expr[],
	scope: Scope
): [any, Scope] {
	const argValues: Value[] = [];
	for (const arg of args) {
		const [value, newScope]: [Value | null, Scope] = exprEval(arg, scope);
		scope = newScope;
		if (value === null) {
			throw RuntimePanic("Argument cannot evaluate to nothing!");
		}
		argValues.push(value);
	}
	const value = fn.call(argValues);
	return [value, scope];
}

/*
 * Returns the opposite of the expression. Throws if expr does not evaluate to a
 * number.
 */
export function opposite(right: Value): Box<StlNumber> {
	if (right.value instanceof StlNumber) return new Box(right.value.opposite());
	else throw RuntimePanic('"-" can only be used on a number');
}

export function plus(left: Value, right: Value): Box<StlNumber> {
	if (left.value instanceof StlNumber && right.value instanceof StlNumber) {
		return new Box(left.value.add(right.value));
	} else throw RuntimePanic('Operands of "+" must be numbers.');
}

export function minus(left: Value, right: Value): Box<StlNumber> {
	if (left.value instanceof StlNumber && right.value instanceof StlNumber) {
		return new Box(left.value.subtract(right.value));
	} else throw RuntimePanic('Operands of "-" must be numbers.');
}

export function plusPlus(left: Value, right: Value): Box<string> {
	if (typeof left.value === "string" && typeof right.value === "string") {
		return new Box(left.value.concat(right.value));
	} else throw RuntimePanic('Operands of "++" must be strings.');
}

export function star(left: Value, right: Value): Box<StlNumber> {
	if (left.value instanceof StlNumber && right.value instanceof StlNumber) {
		return new Box(left.value.multiply(right.value));
	} else throw RuntimePanic('Operands of "*" must be numbers.');
}

export function slash(left: Value, right: Value): Box<StlNumber> {
	if (left.value instanceof StlNumber && right.value instanceof StlNumber) {
		return new Box(left.value.divide(right.value));
	} else throw RuntimePanic('Operands of "/" must be numbers.');
}

export function and(left: Value, right: Value): Box<boolean> {
	if (typeof left.value === "boolean" && typeof right.value === "boolean") {
		return new Box(left.value && right.value);
	} else throw RuntimePanic('Operands of "and" must be booleans.');
}

export function or(left: Value, right: Value): Box<boolean> {
	if (typeof left.value === "boolean" && typeof right.value === "boolean") {
		return new Box(left.value || right.value);
	} else {
		throw RuntimePanic('Operands of "or" must be booleans.');
	}
}

export function not(right: Value): Box<boolean> {
	if (typeof right.value === "boolean") return new Box(!right.value);
	else throw RuntimePanic('Operands of "not" should be booleans.');
}

export function greaterEqual(left: Value, right: Value): Box<boolean> {
	if (left.value instanceof StlNumber && right.value instanceof StlNumber)
		return new Box(left.value.greaterEqual(right.value));
	else throw RuntimePanic(`Operands of >= should be numbers.`);
}

export function greater(left: Value, right: Value): Box<boolean> {
	if (left.value instanceof StlNumber && right.value instanceof StlNumber)
		return new Box(left.value.greater(right.value));
	else throw RuntimePanic(`Operands of > should be numbers.`);
}

export function lessEqual(left: Value, right: Value): Box<boolean> {
	if (left.value instanceof StlNumber && right.value instanceof StlNumber)
		return new Box(left.value.lessEqual(right.value));
	else throw RuntimePanic(`Operands of <= should be numbers.`);
}

export function less(left: Value, right: Value): Box<boolean> {
	if (left.value instanceof StlNumber && right.value instanceof StlNumber)
		return new Box(left.value.less(right.value));
	else throw RuntimePanic(`Operands of < should be numbers.`);
}

export function equal(left: Value, right: Value): Box<boolean> {
	const unboxedLeft = left.value;
	const unboxedRight = right.value;
	if (typeof unboxedLeft !== typeof unboxedRight) {
		return new Box(false);
	} else if (
		(typeof unboxedLeft === "boolean" || typeof unboxedLeft === "string") &&
		(typeof unboxedRight === "boolean" || typeof unboxedRight === "string")
	) {
		return new Box(unboxedLeft === unboxedRight);
	} else if (
		unboxedLeft instanceof StlNumber &&
		unboxedRight instanceof StlNumber
	) {
		return new Box(unboxedLeft.equals(unboxedRight));
	} else if (
		unboxedLeft instanceof StlFunction ||
		unboxedRight instanceof StlFunction
	) {
		// FIXME this should be a typeerror
		return new Box(false);
	} else if (
		unboxedLeft instanceof StlObject &&
		unboxedRight instanceof StlObject
	) {
		const leftMap = unboxedLeft.properties;
		const rightMap = unboxedRight.properties;
		if (leftMap.size !== rightMap.size) {
			return new Box(false);
		} else {
			for (const [key, value] of leftMap) {
				const rightVal = rightMap.get(key);
				if (
					(rightVal !== undefined && !equal(rightVal, value)) ||
					!rightMap.has(key)
				) {
					return new Box(false);
				}
			}
			return new Box(true);
		}
	} else if (Array.isArray(unboxedLeft) && Array.isArray(unboxedRight)) {
		if (unboxedLeft.length !== unboxedRight.length) {
			return new Box(false);
		} else {
			for (let i = 0; i < unboxedRight.length; i++) {
				if (!equal(unboxedLeft[i], unboxedRight[i])) {
					return new Box(false);
				}
			}
			return new Box(true);
		}
	} else {
		return new Box(false);
	}
}

export function mod(left: Value, right: Value): Box<StlNumber> {
	if (left.value instanceof StlNumber && right.value instanceof StlNumber) {
		return new Box(left.value.mod(right.value));
	} else throw RuntimePanic(`Operands of % should be numbers.`);
}
