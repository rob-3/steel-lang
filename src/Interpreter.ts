import { Expr, ReturnStmt } from "./Expr";
import Scope from "./Scope";
import tokenize from "./Tokenizer";
import parse from "./Parser";
export type Scoped<T> = [T, Scope];
export const getVal = (arr: [Value, Scope]) => arr[0];
export const getState = (arr: [Value, Scope]) => arr[1];
import { StlFunction, Value, NonNullValue } from "./InterpreterHelpers";
import { RuntimePanic } from "./Debug";

export let printfn = (thing: Value, scope: Scope): [Value, Scope] => {
    const text = String(thing);
    console.log(text);
    return [String(thing), scope];
};

export function setPrintFn(fn: (v: Value) => void): void {
    printfn = (val: Value, scope: Scope) => {
        fn(val);
        return [val, scope];
    };
}

export function execStmts(stmts: Expr[], scope: Scope): Scoped<Value> {
    let value: Value = null;
    for (const stmt of stmts) {
        const pair = exprEval(stmt, scope);
        if (stmt instanceof ReturnStmt) {
            return pair;
        } else {
            scope = getState(pair);
            value = getVal(pair);
        }
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
export function stlEval(src: string, scope: Scope): Scoped<Value> {
    const ast = parse(tokenize(src));
    let currentScope: Scope = scope;
    let currentValue: Value = null;
    for (const expr of ast) {
        const [value, newScope] = exprEval(expr, currentScope);
        currentScope = newScope;
        currentValue = value;
    }
    return [currentValue, currentScope];
}

/*
 * Ast-based eval() for steel. Pass in any expression and get the evaluated result.
 */
export function exprEval(expr: Expr, scope: Scope): Scoped<Value> {
    return expr.eval(scope);
}

export function call(fn: StlFunction, args: Expr[], scope: Scope): Scoped<any> {
    const argValues: Value[] = [];
    for (const arg of args) {
        const [value, newScope] = exprEval(arg, scope);
        scope = newScope;
        argValues.push(value);
    }
    const value = fn.call(argValues);
    return [value, scope];
}

/*
 * Returns the opposite of the expression. Throws if expr does not evaluate to a
 * number.
 */
export function opposite(right: Value): number {
    if (assertNumber(right)) return -(<number>right);
    else throw RuntimePanic('"-" can only be used on a number');
}

export function plus(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left + <number>right;
    } else throw RuntimePanic('Operands of "+" must be numbers.');
}

export function minus(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left - <number>right;
    } else throw RuntimePanic('Operands of "-" must be numbers.');
}

export function plusPlus(left: Value, right: Value): string {
    if (typeof left === "string" && typeof right === "string") {
        return left.concat(right);
    } else throw RuntimePanic('Operands of "++" must be strings.');
}

export function star(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left * <number>right;
    } else throw RuntimePanic('Operands of "*" must be numbers.');
}

export function slash(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left / <number>right;
    } else throw RuntimePanic('Operands of "/" must be numbers.');
}

export function and(left: Value, right: Value): boolean {
    if (assertBool(left, right)) {
        return <boolean>left && <boolean>right;
    } else throw RuntimePanic('Operands of "and" must be booleans.');
}

export function or(left: Value, right: Value): boolean {
    if (assertBool(left, right)) {
        return <boolean>left || <boolean>right;
    } else {
        throw RuntimePanic('Operands of "or" must be booleans.');
    }
}

export function assertNumber(...literals: any[]): boolean {
    for (const literal of literals) {
        if (typeof literal !== "number") return false;
    }
    return true;
}

export function assertBool(...literals: any[]): boolean {
    for (const literal of literals) {
        if (typeof literal !== "boolean") return false;
    }
    return true;
}

export function not(right: Value): boolean {
    if (assertBool(right)) return !right;
    else throw RuntimePanic('Operands of "not" should be booleans.');
}

export function greaterEqual(left: Value, right: Value): boolean {
    return numberComparision(left, right, (l, r) => l >= r, ">=");
}

export function greater(left: Value, right: Value): boolean {
    return numberComparision(left, right, (l, r) => l > r, ">");
}

export function lessEqual(left: Value, right: Value): boolean {
    return numberComparision(left, right, (l, r) => l <= r, "<=");
}

export function less(left: Value, right: Value): boolean {
    return numberComparision(left, right, (l, r) => l < r, "<");
}

export function equal(left: Value, right: Value): boolean {
    return left === right;
}

function numberComparision(
    left: Value,
    right: Value,
    operator: (left: NonNullValue, right: NonNullValue) => boolean,
    err: string
): boolean {
    if (assertNumber(left, right) && left !== null && right !== null) {
        return operator(left, right);
    } else throw RuntimePanic(`Operands of ${err} should be numbers.`);
}

export function mod(left: Value, right: Value): number {
    if (typeof left === "number" && typeof right === "number") {
        return left % right;
    } else throw RuntimePanic(`Operands of % should be numbers.`);
}
