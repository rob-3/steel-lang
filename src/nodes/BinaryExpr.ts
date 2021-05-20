import { RuntimePanic } from "../Debug";
import { Expr, getDebugInfo } from "../Expr";
import {
    and,
    equal,
    greater,
    greaterEqual,
    less,
    lessEqual,
    minus,
    mod,
    or,
    plus,
    plusPlus,
    slash,
    star,
} from "../Interpreter";
import Scope from "../Scope";
import Token from "../Token";
import TokenType from "../TokenType";
import { Value } from "../Value";

export default class BinaryExpr implements Expr {
    left: Expr;
    operator: Token;
    right: Expr;
    tokens: Token[];
    constructor(left: Expr, operator: Token, right: Expr, tokens: Token[]) {
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [leftVal, newScope] = this.left.eval(scope);
        const [rightVal, newScope2] = this.right.eval(newScope);
        switch (this.operator.type) {
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
                    `FIXME: Unhandled operator type "${this.operator}"`
                );
        }
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(
            new BinaryExpr(
                this.left.map(fn),
                this.operator,
                this.right.map(fn),
                this.tokens
            )
        );
    }

    getDebugInfo = getDebugInfo;
}
