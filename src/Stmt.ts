import Expr from "./Expr";

export default class Stmt {
    static VariableDeclaration = class {
        immutable: boolean;
        identifier: string;
        right: Expr;
        constructor(identifier: string, immutable: boolean, right: Expr) {
            this.immutable = immutable;
            this.identifier = identifier;
            this.right = right;
        }
    }

    static VariableAssignment = class {
        identifier: string;
        right: Expr;
        constructor(identifier: string, right: Expr) {
            this.identifier = identifier;
            this.right = right;
        }
    }
}
