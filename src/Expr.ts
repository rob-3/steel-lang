import Token from "./Token";
import { BlockStmt } from "./Stmt";
import Scope from "./Scope";
import { stmtExec, exprEval } from "./Interpreter";

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
    body: BlockStmt;
    constructor(args: string[], body: BlockStmt) {
        super();
        this.args = args;
        this.body = body;
    }

    call(callArgs: Expr[], scope: Scope) {
        let functionScope = new Scope(scope);
        for (let i = 0; i < this.args.length; i++) {
            // FIXME typecheck args
            functionScope.set(this.args[i], [exprEval(callArgs[i], scope), false]);
        }
        stmtExec(this.body, functionScope);
    }
}

export class CallExpr extends Expr {
    identifier: string;
    args: Expr[];
    constructor(identifier: string, args: Expr[]) {
        super();
        this.identifier = identifier;
        this.args = args;
    }
}
