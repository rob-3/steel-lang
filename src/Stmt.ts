import { Expr } from "./Expr";

export class Stmt {
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
