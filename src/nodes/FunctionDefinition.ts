import { copy } from "copy-anything";
import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import VariableDeclarationStmt from "./VariableDeclarationStmt";

export default class FunctionDefinition implements Expr {
    definition: VariableDeclarationStmt;
    tokens: Token[];

    constructor(definition: VariableDeclarationStmt, tokens: Token[]) {
        this.definition = definition;
        this.tokens = tokens;
    }

    eval(scope: Scope) {
        return this.definition.eval(scope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new FunctionDefinition(copy(this.definition), this.tokens));
    }
}
