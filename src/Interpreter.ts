import { 
    Expr, VariableExpr, BinaryExpr, 
    PrimaryExpr, UnaryExpr, GroupingExpr,
    CallExpr, FunctionExpr
} from "./Expr";
import { 
    Stmt, VariableDeclarationStmt, PrintStmt, 
    VariableAssignmentStmt, IfStmt, BlockStmt,
    WhileStmt
} from "./Stmt";
import TokenType from "./TokenType";
import Scope from "./Scope";
import tokenize from "./Tokenizer";
import parse from "./Parser";
import { State } from "./lib/Monads";
export type Scoped<T> = State<T, Scope>
import { map, spread } from "./lib/utils";
import { CfxFunction, Value } from "./InterpreterHelpers";

let printfn = thing => {
    console.log(thing)
    // FIXME: magic debugging number
    return 42;
};

export function setPrintFn(fn) {
    printfn = thing => {
        fn(thing);
        // FIXME: magic debugging number
        return 65;
    }
}

export function cfxExec(src: string): Scoped<Value> {
    let stmts: Stmt[] = parse(tokenize(src));
    let scope = new Scope();
    let result: Scoped<Value>;
    for (let stmt of stmts) {
        result = stmtExec(stmt, scope);
        scope = result.state;
    }
    return result;
    /*
    let state: Scoped<Stmt[]> = State.of(stmts, new Scope());
    return state.map((stmts, scope) => map((stmt) => stmtExec(stmt, scope))(stmts)).map(results => results[results.length - 1]);
    */
}

export function stmtExec(stmt: Stmt, scope: Scope): Scoped<Value> {
    if (stmt instanceof PrintStmt) {
        let monad = State.of(stmt, scope).flatMap((stmt: PrintStmt, scope) => exprEval(stmt.thingToPrint, scope))
        monad.map(printfn)
        return monad;
    } else if (stmt instanceof VariableDeclarationStmt) {
        return exprEval(stmt.right, scope).flatMap(
            (rightVal, scope) => define(stmt.identifier, rightVal, stmt.immutable, scope)
        );
    } else if (stmt instanceof VariableAssignmentStmt) {
        return exprEval(stmt.right, scope).flatMap(
            (rightVal, scope) => assign(stmt.identifier, rightVal, scope)
        );
    } else if (stmt instanceof IfStmt) {
        let result = exprEval(stmt.condition, scope);
        let shouldBeBool = result.value;
        scope = result.state;
        if (!assertBool(shouldBeBool)) {
            throw Error("Condition doesn't evaluate to a boolean.");
        }
        if (shouldBeBool) {
            return stmtExec(stmt.body, scope);
        } else if (stmt.elseBody !== null) {
            return stmtExec(stmt.elseBody, scope);
        } else {
            // TODO: hack we need to address
            return State.of(null, scope);
        }
    } else if (stmt instanceof BlockStmt) {
        let result: Scoped<Value>;
        for (let myStmt of stmt.stmts) {
            result = stmtExec(myStmt, scope);
            scope = result.state;
        }
        return result;
        /*
        // this line is probably broken and unreadable anyways; replace it
        return State.of(stmt.stmts, scope)
            .map((stmts, scope) => 
                map((stmt: Stmt) => 
                    stmtExec(stmt, scope))(stmts))
                        .flatMap((results, scope) => results[results.length - 1])
         */
    } else if (stmt instanceof WhileStmt) {
        let conditionValue = exprEval(stmt.condition, scope);
        while (assertBool(conditionValue) && conditionValue) {
            scope = stmtExec(stmt.body, scope).state;
            conditionValue = exprEval(stmt.condition, scope);
        }
        return State.of(null, scope);
    } else if (stmt instanceof Expr) {
        return State.of(stmt, scope).flatMap(exprEval);
    } else {
        throw Error("Unhandled stmt");
    }
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
        scope.set(key, [evaluatedExpr, immutable]);
        return State.of(evaluatedExpr, scope);
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
            scope.set(key, [evaluatedExpr, false]);
            return State.of(evaluatedExpr, scope);
        } else {
            throw Error(`Cannot assign to immutable variable "${key}".`);
        }
    }
}

