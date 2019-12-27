import Token from "./Token";

export default class Expr {
    static Binary = class {
        left: Expr;
        operator: Token;
        right: Expr;
        constructor(left: Expr, operator: Token, right: Expr) {
            this.left = left;
            this.operator = operator;
            this.right = right;
        }
    }

    static Primary = class {
        literal: any;
        constructor(literal: any) {
            this.literal = literal;
        }
    }

    static Unary = class {
        operator: Token;
        right: Expr;
        constructor(operator: Token, right: Expr) {
            this.operator = operator;
            this.right = right;
        }
    }
}
