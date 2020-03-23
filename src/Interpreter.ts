import { 
    Expr, VariableExpr, BinaryExpr, 
    PrimaryExpr, UnaryExpr, GroupingExpr,
    CallExpr, FunctionExpr,

    Stmt, VariableDeclarationStmt, PrintStmt, 
    VariableAssignmentStmt, IfStmt, BlockStmt,
    WhileStmt, ReturnStmt
} from "./Expr";
import TokenType from "./TokenType";
import Scope from "./Scope";
import tokenize from "./Tokenizer";
import parse from "./Parser";
import { State, ID } from "./lib/Monads";
export type Scoped<T> = State<T, Scope>
import { CfxFunction, Value } from "./InterpreterHelpers";
import { compose } from "./lib/Utils";

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
    // TODO rewrite in functional style
    let getAst = compose(tokenize, parse);

    let stmts: Stmt[] = getAst(src);
    let scope = new Scope();
    let result: Scoped<Value>;
    for (let stmt of stmts) {
        result = exprEval(stmt, scope);
        scope = result.state;
    }
    return result;
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
            scope.assign(key, [evaluatedExpr, false]);
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
export function exprEval(expr: Expr, scope: Scope): Scoped<Value> {
    if (expr instanceof PrimaryExpr) {
        return State.of(expr.literal, scope);
    } else if (expr instanceof BinaryExpr) {
        // TODO: refactor in functional style
        let leftMonad = exprEval(expr.left, scope);
        let rightMonad = exprEval(expr.right, leftMonad.state);
        let monad = State.of([leftMonad.value, rightMonad.value], rightMonad.state);
        switch (expr.operator.type) {
            case TokenType.PLUS:
                return monad.map(plus);
            case TokenType.MINUS:
                return monad.map(minus);
            case TokenType.PLUS_PLUS: 
                return monad.map(plusPlus);
            case TokenType.STAR:
                return monad.map(star);
            case TokenType.SLASH:
                return monad.map(slash);
            case TokenType.MOD:
                return monad.map(mod);
            case TokenType.AND:
                return monad.map(and);
            case TokenType.OR:
                return monad.map(or);
            case TokenType.GREATER_EQUAL:
                return monad.map(greaterEqual);
            case TokenType.GREATER:
                return monad.map(greater);
            case TokenType.LESS_EQUAL:
                return monad.map(lessEqual);
            case TokenType.LESS:
                return monad.map(less);
            case TokenType.EQUAL_EQUAL:
                return monad.map(equal);
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
        return State.of(expr.callee, scope)
            .flatMap(exprEval)
            .flatMap((maybeFn, scope) => {
                if (maybeFn instanceof CfxFunction) {
                    return call(maybeFn, expr.args, scope);
                } else {
                    throw Error(`Can't call ${maybeFn} because it is not a function.`);
                }
            });
    } else if (expr instanceof FunctionExpr) {
        return State.of(new CfxFunction(expr), scope);
    } else if (expr instanceof PrintStmt) {
        let monad = State.of(expr, scope).flatMap((expr: PrintStmt, scope) => exprEval(expr.thingToPrint, scope))
        monad.map(printfn)
        return monad;
    } else if (expr instanceof VariableDeclarationStmt) {
        return exprEval(expr.right, scope).flatMap(
            (rightVal, scope) => define(expr.identifier, rightVal, expr.immutable, scope)
        );
    } else if (expr instanceof VariableAssignmentStmt) {
        return exprEval(expr.right, scope).flatMap(
            (rightVal, scope) => assign(expr.identifier, rightVal, scope)
        );
    } else if (expr instanceof IfStmt) {
        let result = exprEval(expr.condition, scope);
        let shouldBeBool = result.value;
        scope = result.state;
        if (!assertBool(shouldBeBool)) {
            throw Error("Condition doesn't evaluate to a boolean.");
        }
        if (shouldBeBool) {
            return exprEval(expr.body, scope);
        } else if (expr.elseBody !== null) {
            return exprEval(expr.elseBody, scope);
        } else {
            // TODO: hack we need to address
            return State.of(null, scope);
        }
    } else if (expr instanceof BlockStmt) {
        let result: Scoped<Value>;
        for (let myStmt of expr.stmts) {
            result = exprEval(myStmt, scope);
            scope = result.state;
        }
        return result;
    } else if (expr instanceof WhileStmt) {
        let conditionValue = exprEval(expr.condition, scope).value;
        while (assertBool(conditionValue) && conditionValue) {
            scope = exprEval(expr.body, scope).state;
            conditionValue = exprEval(expr.condition, scope).value;
        }
        return State.of(null, scope);
    } else if (expr instanceof ReturnStmt) {
        return State.of(expr.value, scope).flatMap(exprEval);
    } else if (expr instanceof Expr) {
        return State.of(expr, scope).flatMap(exprEval);
    } else {
        throw Error("Unhandled stmt or expr.");
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

function plus([left, right]: [Value, Value]): number {
    if (assertNumber(left, right)) {
        return <number>left + <number>right;
    } else throw Error('Operands of "+" must be numbers.');
}

function minus([left, right]: [Value, Value]): number {
    if (assertNumber(left, right)) {
        return <number>left - <number>right;
    } else throw Error('Operands of "-" must be numbers.');
}

function plusPlus([left, right]: [Value, Value]): string {
    if (typeof left === "string" &&
        typeof right === "string") {
        return left.concat(right);
    } else throw Error('Operands of "++" must be strings.');
}

function star([left, right]: [Value, Value]): number {
    if (assertNumber(left, right)) {
        return <number>left * <number>right;
    } else throw Error('Operands of "*" must be numbers.');
}

function slash([left, right]: [Value, Value]): number {
    if (assertNumber(left, right)) {
        return <number>left / <number>right;
    } else throw Error('Operands of "/" must be numbers.');
}

function and([left, right]: [Value, Value]): boolean {
    if (assertBool(left, right)) {
        return <boolean>left && <boolean>right;
    } else throw Error('Operands of "and" must be booleans.');
    
}

function or([left, right]: [Value, Value]): boolean {
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

function greaterEqual([left, right]: [Value, Value]): boolean {
    return comparision(left, right, (l, r) => l >= r, ">=");
}

function greater([left, right]: [Value, Value]): boolean {
    return comparision(left, right, (l, r) => l > r, ">");
}

function lessEqual([left, right]: [Value, Value]): boolean {
    return comparision(left, right, (l, r) => l <= r, "<=");
}

function less([left, right]: [Value, Value]): boolean {
    return comparision(left, right, (l, r) => l < r, "<");
}

function equal([left, right]: [Value, Value]): boolean {
    return comparision(left, right, (l, r) => l === r, "==");
}

function comparision(left: Value, right: Value, operator: (left, right) => boolean, err: string): boolean {
    if (assertNumber(left, right)) {
        return operator(left, right);
    } else throw Error(`Operands of ${err} should be numbers.`);
}

function mod([left, right]: [Value, Value]): number {
    if (typeof left === "number" && typeof right === "number") {
        return left % right;
    } else throw Error(`Operands of % should be numbers.`);
}
