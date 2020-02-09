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

let printfn = console.log;

export function setPrintFn(fn) {
    printfn = fn;
}

export function cfxExec(src: string): Scope {
    let stmts: Stmt[] = parse(tokenize(src));
    return stmts.reduce<Scope>((currentScope: Scope, stmt: Stmt) => {
        return stmtExec(stmt, currentScope);
    }, new Scope());
}

export function stmtExec(stmt: Stmt, scope: Scope): Scope {
    if (stmt instanceof PrintStmt) {
        printfn(exprEval(stmt.thingToPrint, scope));
        return scope;
    } else if (stmt instanceof VariableDeclarationStmt) {
        return define(scope, stmt.identifier, stmt.right, stmt.immutable);
    } else if (stmt instanceof VariableAssignmentStmt) {
        return assign(scope, stmt.identifier, stmt.right);
    } else if (stmt instanceof IfStmt) {
        let shouldBeBool = exprEval(stmt.condition, scope);
        if (!assertBool(shouldBeBool)) {
            throw Error("Condition doesn't evaluate to a boolean.");
        }
        if (shouldBeBool) {
            return stmtExec(stmt.body, scope);
        } else if (stmt.elseBody !== null) {
            return stmtExec(stmt.elseBody, scope);
        }
    } else if (stmt instanceof BlockStmt) {
        return stmt.stmts.reduce<Scope>((currentScope: Scope, stmt: Stmt) => {
            return stmtExec(stmt, currentScope)
        },
                                        scope);
    } else if (stmt instanceof WhileStmt) {
        let conditionValue = exprEval(stmt.condition, scope);
        while (assertBool(conditionValue) && conditionValue) {
            scope = stmtExec(stmt.body, scope);
            conditionValue = exprEval(stmt.condition, scope);
        }
        return scope;
    } else if (stmt instanceof Expr) {
        exprEval(stmt, scope);
        return scope;
    } else {
        throw Error("Unhandled stmt");
    }
}

function lookup(scope: Scope, identifier: string): any {
    let val = scope.get(identifier);
    if (val === null) {
        throw Error(`Variable "${identifier}" is not defined.`);
    } else {
        return val;
    }
}

function define(scope: Scope, key: string, value: Expr, immutable: boolean): Scope {
    // TODO this is where the problem is
    if (!scope.has(key) || !scope.get(key)[1]) {
        scope.set(key, [exprEval(value, scope), immutable]);
    } else {
        throw Error(`Cannot redefine immutable variable "${key}".`);
    }
    return scope;
}

function assign(scope: Scope, key: string, value: Expr): Scope {
    let variable = scope.get(key);
    if (variable === null) {
        throw Error(`Cannot assign to undefined variable "${key}".`);
    } else {
        let immutable = variable[1];
        if (!immutable) {
            scope.set(key, [exprEval(value, scope), false]);
        } else {
            throw Error(`Cannot assign to immutable variable "${key}".`);
        }
    }
    return scope;
}

/*
 * String-based eval() for conflux.
 */
export function cfxEval(src: string, scope: Scope): any {
    return exprEval(parse(tokenize(src))[0], scope);
}

/*
 * Ast-based eval() for conflux. Pass in any expression and get the evalutated result.
 */
export function exprEval(expr: Expr, scope: Scope): any {
    if (expr instanceof PrimaryExpr) {
        return expr.literal;
    } else if (expr instanceof BinaryExpr) {
        switch (expr.operator.type) {
            case TokenType.PLUS: return plus(expr.left, expr.right, scope);
            case TokenType.MINUS: return minus(expr.left, expr.right, scope);
            case TokenType.PLUS_PLUS: return plusPlus(expr.left, expr.right, scope);
            case TokenType.STAR: return star(expr.left, expr.right, scope);
            case TokenType.SLASH: return slash(expr.left, expr.right, scope);
            case TokenType.AND: return and(expr.left, expr.right, scope);
            case TokenType.OR: return or(expr.left, expr.right, scope);
            case TokenType.GREATER_EQUAL: return greaterEqual(expr.left, expr.right, scope);
            case TokenType.GREATER: return greater(expr.left, expr.right, scope);
            case TokenType.LESS_EQUAL: return lessEqual(expr.left, expr.right, scope);
            case TokenType.LESS: return less(expr.left, expr.right, scope);
            case TokenType.EQUAL_EQUAL: return equal(expr.left, expr.right, scope);
            default:
                throw Error(`FIXME: Unhandled operator type "${expr.operator}"`);
        }
    } else if (expr instanceof UnaryExpr) {
        switch (expr.operator.type) {
            case TokenType.MINUS: return opposite(expr.right, scope);
            case TokenType.NOT: return not(expr.right, scope);
        }
    } else if (expr instanceof GroupingExpr) {
        return exprEval(expr.expr, scope);
    } else if (expr instanceof VariableExpr) {
        return lookup(scope, expr.identifier);
    } else if (expr instanceof CallExpr) {
        return call(lookup(scope, expr.identifier), expr.args, scope);
    } else if (expr instanceof FunctionExpr) {
        return expr;
    } else {
        throw Error("Unrecognized error");
    }
}

