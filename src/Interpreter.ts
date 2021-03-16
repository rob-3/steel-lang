import {
    Expr,
    VariableExpr,
    BinaryExpr,
    PrimaryExpr,
    UnaryExpr,
    GroupingExpr,
    CallExpr,
    FunctionExpr,
    UnderscoreExpr,
    VariableDeclarationStmt,
    PrintStmt,
    VariableAssignmentStmt,
    IfStmt,
    BlockStmt,
    WhileStmt,
    UntilStmt,
    ReturnStmt,
    MatchStmt,
    FunctionDefinition,
    IndexExpr,
    ArrayLiteral,
} from "./Expr";
import TokenType from "./TokenType";
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

function execStmts(stmts: Expr[], scope: Scope): Scoped<Value> {
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
    if (expr instanceof PrimaryExpr) {
        return [expr.literal, scope];
    } else if (expr instanceof ArrayLiteral) {
        const resolved: Value[] = [];
        const newScope = expr.exprs.reduce((acc: Scope, cur: Expr) => {
            const [val, scope]: [Value, Scope] = exprEval(cur, acc);
            resolved.push(val);
            return scope;
        }, scope);
        return [resolved, newScope];
    } else if (expr instanceof BinaryExpr) {
        // TODO: refactor in functional style
        const [leftVal, newScope] = exprEval(expr.left, scope);
        const [rightVal, newScope2] = exprEval(expr.right, newScope);
        switch (expr.operator.type) {
            case TokenType.PLUS:
                return [plus(leftVal, rightVal), newScope2];
            case TokenType.MINUS:
                return [minus(leftVal, rightVal), newScope2];
            case TokenType.PLUS_PLUS:
                return [plusPlus(leftVal, rightVal), newScope2];
            case TokenType.STAR:
                return [star(leftVal, rightVal), newScope2];
            case TokenType.SLASH:
                return [slash(leftVal, rightVal), newScope2];
            case TokenType.MOD:
                return [mod(leftVal, rightVal), newScope2];
            case TokenType.AND:
                return [and(leftVal, rightVal), newScope2];
            case TokenType.OR:
                return [or(leftVal, rightVal), newScope2];
            case TokenType.GREATER_EQUAL:
                return [greaterEqual(leftVal, rightVal), newScope2];
            case TokenType.GREATER:
                return [greater(leftVal, rightVal), newScope2];
            case TokenType.LESS_EQUAL:
                return [lessEqual(leftVal, rightVal), newScope2];
            case TokenType.LESS:
                return [less(leftVal, rightVal), newScope2];
            case TokenType.EQUAL_EQUAL:
                return [equal(leftVal, rightVal), newScope2];
            default:
                throw RuntimePanic(
                    `FIXME: Unhandled operator type "${expr.operator}"`
                );
        }
    } else if (expr instanceof UnaryExpr) {
        const [value, newScope] = exprEval(expr.right, scope);
        switch (expr.operator.type) {
            case TokenType.MINUS:
                return [opposite(value), newScope];
            case TokenType.NOT:
                return [not(value), newScope];
        }
    } else if (expr instanceof GroupingExpr) {
        return exprEval(expr.expr, scope);
    } else if (expr instanceof VariableExpr) {
        return [scope.lookup(expr.identifier), scope];
    } else if (expr instanceof CallExpr) {
        const [maybeFn, newScope] = exprEval(expr.callee, scope);
        if (maybeFn instanceof StlFunction) {
            return call(maybeFn, expr.args, newScope);
        } else {
            throw RuntimePanic(
                `Can't call ${maybeFn} because it is not a function.`
            );
        }
    } else if (expr instanceof FunctionExpr) {
        return [new StlFunction(expr, scope), scope];
    } else if (expr instanceof PrintStmt) {
        const [printValue, newScope] = exprEval(expr.thingToPrint, scope);
        return printfn(printValue, newScope);
    } else if (expr instanceof VariableDeclarationStmt) {
        const [rightVal, newScope] = exprEval(expr.right, scope);
        return newScope.define(expr.identifier, rightVal, expr.immutable);
    } else if (expr instanceof VariableAssignmentStmt) {
        const [rightVal, newScope] = exprEval(expr.right, scope);
        return newScope.assign(expr.identifier, rightVal);
    } else if (expr instanceof IfStmt) {
        const [shouldBeBool, newScope] = exprEval(expr.condition, scope);
        if (!assertBool(shouldBeBool)) {
            throw RuntimePanic("Condition doesn't evaluate to a boolean.");
        }
        if (shouldBeBool) {
            return exprEval(expr.body, newScope);
        } else if (expr.elseBody !== null) {
            return exprEval(expr.elseBody, newScope);
        } else {
            // FIXME: hack we need to address
            return [null, newScope];
        }
    } else if (expr instanceof BlockStmt) {
        return execStmts(expr.exprs, scope);
    } else if (expr instanceof WhileStmt || expr instanceof UntilStmt) {
        let conditionValue = getVal(exprEval(expr.condition, scope));
        if (expr instanceof UntilStmt) {
            conditionValue = !conditionValue;
        }
        let value: Value = null;
        while (assertBool(conditionValue) && conditionValue) {
            const pair = exprEval(expr.body, scope);
            scope = getState(pair);
            value = getVal(pair);
            conditionValue = getVal(exprEval(expr.condition, scope));
            if (expr instanceof UntilStmt) {
                conditionValue = !conditionValue;
            }
        }
        return [value, scope];
    } else if (expr instanceof ReturnStmt) {
        return exprEval(expr.value, scope);
    } else if (expr instanceof MatchStmt) {
        const rootExpr = expr.expr;
        let [matchExprValue, newScope] = exprEval(rootExpr, scope);
        for (const matchCase of expr.cases) {
            if (matchCase.matchExpr instanceof UnderscoreExpr) {
                return exprEval(matchCase.expr, newScope);
            }
            // FIXME decide if side effects are legal in a match expression
            const arr = exprEval(matchCase.matchExpr, newScope);
            const caseValue = getVal(arr);
            newScope = getState(arr);
            if (equal(caseValue, matchExprValue)) {
                return exprEval(matchCase.expr, newScope);
            }
        }
        throw RuntimePanic("Pattern match failed.");
    } else if (expr instanceof FunctionDefinition) {
        return exprEval(expr.definition, scope);
    } else if (expr instanceof IndexExpr) {
        const [index, newScope] = exprEval(expr.index, scope);
        if (typeof index !== "number") {
            // FIXME we probably should throw every RuntimePanic since
            // TypeScript isn't smart enough to know we throw
            throw RuntimePanic(
                "Indexing expression must evaluate to a number!"
            );
        }
        const array = newScope.lookup(expr.arr);
        if (!Array.isArray(array)) {
            throw RuntimePanic(`${expr.arr} is not an array!`);
        }
        return [array[index], newScope];
    }
    throw RuntimePanic("Unhandled stmt or expr.");
}

