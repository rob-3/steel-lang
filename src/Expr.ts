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
    identifier: string;
    constructor(identifier: string) {
        super();
        this.identifier = identifier;
    }
}

export class FunctionExpr extends Expr {
    args: string[];
    body: Expr;
    constructor(args: string[], body: Expr) {
        super();
        this.args = args;
        this.body = body;
    }
}

export class CallExpr extends Expr {
    callee: Expr;
    args: Expr[];
    constructor(callee: Expr, args: Expr[]) {
        super();
        this.callee = callee;
        this.args = args;
    }
}

export class VariableDeclarationStmt extends Expr {
    immutable: boolean;
    identifier: string;
    right: Expr;
    constructor(identifier: string, immutable: boolean, right: Expr) {
        super();
        this.immutable = immutable;
        this.identifier = identifier;
        this.right = right;
    }
}

export class VariableAssignmentStmt extends Expr {
    identifier: string;
    right: Expr;
    constructor(identifier: string, right: Expr) {
        super();
        this.identifier = identifier;
        this.right = right;
    }
}

// TODO: library function
export class PrintStmt extends Expr {
    thingToPrint: Expr;
    constructor(thingToPrint: Expr) {
        super();
        this.thingToPrint = thingToPrint;
    }
}

export class IfStmt extends Expr {
    condition: Expr;
    body: Expr;
    elseBody: Expr;
    constructor(condition: Expr, body: Expr, elseBody: Expr) {
        super();
        this.condition = condition;
        this.body = body;
        this.elseBody = elseBody;
    }
}

export class BlockStmt extends Expr {
    exprs: Expr[];
    constructor(exprs: Expr[]) {
        super();
        this.exprs = exprs;
    }
}

export class WhileStmt extends Expr {
    condition: Expr;
    body: Expr;
    constructor(condition: Expr, body: Expr) {
        super();
        this.condition = condition;
        this.body = body;
    }
}

export class ReturnStmt extends Expr {
    value: Expr;
    constructor(value: Expr) {
        super();
        this.value = value;
    }
}

export class MatchStmt extends Expr {
    expr: Expr;
    cases: MatchCase[];
    constructor(expr: Expr, cases: MatchCase[]) {
        super();
        this.expr = expr;
        this.cases = cases;
    }
}

export class MatchCase {
    matchExpr: UnderscoreExpr | PrimaryExpr;
    expr: Expr;

    constructor(matchExpr: UnderscoreExpr | PrimaryExpr, expr: Expr) {
        this.matchExpr = matchExpr;
        this.expr = expr;
    }
}

export class UnderscoreExpr extends Expr {};