function call(fn: FunctionExpr, args: Expr[], scope: Scope) {
    return fn.call(args, scope);
}

/*
 * Returns the opposite of the expression. Throws if expr does not evaluate to a
 * number.
 */
function opposite(right: Expr, scope: Scope): number {
    let rightVal = exprEval(right, scope);
    if (assertNumber(rightVal)) return -rightVal;
    else throw Error('"-" can only be used on a number');
}

function plus(left: Expr, right: Expr, scope: Scope): number {
    let leftVal = exprEval(left, scope);
    let rightVal = exprEval(right, scope);
    if (assertNumber(leftVal, rightVal)) {
        return leftVal + rightVal;
    } else throw Error('Operands of "+" must be numbers.');
}

function minus(left: Expr, right: Expr, scope: Scope): number {
    let leftVal = exprEval(left, scope);
    let rightVal = exprEval(right, scope);
    if (assertNumber(leftVal, rightVal)) {
        return leftVal - rightVal;
    } else throw Error('Operands of "-" must be numbers.');
}

function plusPlus(left: Expr, right: Expr, scope: Scope): string {
    let leftVal = exprEval(left, scope);
    let rightVal = exprEval(right, scope);
    if (typeof leftVal === "string" &&
        typeof rightVal === "string") {
        return leftVal.concat(rightVal);
    } else throw Error('Operands of "++" must be strings.');
}

function star(left: Expr, right: Expr, scope: Scope): number {
    let leftVal = exprEval(left, scope);
    let rightVal = exprEval(right, scope);
    if (assertNumber(leftVal, rightVal)) {
        return leftVal * rightVal;
    } else throw Error('Operands of "*" must be numbers.');
}

function slash(left: Expr, right: Expr, scope: Scope): number {
    let leftVal = exprEval(left, scope);
    let rightVal = exprEval(right, scope);
    if (assertNumber(leftVal, rightVal)) {
        return leftVal / rightVal;
    } else throw Error('Operands of "/" must be numbers.');
}

function and(left: Expr, right: Expr, scope: Scope): boolean {
    let leftVal = exprEval(left, scope);
    let rightVal = exprEval(right, scope);
    if (assertBool(leftVal, rightVal)) {
        return leftVal && rightVal;
    } else throw Error('Operands of "and" must be booleans.');
    
}

function or(left: Expr, right: Expr, scope: Scope): boolean {
    let leftVal = exprEval(left, scope);
    let rightVal = exprEval(right, scope);
    if (assertBool(leftVal, rightVal)) {
        return leftVal || rightVal;
    } else throw Error('Operands of "or" must be booleans.');
    
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

function not(right: Expr, scope: Scope): boolean {
    let rightVal = exprEval(right, scope);
    if (assertBool(rightVal)) return !rightVal;
    else throw Error('Operands of "not" should be booleans.');
}

function greaterEqual(left: Expr, right: Expr, scope: Scope): boolean {
    return comparision(left, right, scope, (l, r) => l >= r, ">=");
}

function greater(left: Expr, right: Expr, scope: Scope): boolean {
    return comparision(left, right, scope, (l, r) => l > r, ">");
}

function lessEqual(left: Expr, right: Expr, scope: Scope): boolean {
    return comparision(left, right, scope, (l, r) => l <= r, "<=");
}

function less(left: Expr, right: Expr, scope: Scope): boolean {
    return comparision(left, right, scope, (l, r) => l < r, "<");
}

function equal(left: Expr, right: Expr, scope: Scope): boolean {
    return comparision(left, right, scope, (l, r) => l === r, "==");
}

function comparision(left: Expr, right: Expr, scope: Scope, operator, err: string): boolean {
    let leftVal = exprEval(left, scope);
    let rightVal = exprEval(right, scope);
    if (assertNumber(leftVal, rightVal)) {
        return operator(leftVal, rightVal);
    } else throw Error(`Operands of ${err} should be numbers.`);
}
