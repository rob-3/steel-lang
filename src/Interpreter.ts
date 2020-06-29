import { 
    Expr, VariableExpr, BinaryExpr, 
    PrimaryExpr, UnaryExpr, GroupingExpr,
    CallExpr, FunctionExpr, UnderscoreExpr,

    VariableDeclarationStmt, PrintStmt, 
    VariableAssignmentStmt, IfStmt, BlockStmt,
    WhileStmt, ReturnStmt, MatchStmt,
    FunctionDefinition,

    MatchCase
} from "./Expr";
import TokenType from "./TokenType";
import Scope from "./Scope";
import tokenize from "./Tokenizer";
import parse from "./Parser";
export type Scoped<T> = [T, Scope];
export const getVal = (arr: [Value, Scope]) => arr[0];
export const getState = (arr: [Value, Scope]) => arr[1];
import { CfxFunction, Value } from "./InterpreterHelpers";

let printfn = (thing: Value, scope: Scope): [Value, Scope] => {
    let text = String(thing)
    console.log(text)
    return [String(thing), scope];
};

export function setPrintFn(fn): void {
    printfn = (val: Value, scope: Scope) => {
        fn(val);
        return [val, scope];
    }
}

export function cfxExec(src: string): Scoped<Value> {
    let stmts: Expr[] = parse(tokenize(src));
    return execStmts(stmts, new Scope());
}

function execStmts(stmts: Expr[], scope: Scope): Scoped<Value> {
    let value;
    for (let stmt of stmts) {
        let pair = exprEval(stmt, scope);
        if (stmt instanceof ReturnStmt) {
            return pair;
        } else {
            scope = getState(pair);
            value = getVal(pair);
        }
    }
    return [value, scope];
}

function lookup(identifier: string, scope: Scope): Value {
    let val = scope.get(identifier);
    if (val === null) {
        throw Error(`Variable "${identifier}" is not defined.`);
    } else {
        return val;
    }
}

function define(key: string, evaluatedExpr: Value, immutable: boolean, scope: Scope):
    Scoped<Value> {
    if (!scope.has(key) || !scope.get(key)[1]) {
        scope.setLocal(key, [evaluatedExpr, immutable]);
        return [evaluatedExpr, scope];
    } else {
        throw Error(`Cannot redefine immutable variable "${key}".`);
    }
}

function assign(key: string, evaluatedExpr: Value, scope: Scope): Scoped<Value> {
    let variable = scope.get(key);
    if (variable === null) {
        throw Error(`Cannot assign to undefined variable "${key}".`);
    } else {
        let immutable = variable[1];
        if (!immutable) {
            scope.assign(key, [evaluatedExpr, false]);
            return [evaluatedExpr, scope];
        } else {
            throw Error(`Cannot assign to immutable variable "${key}".`);
        }
    }
}

/*
 * String-based eval() for conflux.
 */
export function cfxEval(src: string, scope: Scope): Value {
    let ast = parse(tokenize(src));
    return getVal(
        ast.reduce<[Value, Scope]>(
            (acc, cur) => exprEval(cur, getState(acc)),
        [null, scope])
    );
}

/*
 * Ast-based eval() for conflux. Pass in any expression and get the evalutated result.
 */
