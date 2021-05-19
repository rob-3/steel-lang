import { Either } from "purify-ts";
import { RuntimePanic } from "./Debug";
import { Expr } from "./Expr";
import ReturnStmt from "./nodes/ReturnStmt";
import parse from "./Parser";
import Scope from "./Scope";
import { StlFunction } from "./StlFunction";
import tokenize from "./Tokenizer";
import { NonNullValue, Value } from "./Value";

export function execStmts(stmts: Expr[], scope: Scope): [Value, Scope] {
    let value: Value = null;
    for (const stmt of stmts) {
        const pair = exprEval(stmt, scope);
        if (stmt instanceof ReturnStmt) {
            return pair;
        } else {
            const [newValue, newScope] = pair;
            scope = newScope;
            value = newValue;
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
export function stlEval(
    src: string,
    scope: Scope,
    filename: string = "<anonymous>"
): Either<Error[], [Value, Scope]> {
    const ast = parse(tokenize(src, filename));
    return ast.map((goodAst: Expr[]) => {
        return goodAst.reduce<[Value, Scope]>(
            ([_, scope]: [Value, Scope], cur: Expr): [Value, Scope] => {
                const [newVal, newScope]: [Value, Scope] = exprEval(cur, scope);
                return [newVal, newScope];
            },
            [null, scope]
        );
    });
}

/*
 * Ast-based eval() for steel. Pass in any expression and get the evaluated result.
 */
export function exprEval(expr: Expr, scope: Scope): [Value, Scope] {
    return expr.eval(scope);
}

export function call(
    fn: StlFunction,
    args: Expr[],
    scope: Scope
): [any, Scope] {
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