/*
 * String-based eval() for conflux.
 */
export function cfxEval(src: string, scope: Scope): Value {
    return exprEval(parse(tokenize(src))[0], scope).value;
}

/*
 * Ast-based eval() for conflux. Pass in any expression and get the evalutated result.
 */
export function exprEval(expr: Expr | Stmt, scope: Scope): Scoped<Value> {
    if (expr instanceof PrimaryExpr) {
        return State.of(expr.literal, scope);
    } else if (expr instanceof BinaryExpr) {
        // TODO: refactor in functional style
        let leftMonad = exprEval(expr.left, scope);
        let rightMonad = exprEval(expr.right, leftMonad.state);
        let monad = State.of([leftMonad.value, rightMonad.value], rightMonad.state);
        switch (expr.operator.type) {
            case TokenType.PLUS:
                return monad.map(spread(plus));
            case TokenType.MINUS:
                return monad.map(spread(minus));
            case TokenType.PLUS_PLUS: 
                return monad.map(spread(plusPlus));
            case TokenType.STAR:
                return monad.map(spread(star));
            case TokenType.SLASH:
                return monad.map(spread(slash));
            case TokenType.AND:
                return monad.map(spread(and));
            case TokenType.OR:
                return monad.map(spread(or));
            case TokenType.GREATER_EQUAL:
                return monad.map(spread(greaterEqual));
            case TokenType.GREATER:
                return monad.map(spread(greater));
            case TokenType.LESS_EQUAL:
                return monad.map(spread(lessEqual));
            case TokenType.LESS:
                return monad.map(spread(less));
            case TokenType.EQUAL_EQUAL:
                return monad.map(spread(equal));
            default:
                throw Error(`FIXME: Unhandled operator type "${expr.operator}"`);
        }
    } else if (expr instanceof UnaryExpr) {
        let monad = State.of(expr.right, scope)
            .flatMap(exprEval)
        switch (expr.operator.type) {
            case TokenType.MINUS:
                return monad.map(opposite);
            case TokenType.NOT: 
                return monad.map(not);
        }
    } else if (expr instanceof GroupingExpr) {
        return exprEval(expr.expr, scope);
    } else if (expr instanceof VariableExpr) {
        return State.of(lookup(expr.identifier, scope), scope);
    } else if (expr instanceof CallExpr) {
        let fn: any = lookup(expr.identifier, scope);
        if (fn instanceof CfxFunction) {
            return call(fn, expr.args, scope);
        } else {
            throw Error(`Can't call ${expr.identifier} because it is not a function.`);
        }
    } else if (expr instanceof FunctionExpr) {
        return State.of(new CfxFunction(expr), scope);
    } else if (expr instanceof BlockStmt) {
        return stmtExec(expr, scope);
    } else {
        throw Error("Unrecognized error");
    }
}

function call(fn: CfxFunction, args: Expr[], scope: Scope): Scoped<any> {
    let argValues: Value[] = [];
    for (let arg of args) {
        let { state: newScope, value } = exprEval(arg, scope);
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
    return comparision(left, right, (l, r) => l >= r, ">=");
}

function greater(left: Value, right: Value): boolean {
    return comparision(left, right, (l, r) => l > r, ">");
}

function lessEqual(left: Value, right: Value): boolean {
    return comparision(left, right, (l, r) => l <= r, "<=");
}

function less(left: Value, right: Value): boolean {
    return comparision(left, right, (l, r) => l < r, "<");
}

function equal(left: Value, right: Value): boolean {
    return comparision(left, right, (l, r) => l === r, "==");
}

function comparision(left: Value, right: Value, operator: (left, right) => boolean, err: string): boolean {
    if (assertNumber(left, right)) {
        return operator(left, right);
    } else throw Error(`Operands of ${err} should be numbers.`);
}
