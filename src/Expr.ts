import Token from "./Token";
import { copy } from "copy-anything";
import { Location } from "./TokenizerHelpers";

export interface Expr {
    map(fn: (expr: Expr) => Expr): Expr;
    getDebugInfo(): Location;
}

function getDebugInfo(): Location {
    let tokens = this.tokens;
    let filename = tokens[0].location.filepath;

    let startSpot = tokens[0].location.start;
    let endSpot = tokens[tokens.length - 1].location.end;
    let location = new Location(startSpot, endSpot, filename);
    return location;
}

export class BinaryExpr implements Expr {
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

    map(fn: (expr: Expr) => Expr) {
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

export class PrimaryExpr implements Expr {
    literal: any;
    tokens: Token[];
    constructor(literal: any, tokens: Token[]) {
        this.literal = literal;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(copy(this));
    }

    getDebugInfo = getDebugInfo;
}

export class UnaryExpr implements Expr {
    operator: Token;
    right: Expr;
    tokens: Token[];
    constructor(operator: Token, right: Expr, tokens: Token[]) {
        this.operator = operator;
        this.right = right;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new UnaryExpr(this.operator, this.right.map(fn), this.tokens)
        );
    }

    getDebugInfo = getDebugInfo;
}

export class GroupingExpr implements Expr {
    expr: Expr;
    tokens: Token[];
    constructor(expr: Expr, tokens: Token[]) {
        this.expr = expr;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new GroupingExpr(this.expr.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}

export class VariableExpr implements Expr {
    identifier: string;
    tokens: Token[];
    constructor(identifier: string, tokens: Token[]) {
        this.identifier = identifier;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(copy(this));
    }

    getDebugInfo = getDebugInfo;
}

export class FunctionExpr implements Expr {
    args: string[];
    body: Expr;
    tokens: Token[];
    constructor(args: string[], body: Expr, tokens: Token[]) {
        this.args = args;
        this.body = body;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new FunctionExpr(this.args, this.body.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}

export class CallExpr implements Expr {
    callee: Expr;
    args: Expr[];
    tokens: Token[];
    constructor(callee: Expr, args: Expr[], tokens: Token[]) {
        this.callee = callee;
        this.args = args;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new CallExpr(this.callee.map(fn), this.args.map(fn), this.tokens)
        );
    }

    getDebugInfo = getDebugInfo;
}

export class VariableDeclarationStmt implements Expr {
    immutable: boolean;
    identifier: string;
    right: Expr;
    tokens: Token[];
    constructor(
        identifier: string,
        immutable: boolean,
        right: Expr,
        tokens: Token[]
    ) {
        this.immutable = immutable;
        this.identifier = identifier;
        this.right = right;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new VariableDeclarationStmt(
                this.identifier,
                this.immutable,
                this.right.map(fn),
                this.tokens
            )
        );
    }

    getDebugInfo = getDebugInfo;
}

export class VariableAssignmentStmt implements Expr {
    identifier: string;
    right: Expr;
    tokens: Token[];
    constructor(identifier: string, right: Expr, tokens: Token[]) {
        this.identifier = identifier;
        this.right = right;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new VariableAssignmentStmt(
                this.identifier,
                this.right.map(fn),
                this.tokens
            )
        );
    }

    getDebugInfo = getDebugInfo;
}

// TODO: library function
export class PrintStmt implements Expr {
    thingToPrint: Expr;
    tokens: Token[];
    constructor(thingToPrint: Expr, tokens: Token[]) {
        this.thingToPrint = thingToPrint;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new PrintStmt(this.thingToPrint.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}

export class IfStmt implements Expr {
    condition: Expr;
    body: Expr;
    elseBody: Expr | null;
    tokens: Token[];
    constructor(condition: Expr, body: Expr, elseBody: Expr, tokens: Token[]) {
        this.condition = condition;
        this.body = body;
        this.elseBody = elseBody;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new IfStmt(
                this.condition.map(fn),
                this.body.map(fn),
                this.elseBody ? this.elseBody.map(fn) : null,
                this.tokens
            )
        );
    }

    getDebugInfo = getDebugInfo;
}

export class BlockStmt implements Expr {
    exprs: Expr[];
    tokens: Token[];
    constructor(exprs: Expr[], tokens: Token[] = []) {
        this.exprs = exprs;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new BlockStmt(this.exprs.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}

export class WhileStmt implements Expr {
    condition: Expr;
    body: Expr;
    tokens: Token[];
    constructor(condition: Expr, body: Expr, tokens: Token[]) {
        this.condition = condition;
        this.body = body;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(
            new WhileStmt(
                this.condition.map(fn),
                this.body.map(fn),
                this.tokens
            )
        );
    }

    getDebugInfo = getDebugInfo;
}

export class ReturnStmt implements Expr {
    value: Expr;
    tokens: Token[];
    constructor(value: Expr, tokens: Token[]) {
        this.value = value;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new ReturnStmt(this.value.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}

export class MatchStmt implements Expr {
    expr: Expr;
    cases: MatchCase[];
    tokens: Token[];
    constructor(expr: Expr, cases: MatchCase[], tokens: Token[]) {
        this.expr = expr;
        this.cases = cases;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new MatchStmt(this.expr.map(fn), this.cases, this.tokens));
    }

    getDebugInfo = getDebugInfo;
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
    tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }
    map(fn: (expr: Expr) => Expr) {
        return fn(copy(this));
    }

    getDebugInfo = getDebugInfo;
}

export class FunctionDefinition implements Expr {
    definition: VariableDeclarationStmt;
    tokens: Token[];

    constructor(definition: VariableDeclarationStmt, tokens: Token[]) {
        this.definition = definition;
        this.tokens = tokens;
    }

    map(fn: (expr: Expr) => Expr) {
        return fn(new FunctionDefinition(copy(this.definition), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}

export class FailedParse implements Expr {
    map(fn: (expr: Expr) => Expr) {
        return this;
    }

    getDebugInfo = () => null;
}
