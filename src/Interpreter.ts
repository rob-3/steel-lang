import { 
    Expr, VariableExpr, BinaryExpr, 
    PrimaryExpr, UnaryExpr, GroupingExpr 
} from "./Expr";
import { 
    Stmt, VariableDeclarationStmt, PrintStmt, 
    VariableAssignmentStmt, IfStmt, BlockStmt,
    WhileStmt
} from "./Stmt";
import TokenType from "./TokenType";
import Token from "./Token";

let variables = new Map();

export function exec(stmt: Stmt, printfn): void {
    if (stmt instanceof PrintStmt) {
        printfn(cfxEval(stmt.thingToPrint));
    } else if (stmt instanceof VariableDeclarationStmt) {
        define(stmt.identifier, stmt.right, stmt.immutable)
    } else if (stmt instanceof VariableAssignmentStmt) {
        assign(stmt.identifier, stmt.right);
    } else if (stmt instanceof IfStmt) {
        let shouldBeBool = cfxEval(stmt.condition);
        if (!assertBool(shouldBeBool)) {
            throw Error("Condition doesn't evaluate to a boolean.");
        }
        if (shouldBeBool) {
            exec(stmt.body, printfn);
        } else if (stmt.elseBody !== null) {
            exec(stmt.elseBody, printfn);
        }
    } else if (stmt instanceof BlockStmt) {
        stmt.stmts.map(stmt => exec(stmt, printfn));
    } else if (stmt instanceof WhileStmt) {
        let conditionValue = cfxEval(stmt.condition);
        while (assertBool(conditionValue) && conditionValue) {
            exec(stmt.body, printfn);
            conditionValue = cfxEval(stmt.condition);
        }
    } else if (stmt instanceof Expr) {
        return cfxEval(stmt);
    }
}

function lookup(identifierToken: Token): any {
    let val = variables.get(identifierToken.lexeme);
    if (val === undefined) {
        throw Error(`Variable "${identifierToken.lexeme}" is not defined.`);
    } else {
        return val[0];
    }
}

function define(key: string, value: Expr, immutable: boolean): void {
    if (!variables.has(key) || !variables.get(key)[1]) variables.set(key, [cfxEval(value), immutable]);
    else throw Error(`Cannot redefine immutable variable "${key}".`);
}

function assign(key: string, value: Expr): void {
    let variable = variables.get(key);
    if (variable === undefined) {
        throw Error(`Cannot assign to undefined variable "${key}".`);
    } else {
        let immutable = variable[1];
        if (!immutable) {
            variables.set(key, [cfxEval(value), false]);
        } else {
            throw Error(`Cannot assign to immutable variable "${key}".`);
        }
    }
}

/*
 * eval() for conflux. Pass in any expression and get the evalutated result.
 */
export function cfxEval(expr: Expr): any {
    if (expr instanceof PrimaryExpr) {
        return expr.literal;
    } else if (expr instanceof BinaryExpr) {
        switch (expr.operator.type) {
            case TokenType.PLUS: return plus(expr.left, expr.right);
            case TokenType.MINUS: return minus(expr.left, expr.right);
            case TokenType.PLUS_PLUS: return plusPlus(expr.left, expr.right);
            case TokenType.STAR: return star(expr.left, expr.right);
            case TokenType.SLASH: return slash(expr.left, expr.right);
            case TokenType.AND: return and(expr.left, expr.right);
            case TokenType.OR: return or(expr.left, expr.right);
            case TokenType.GREATER_EQUAL: return greaterEqual(expr.left, expr.right);
            case TokenType.GREATER: return greater(expr.left, expr.right);
            case TokenType.LESS_EQUAL: return lessEqual(expr.left, expr.right);
            case TokenType.LESS: return less(expr.left, expr.right);
            case TokenType.EQUAL_EQUAL: return equal(expr.left, expr.right);
            default:
                throw Error(`FIXME: Unhandled operator type "${expr.operator}"`);
        }
    } else if (expr instanceof UnaryExpr) {
        switch (expr.operator.type) {
            case TokenType.MINUS: return opposite(expr.right);
            case TokenType.NOT: return not(expr.right);
        }
    } else if (expr instanceof GroupingExpr) {
        return cfxEval(expr.expr);
    } else if (expr instanceof VariableExpr) {
        return lookup(expr.identifier);
    }
}

/*
 * Returns the opposite of the expression. Throws if expr does not evaluate to a
 * number.
 */
function opposite(right: Expr): number {
    let rightVal = cfxEval(right);
    if (assertNumber(rightVal)) return -rightVal;
    else throw Error('"-" can only be used on a number');
}

function plus(left: Expr, right: Expr): number {
    let leftVal = cfxEval(left);
    let rightVal = cfxEval(right);
    if (assertNumber(leftVal, rightVal)) {
        return leftVal + rightVal;
    } else throw Error('Operands of "+" must be numbers.');
}

function minus(left: Expr, right: Expr): number {
    let leftVal = cfxEval(left);
    let rightVal = cfxEval(right);
    if (assertNumber(leftVal, rightVal)) {
        return leftVal - rightVal;
    } else throw Error('Operands of "-" must be numbers.');
}

function plusPlus(left: Expr, right: Expr): string {
    let leftVal = cfxEval(left);
    let rightVal = cfxEval(right);
    if (typeof leftVal === "string" &&
        typeof rightVal === "string") {
        return leftVal.concat(rightVal);
    } else throw Error('Operands of "++" must be strings.');
}

function star(left: Expr, right: Expr): number {
    let leftVal = cfxEval(left);
    let rightVal = cfxEval(right);
    if (assertNumber(leftVal, rightVal)) {
        return leftVal * rightVal;
    } else throw Error('Operands of "*" must be numbers.');
}

function slash(left: Expr, right: Expr): number {
    let leftVal = cfxEval(left);
    let rightVal = cfxEval(right);
    if (assertNumber(leftVal, rightVal)) {
        return leftVal / rightVal;
    } else throw Error('Operands of "/" must be numbers.');
}

function and(left: Expr, right: Expr): boolean {
    let leftVal = cfxEval(left);
    let rightVal = cfxEval(right);
    if (assertBool(leftVal, rightVal)) {
        return leftVal && rightVal;
    } else throw Error('Operands of "and" must be booleans.');
    
}

function or(left: Expr, right: Expr): boolean {
    let leftVal = cfxEval(left);
    let rightVal = cfxEval(right);
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

function not(right: Expr): boolean {
    let rightVal = cfxEval(right);
    if (assertBool(rightVal)) return !rightVal;
    else throw Error('Operands of "not" should be booleans.');
}

function greaterEqual(left: Expr, right: Expr): boolean {
    return comparision(left, right, (l, r) => l >= r, ">=");
}

function greater(left: Expr, right: Expr): boolean {
    return comparision(left, right, (l, r) => l > r, ">");
}

function lessEqual(left: Expr, right: Expr): boolean {
    return comparision(left, right, (l, r) => l <= r, "<=");
}

function less(left: Expr, right: Expr): boolean {
    return comparision(left, right, (l, r) => l < r, "<");
}

function equal(left: Expr, right: Expr): boolean {
    return comparision(left, right, (l, r) => l === r, "==");
}

function comparision(left: Expr, right: Expr, operator, err: string): boolean {
    let leftVal = cfxEval(left);
    let rightVal = cfxEval(right);
    if (assertNumber(leftVal, rightVal)) {
        return operator(leftVal, rightVal);
    } else throw Error(`Operands of ${err} should be numbers.`);
}
