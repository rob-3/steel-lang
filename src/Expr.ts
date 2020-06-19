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
    body: Stmt;
    constructor(args: string[], body: Stmt) {
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

export class Stmt extends Expr {
}

export class VariableDeclarationStmt extends Stmt {
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

export class VariableAssignmentStmt extends Stmt {
    identifier: string;
    right: Expr;
    constructor(identifier: string, right: Expr) {
        super();
        this.identifier = identifier;
        this.right = right;
    }
}

// TODO: library function
export class PrintStmt extends Stmt {
    thingToPrint: Expr;
    constructor(thingToPrint: Expr) {
        super();
        this.thingToPrint = thingToPrint;
    }
}

export class IfStmt extends Stmt {
    condition: Expr;
    body: Stmt;
    elseBody: Stmt;
    constructor(condition: Expr, body: Stmt, elseBody: Stmt) {
        super();
        this.condition = condition;
        this.body = body;
        this.elseBody = elseBody;
    }
}

export class BlockStmt extends Stmt {
    stmts: Stmt[];
    constructor(stmts: Stmt[]) {
        super();
        this.stmts = stmts;
    }
}

export class WhileStmt extends Stmt {
    condition: Expr;
    body: Stmt;
    constructor(condition: Expr, body: Stmt) {
        super();
        this.condition = condition;
        this.body = body;
    }
}

export class ReturnStmt extends Stmt {
    value: Expr;
    constructor(value: Expr) {
        super();
        this.value = value;
    }
}

export class MatchStmt extends Stmt {
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
    stmt: Stmt;

    constructor(matchExpr: UnderscoreExpr | PrimaryExpr, stmt: Stmt) {
        this.matchExpr = matchExpr;
        this.stmt = stmt;
    }
}

export class UnderscoreExpr extends Expr {};
