import Token from "./Token";

export class Expr {
}

export class BinaryExpr extends Expr {
    left: Expr;
    operator: Token;
    right: Expr;
    constructor(left: Expr, operator: Token, right: Expr) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

export class PrimaryExpr extends Expr {
    literal: any;
    constructor(literal: any) {
        super();
        this.literal = literal;
    }
}

export class UnaryExpr extends Expr {
    operator: Token;
    right: Expr;
    constructor(operator: Token, right: Expr) {
        super();
        this.operator = operator;
        this.right = right;
    }
}

export class GroupingExpr extends Expr {
    expr: Expr
    constructor(expr: Expr) {
        super();
        this.expr = expr;
    }
}

export class VariableExpr extends Expr {
    identifier: Token;
    constructor(identifier: Token) {
        super();
        this.identifier = identifier;
    }
}
