import Token from "./Token";
import { copy } from "copy-anything";

export interface Expr {
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

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new BinaryExpr(this.left.map(fn), this.operator, this.right.map(fn))
        );
    }
}

export class PrimaryExpr implements Expr {
    literal: any;
    constructor(literal: any) {
        this.literal = literal;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(copy(this));
    }
}

export class UnaryExpr implements Expr {
    operator: Token;
    right: Expr;
    constructor(operator: Token, right: Expr) {
        this.operator = operator;
        this.right = right;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new UnaryExpr(this.operator, this.right.map(fn)));
    }
}

export class GroupingExpr implements Expr {
    expr: Expr;
    constructor(expr: Expr) {
        this.expr = expr;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new GroupingExpr(this.expr.map(fn)));
    }
}

export class VariableExpr implements Expr {
    identifier: string;
    constructor(identifier: string) {
        this.identifier = identifier;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(copy(this));
    }
}

export class FunctionExpr implements Expr {
    args: string[];
    body: Expr;
    constructor(args: string[], body: Expr) {
        this.args = args;
        this.body = body;
    }

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

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new VariableDeclarationStmt(
                this.identifier,
                this.immutable,
                this.right.map(fn)
            )
        );
    }
}

export class VariableAssignmentStmt implements Expr {
    identifier: string;
    right: Expr;
    constructor(identifier: string, right: Expr) {
        this.identifier = identifier;
        this.right = right;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new VariableAssignmentStmt(this.identifier, this.right.map(fn))
        );
    }
}

// TODO: library function
export class PrintStmt implements Expr {
    thingToPrint: Expr;
    constructor(thingToPrint: Expr) {
        this.thingToPrint = thingToPrint;
    }

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

    map(fn: (expr: Expr) => Expr) {
        return fn(new WhileStmt(this.condition.map(fn), this.body.map(fn)));
    }
}

export class ReturnStmt implements Expr {
    value: Expr;
    constructor(value: Expr) {
        this.value = value;
    }

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
}

export class UnderscoreExpr implements Expr {
    map(fn: (expr: Expr) => Expr) {
        return fn(copy(this));
    }
}

export class FunctionDefinition implements Expr {
    definition: VariableDeclarationStmt;

    constructor(definition: VariableDeclarationStmt) {
        this.definition = definition;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new FunctionDefinition(copy(this.definition)));
    }
}