export function exprEval(expr: Expr, scope: Scope): Scoped<Value> {
    if (expr instanceof PrimaryExpr) {
        return [expr.literal, scope];
    } else if (expr instanceof BinaryExpr) {
        // TODO: refactor in functional style
        let [leftVal, newScope] = exprEval(expr.left, scope);
        let [rightVal, newScope2] = exprEval(expr.right, newScope);
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
                throw Error(`FIXME: Unhandled operator type "${expr.operator}"`);
        }
    } else if (expr instanceof UnaryExpr) {
        let [value, newScope] = exprEval(expr.right, scope);
        switch (expr.operator.type) {
            case TokenType.MINUS:
                return [opposite(value), newScope];
            case TokenType.NOT: 
                return [not(value), newScope];
        }
    } else if (expr instanceof GroupingExpr) {
        return exprEval(expr.expr, scope);
    } else if (expr instanceof VariableExpr) {
        return [lookup(expr.identifier, scope), scope];
    } else if (expr instanceof CallExpr) {
        let [maybeFn, newScope] = exprEval(expr.callee, scope);
        if (maybeFn instanceof CfxFunction) {
            return call(maybeFn, expr.args, newScope);
        } else {
            throw Error(`Can't call ${maybeFn} because it is not a function.`);
        }
    } else if (expr instanceof FunctionExpr) {
        return [new CfxFunction(expr), scope];
    } else if (expr instanceof PrintStmt) {
        let [printValue, newScope] = exprEval(expr.thingToPrint, scope);
        return printfn(printValue, newScope);
    } else if (expr instanceof VariableDeclarationStmt) {
        let [rightVal, newScope] = exprEval(expr.right, scope);
        return define(expr.identifier, rightVal, expr.immutable, newScope);
    } else if (expr instanceof VariableAssignmentStmt) {
        let [rightVal, newScope] = exprEval(expr.right, scope);
        return assign(expr.identifier, rightVal, newScope);
    } else if (expr instanceof IfStmt) {
        let [shouldBeBool, newScope] = exprEval(expr.condition, scope);
        if (!assertBool(shouldBeBool)) {
            throw Error("Condition doesn't evaluate to a boolean.");
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
    } else if (expr instanceof WhileStmt) {
        let conditionValue = getVal(exprEval(expr.condition, scope));
        let value: Value;
        while (assertBool(conditionValue) && conditionValue) {
            let pair = exprEval(expr.body, scope);
            scope = getState(pair);
            value = getVal(pair);
            conditionValue = getVal(exprEval(expr.condition, scope));
        }
        return [value, scope];
    } else if (expr instanceof ReturnStmt) {
        return exprEval(expr.value, scope);
    } else if (expr instanceof MatchStmt) {
        let rootExpr = expr.expr;
        let [matchExprValue, newScope] = exprEval(rootExpr, scope);
        for (let matchCase of expr.cases) {
            if (matchCase.matchExpr instanceof UnderscoreExpr) {
                return exprEval(matchCase.expr, newScope);
            }
            // FIXME decide if side effects are legal in a match expression
            let arr = exprEval(matchCase.matchExpr, newScope);
            let caseValue = getVal(arr);
            newScope = getState(arr);
            if (equal(caseValue, matchExprValue)) {
                return exprEval(matchCase.expr, newScope);
            }
        };
        throw Error("Pattern match failed.");
    } else if (expr instanceof FunctionDefinition) {
        return exprEval(expr.definition, scope);
    } else {
        throw Error("Unhandled stmt or expr.");
    }
}

function call(fn: CfxFunction, args: Expr[], scope: Scope): Scoped<any> {
    let argValues: Value[] = [];
    for (let arg of args) {
        let [value, newScope] = exprEval(arg, scope);
        scope = newScope;
        argValues.push(value);
    }
    return fn.call(argValues, scope);
}

/*
 * Returns the opposite of the expression. Throws if expr does not evaluate to a
 * number.
 */
function opposite(right: Value): number {
    if (assertNumber(right)) return -<number>right;
    else throw Error('"-" can only be used on a number');
}

function plus(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left + <number>right;
    } else throw Error('Operands of "+" must be numbers.');
}

function minus(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left - <number>right;
    } else throw Error('Operands of "-" must be numbers.');
}

function plusPlus(left: Value, right: Value): string {
    if (typeof left === "string" &&
        typeof right === "string") {
        return left.concat(right);
    } else throw Error('Operands of "++" must be strings.');
}

function star(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left * <number>right;
    } else throw Error('Operands of "*" must be numbers.');
}

function slash(left: Value, right: Value): number {
    if (assertNumber(left, right)) {
        return <number>left / <number>right;
    } else throw Error('Operands of "/" must be numbers.');
}

function and(left: Value, right: Value): boolean {
    if (assertBool(left, right)) {
        return <boolean>left && <boolean>right;
    } else throw Error('Operands of "and" must be booleans.');
    
}

function or(left: Value, right: Value): boolean {
    if (assertBool(left, right)) {
        return <boolean>left || <boolean>right;
    } else {
        throw Error('Operands of "or" must be booleans.');
    }
    
}

function assertNumber(...literals: any[]): boolean {
    for (let literal of literals) {
        if (typeof literal !== "number") return false;
    }
    return true;
}

function assertBool(...literals: any[]): boolean {
    for (let literal of literals) {
        if (typeof literal !== "boolean") return false;
    }
    return true;
}

function not(right: Value): boolean {
    if (assertBool(right)) return !right;
    else throw Error('Operands of "not" should be booleans.');
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

function numberComparision(left: Value, right: Value, operator: (left, right) => boolean, err: string): boolean {
    if (assertNumber(left, right)) {
        return operator(left, right);
    } else throw Error(`Operands of ${err} should be numbers.`);
}

function mod(left: Value, right: Value): number {
    if (typeof left === "number" && typeof right === "number") {
        return left % right;
    } else throw Error(`Operands of % should be numbers.`);
}
