import Expr from "./Expr";
import TokenType from "./TokenType";

/*
 * eval() for conflux. Pass in any expression and get the evalutated result.
 */
export function cfxEval(expr: Expr): any {
    if (expr instanceof Expr.Primary) {
        return expr.literal;
    } else if (expr instanceof Expr.Binary) {
        switch (expr.operator.type) {
            case TokenType.PLUS: return plus(expr.left, expr.right);
            case TokenType.MINUS: return minus(expr.left, expr.right);
            case TokenType.PLUS_PLUS: return plusPlus(expr.left, expr.right);
            case TokenType.STAR: return star(expr.left, expr.right);
            case TokenType.SLASH: return slash(expr.left, expr.right);
            case TokenType.AND: return and(expr.left, expr.right);
            case TokenType.OR: return or(expr.left, expr.right);
            default:
                throw Error(`FIXME: Unhandled operator type "${expr.operator}"`);
        }
    } else if (expr instanceof Expr.Unary) {
        switch (expr.operator.type) {
            case TokenType.MINUS: return opposite(expr.right);
            case TokenType.NOT: return not(expr.right);
        }
    } else if (expr instanceof Expr.Grouping) {
        return cfxEval(expr.expr);
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
    } else throw Error('Operands of "+" must be numbers.');
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
    } else throw Error('Operands of "&&" must be booleans.');
    
}

function or(left: Expr, right: Expr): boolean {
    let leftVal = cfxEval(left);
    let rightVal = cfxEval(right);
    if (assertBool(leftVal, rightVal)) {
        return leftVal || rightVal;
    } else throw Error('Operands of "||" must be booleans.');
    
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
    else throw Error('Operand of "not" should be booleans.');
}
