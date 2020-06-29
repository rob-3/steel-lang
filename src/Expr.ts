import Token from "./Token";

export interface Expr {
    copy(): Expr;
    map(fn: (expr: Expr) => Expr): Expr;
}

export class BinaryExpr implements Expr {
    left: Expr;
    operator: Token;
    right: Expr;
    constructor(left: Expr, operator: Token, right: Expr) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    copy() {
        return new BinaryExpr(
            this.left.copy(), 
            this.operator,
            this.right.copy()
        );
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new BinaryExpr(this.left.map(fn), this.operator, this.right.map(fn)));
    }
}

export class PrimaryExpr implements Expr {
    literal: any;
    constructor(literal: any) {
        this.literal = literal;
    }

    copy() { return new PrimaryExpr(this.literal); }

    map(fn: (expr: Expr) => Expr) {
        return fn(this.copy());
    }
}

export class UnaryExpr implements Expr {
    operator: Token;
    right: Expr;
    constructor(operator: Token, right: Expr) {
        this.operator = operator;
        this.right = right;
    }

    copy() { return new UnaryExpr(this.operator, this.right.copy()); }

    map(fn: (expr: Expr) => Expr) {
        return fn(new UnaryExpr(this.operator, this.right.map(fn)));
    }
}

export class GroupingExpr implements Expr {
    expr: Expr
    constructor(expr: Expr) {
        this.expr = expr;
    }

    copy() { return new GroupingExpr(this.expr.copy()); }

    map(fn: (expr: Expr) => Expr) {
        return fn(new GroupingExpr(this.expr.map(fn)));
    }
}

export class VariableExpr implements Expr {
    identifier: string;
    constructor(identifier: string) {
        this.identifier = identifier;
    }

    copy() { return new VariableExpr(this.identifier); }

    map(fn: (expr: Expr) => Expr) {
        return fn(this.copy());
    }
}

export class FunctionExpr implements Expr {
    args: string[];
    body: Expr;
    constructor(args: string[], body: Expr) {
        this.args = args;
        this.body = body;
    }

    copy() { return new FunctionExpr(this.args, this.body.copy()); }

    map(fn: (expr: Expr) => Expr) {
        return fn(new FunctionExpr(this.args, this.body.map(fn)));
    }
}

export class CallExpr implements Expr {
    callee: Expr;
    args: Expr[];
    constructor(callee: Expr, args: Expr[]) {
        this.callee = callee;
        this.args = args;
    }

    copy() { return new CallExpr(this.callee.copy(), this.args.map(expr => expr.copy())); }

    map(fn: (expr: Expr) => Expr) {
        return fn(new CallExpr(this.callee.map(fn), this.args.map(fn)));
    }
}

export class VariableDeclarationStmt implements Expr {
    immutable: boolean;
    identifier: string;
    right: Expr;
    constructor(identifier: string, immutable: boolean, right: Expr) {
        this.immutable = immutable;
        this.identifier = identifier;
        this.right = right;
    }

    copy() { 
        return new VariableDeclarationStmt(this.identifier, this.immutable, this.right.copy());
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new VariableDeclarationStmt(this.identifier, this.immutable, this.right.map(fn)));
    }
}

export class VariableAssignmentStmt implements Expr {
    identifier: string;
    right: Expr;
    constructor(identifier: string, right: Expr) {
        this.identifier = identifier;
        this.right = right;
    }

    copy() { 
        return new VariableAssignmentStmt(this.identifier, this.right.copy());
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new VariableAssignmentStmt(this.identifier, this.right.map(fn)));
    }
}

// TODO: library function
export class PrintStmt implements Expr {
    thingToPrint: Expr;
    constructor(thingToPrint: Expr) {
        this.thingToPrint = thingToPrint;
    }

    copy() { return new PrintStmt(this.thingToPrint.copy()); }

    map(fn: (expr: Expr) => Expr) {
        return fn(new PrintStmt(this.thingToPrint.map(fn)));
    }
}

export class IfStmt implements Expr {
    condition: Expr;
    body: Expr;
    elseBody: Expr | null;
    constructor(condition: Expr, body: Expr, elseBody: Expr) {
        this.condition = condition;
        this.body = body;
        this.elseBody = elseBody;
    }

    copy() { 
        return new IfStmt(this.condition.copy(), 
                          this.body.copy(), 
                          this.elseBody ? this.elseBody.copy() : null
                         ); 
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new IfStmt(
                this.condition.map(fn), 
                this.body.map(fn),
                this.elseBody ? this.elseBody.map(fn) : null
            )
        );
    }
}

export class BlockStmt implements Expr {
    exprs: Expr[];
    constructor(exprs: Expr[]) {
        this.exprs = exprs;
    }

    copy() { return new BlockStmt(this.exprs.map(expr => expr.copy())) }

    map(fn: (expr: Expr) => Expr) {
        return fn(new BlockStmt(this.exprs.map(fn)));
    }
}

export class WhileStmt implements Expr {
    condition: Expr;
    body: Expr;
    constructor(condition: Expr, body: Expr) {
        this.condition = condition;
        this.body = body;
    }

    copy() { return new WhileStmt(this.condition.copy(), this.body.copy()); }

    map(fn: (expr: Expr) => Expr) {
        return fn(new WhileStmt(this.condition.map(fn), this.body.map(fn)));
    }
}

export class ReturnStmt implements Expr {
    value: Expr;
    constructor(value: Expr) {
        this.value = value;
    }

    copy() { return new ReturnStmt(this.value.copy()); }

    map(fn: (expr: Expr) => Expr) {
        return fn(new ReturnStmt(this.value.map(fn)));
    }
}

export class MatchStmt implements Expr {
    expr: Expr;
    cases: MatchCase[];
    constructor(expr: Expr, cases: MatchCase[]) {
        this.expr = expr;
        this.cases = cases;
    }

    copy() { 
        return new MatchStmt(this.expr.copy(), this.cases.map(expr => expr.copy()));
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new MatchStmt(this.expr.map(fn), this.cases));
    }
}

export class MatchCase {
    matchExpr: UnderscoreExpr | PrimaryExpr;
    expr: Expr;

    constructor(matchExpr: UnderscoreExpr | PrimaryExpr, expr: Expr) {
        this.matchExpr = matchExpr;
        this.expr = expr;
    }

    copy() { return new MatchCase(this.matchExpr.copy(), this.expr.copy()); }
}

export class UnderscoreExpr implements Expr {
    copy() { return new UnderscoreExpr(); }

    map(fn: (expr: Expr) => Expr) {
        return fn(this.copy());
    }
};

export class FunctionDefinition implements Expr {
    definition: VariableDeclarationStmt;

    constructor(definition: VariableDeclarationStmt) {
        this.definition = definition;
    }

    copy() { return new FunctionDefinition(this.definition.copy()); }

    map(fn: (expr: Expr) => Expr) {
        return fn(new FunctionDefinition(this.definition.copy()));
    }
}
