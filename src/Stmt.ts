import { Expr } from "./Expr";
import Token from "./Token";

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
    thingToPrint: Token;
    constructor(thingToPrint: Token) {
        super();
        this.thingToPrint = thingToPrint;
    }
}
