import { Expr } from "../Expr";
import Scope from "../Scope";
import Token from "../Token";
import VariableExpr from "./VariableExpr";
import DotAccess from "./DotAccess";
import StlObject from "../StlObject";
import { RuntimePanic } from "../Debug";
import { Value } from "../Value";

export type AssignmentLeft = VariableExpr | DotAccess;

export function isAssignmentLeft(expr: Expr): expr is AssignmentLeft {
    return expr instanceof VariableExpr || expr instanceof DotAccess;
}

export default class VariableAssignmentStmt implements Expr {
    left: AssignmentLeft;
    right: Expr;
    tokens: Token[];
    constructor(left: AssignmentLeft, right: Expr, tokens: Token[]) {
        this.left = left;
        this.right = right;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [rightVal, newScope] = this.right.eval(scope);
        if (this.left instanceof VariableExpr) {
            return newScope.assign(this.left.identifier, rightVal);
        } else if (this.left instanceof DotAccess) {
            const dotAccess: DotAccess = this.left;
            if (!(dotAccess.left instanceof VariableExpr)) {
                throw RuntimePanic("Invalid left hand side of assignment!");
            }
            const [object, newNewScope] = dotAccess.left.eval(newScope);
            if (!(object instanceof StlObject)) {
                throw RuntimePanic(`${object} is not an object!`);
            } else {
                const value: Value | undefined = object.properties.get(
                    dotAccess.right
                );
                if (value === undefined) {
                    throw RuntimePanic(
                        `Property "${dotAccess.right}" does not exist.`
                    );
                } else {
                    const isImmutable = newNewScope.getPair(
                        dotAccess.left.identifier
                    )?.[1];
                    // should be impossible
                    if (isImmutable === undefined) {
                        throw RuntimePanic(
                            "Interpreter bug: isImmutable is undefined!"
                        );
                    }
                    if (isImmutable) {
                        throw RuntimePanic(
                            "Cannot assign to property of immutable object!"
                        );
                    } else {
                        object.properties.set(dotAccess.right, rightVal);
                        return [rightVal, newNewScope];
                    }
                }
            }
        } else {
            // TODO
            throw RuntimePanic("Unsupported left side of expression");
        }
    }
}
