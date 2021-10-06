import { Either } from "purify-ts";
import { RuntimePanic } from "./Debug";
import { Expr } from "./Expr";
import ReturnStmt from "./nodes/ReturnStmt";
import parse from "./Parser";
import Scope from "./Scope";
import { StlFunction } from "./StlFunction";
import tokenize from "./Tokenizer";
import { Value, Box } from "./Value";
import StlNumber from "./StlNumber";

export function execStmts(stmts: Expr[], scope: Scope): [Value, Scope] {
    let value: Value | null = null;
    for (const stmt of stmts) {
        const [newValue, newScope] = exprEval(stmt, scope);
        if (stmt instanceof ReturnStmt) {
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
    if (right.value instanceof StlNumber)
        return new Box(right.value.opposite());
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
    if (assertBool(left.value, right.value)) {
        return new Box(<boolean>left.value && <boolean>right.value);
    } else throw RuntimePanic('Operands of "and" must be booleans.');
}

export function or(left: Value, right: Value): Box<boolean> {
    if (assertBool(left.value, right.value)) {
        return new Box(<boolean>left.value || <boolean>right.value);
    } else {
        throw RuntimePanic('Operands of "or" must be booleans.');
    }
}

export function assertBool(...literals: any[]): boolean {
    for (const literal of literals) {
        if (typeof literal !== "boolean") return false;
    }
    return true;
}

export function not(right: Value): Box<boolean> {
    if (assertBool(right.value)) return new Box(!right.value);
    else throw RuntimePanic('Operands of "not" should be booleans.');
}

export function greaterEqual(left: Value, right: Value): Box<boolean> {
    return numberComparision(left, right, (l, r) => l >= r, ">=");
}

export function greater(left: Value, right: Value): Box<boolean> {
    return numberComparision(left, right, (l, r) => l > r, ">");
}

export function lessEqual(left: Value, right: Value): Box<boolean> {
    return numberComparision(left, right, (l, r) => l <= r, "<=");
}

export function less(left: Value, right: Value): Box<boolean> {
    return numberComparision(left, right, (l, r) => l < r, "<");
}

export function equal(left: Value, right: Value): Box<boolean> {
    return new Box(left.value === right.value);
}

function numberComparision(
    left: Value,
    right: Value,
    operator: (left: number, right: number) => boolean,
    err: string
): Box<boolean> {
    const unboxedLeft = left.value;
    const unboxedRight = right.value;
    if (
        typeof unboxedLeft === "number" &&
        typeof unboxedRight === "number" &&
        unboxedLeft !== null &&
        unboxedRight !== null
    ) {
        return new Box(operator(unboxedLeft, unboxedRight));
    } else throw RuntimePanic(`Operands of ${err} should be numbers.`);
}

export function mod(left: Value, right: Value): Box<StlNumber> {
    if (left.value instanceof StlNumber && right.value instanceof StlNumber) {
        return new Box(left.value.mod(right.value));
    } else throw RuntimePanic(`Operands of % should be numbers.`);
}