function call(fn: StlFunction, args: Expr[], scope: Scope): Scoped<any> {
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
function opposite(right: Value): number {
    if (assertNumber(right)) return -(<number>right);
    else throw RuntimePanic('"-" can only be used on a number');
}

function plus(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left + <number>right;
    } else throw RuntimePanic('Operands of "+" must be numbers.');
}

function minus(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left - <number>right;
    } else throw RuntimePanic('Operands of "-" must be numbers.');
}

function plusPlus(left: Value, right: Value): string {
    if (typeof left === "string" && typeof right === "string") {
        return left.concat(right);
    } else throw RuntimePanic('Operands of "++" must be strings.');
}

function star(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left * <number>right;
    } else throw RuntimePanic('Operands of "*" must be numbers.');
}

function slash(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left / <number>right;
    } else throw RuntimePanic('Operands of "/" must be numbers.');
}

function and(left: Value, right: Value): boolean {
    if (assertBool(left, right)) {
        return <boolean>left && <boolean>right;
    } else throw RuntimePanic('Operands of "and" must be booleans.');
}

function or(left: Value, right: Value): boolean {
    if (assertBool(left, right)) {
        return <boolean>left || <boolean>right;
    } else {
        throw RuntimePanic('Operands of "or" must be booleans.');
    }
}

function assertNumber(...literals: any[]): boolean {
    for (const literal of literals) {
        if (typeof literal !== "number") return false;
    }
    return true;
}

function assertBool(...literals: any[]): boolean {
    for (const literal of literals) {
        if (typeof literal !== "boolean") return false;
    }
    return true;
}

function not(right: Value): boolean {
    if (assertBool(right)) return !right;
    else throw RuntimePanic('Operands of "not" should be booleans.');
}

function greaterEqual(left: Value, right: Value): boolean {
    return numberComparision(left, right, (l, r) => l >= r, ">=");
}

function greater(left: Value, right: Value): boolean {
    return numberComparision(left, right, (l, r) => l > r, ">");
}

function lessEqual(left: Value, right: Value): boolean {
    return numberComparision(left, right, (l, r) => l <= r, "<=");
}

function less(left: Value, right: Value): boolean {
    return numberComparision(left, right, (l, r) => l < r, "<");
}

function equal(left: Value, right: Value): boolean {
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

function mod(left: Value, right: Value): number {
    if (typeof left === "number" && typeof right === "number") {
        return left % right;
    } else throw RuntimePanic(`Operands of % should be numbers.`);
}
