import Token from "./Token";
import Scope from "./Scope";
import TokenType from "./TokenType";
import { Value, StlFunction } from "./InterpreterHelpers";
import { RuntimePanic } from "./Debug";
import { copy } from "copy-anything";
import { Location } from "./TokenizerHelpers";
import {
    plus,
    minus,
    plusPlus,
    star,
    slash,
    mod,
    and,
    or,
    greaterEqual,
    greater,
    lessEqual,
    less,
    equal,
    opposite,
    not,
    call,
    printfn,
    assertBool,
    execStmts,
    getVal,
    getState,
} from "./Interpreter";

export interface Expr {
    map(fn: (expr: Expr) => Expr): Expr;
    getDebugInfo(): Location;
    eval(scope: Scope): [Value, Scope];
    tokens: Token[];
}

function getDebugInfo(this: Expr): Location {
    const tokens = this.tokens;
    const filename = tokens[0].location.filename;

    const startSpot = tokens[0].location.start;
    const endSpot = tokens[tokens.length - 1].location.end;
    const location = new Location(startSpot, endSpot, filename);
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

    eval(scope: Scope): [Value, Scope] {
        // TODO: refactor in functional style
        const [leftVal, newScope] = this.left.eval(scope);
        const [rightVal, newScope2] = this.right.eval(newScope);
        switch (this.operator.type) {
            case TokenType.PLUS:
                return [plus(leftVal, rightVal), newScope2];
            case TokenType.MINUS:
                return [minus(leftVal, rightVal), newScope2];
            case TokenType.PLUS_PLUS:
                return [plusPlus(leftVal, rightVal), newScope2];
            case TokenType.STAR:
                return [star(leftVal, rightVal), newScope2];
            case TokenType.SLASH:
                return [slash(leftVal, rightVal), newScope2];
            case TokenType.MOD:
                return [mod(leftVal, rightVal), newScope2];
            case TokenType.AND:
                return [and(leftVal, rightVal), newScope2];
            case TokenType.OR:
                return [or(leftVal, rightVal), newScope2];
            case TokenType.GREATER_EQUAL:
                return [greaterEqual(leftVal, rightVal), newScope2];
            case TokenType.GREATER:
                return [greater(leftVal, rightVal), newScope2];
            case TokenType.LESS_EQUAL:
                return [lessEqual(leftVal, rightVal), newScope2];
            case TokenType.LESS:
                return [less(leftVal, rightVal), newScope2];
            case TokenType.EQUAL_EQUAL:
                return [equal(leftVal, rightVal), newScope2];
            default:
                throw RuntimePanic(
                    `FIXME: Unhandled operator type "${this.operator}"`
                );
        }
    }

    map(fn: (expr: Expr) => Expr): Expr {
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
    literal: number | boolean | string;
    tokens: Token[];
    constructor(literal: number | boolean | string, tokens: Token[]) {
        this.literal = literal;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        return [this.literal, scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope): [Value, Scope] {
        const [value, newScope] = this.right.eval(scope);
        switch (this.operator.type) {
            case TokenType.MINUS:
                return [opposite(value), newScope];
            case TokenType.NOT:
                return [not(value), newScope];
        }
        throw RuntimePanic("Unsupported operator type in UnaryExpr");
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope) {
        return this.expr.eval(scope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope): [Value, Scope] {
        return [scope.lookup(this.identifier), scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope): [Value, Scope] {
        return [new StlFunction(this, scope), scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope) {
        const [maybeFn, newScope] = this.callee.eval(scope);
        if (maybeFn instanceof StlFunction) {
            return call(maybeFn, this.args, newScope);
        } else {
            throw RuntimePanic(
                `Can't call ${maybeFn} because it is not a function.`
            );
        }
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope) {
        const [rightVal, newScope] = this.right.eval(scope);
        return newScope.define(this.identifier, rightVal, this.immutable);
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope) {
        const [rightVal, newScope] = this.right.eval(scope);
        return newScope.assign(this.identifier, rightVal);
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope) {
        const [printValue, newScope] = this.thingToPrint.eval(scope);
        return printfn(printValue, newScope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new PrintStmt(this.thingToPrint.map(fn), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}

export class IfStmt implements Expr {
    condition: Expr;
    body: Expr;
    elseBody: Expr | null;
    tokens: Token[];
    constructor(
        condition: Expr,
        body: Expr,
        elseBody: Expr | null,
        tokens: Token[]
    ) {
        this.condition = condition;
        this.body = body;
        this.elseBody = elseBody;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [shouldBeBool, newScope] = this.condition.eval(scope);
        if (!assertBool(shouldBeBool)) {
            throw RuntimePanic("Condition doesn't evaluate to a boolean.");
        }
        if (shouldBeBool) {
            return this.body.eval(newScope);
        } else if (this.elseBody !== null) {
            return this.elseBody.eval(newScope);
        } else {
            // FIXME: hack we need to address
            return [null, newScope];
        }
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope) {
        return execStmts(this.exprs, scope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope): [Value, Scope] {
        let conditionValue = getVal(this.condition.eval(scope));
        if (this instanceof UntilStmt) {
            conditionValue = !conditionValue;
        }
        let value: Value = null;
        while (assertBool(conditionValue) && conditionValue) {
            const pair = this.body.eval(scope);
            scope = getState(pair);
            value = getVal(pair);
            conditionValue = getVal(this.condition.eval(scope));
            if (this instanceof UntilStmt) {
                conditionValue = !conditionValue;
            }
        }
        return [value, scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

export class UntilStmt implements Expr {
    condition: Expr;
    body: Expr;
    tokens: Token[];
    constructor(condition: Expr, body: Expr, tokens: Token[]) {
        this.condition = condition;
        this.body = body;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        let conditionValue = getVal(this.condition.eval(scope));
        if (this instanceof UntilStmt) {
            conditionValue = !conditionValue;
        }
        let value: Value = null;
        while (assertBool(conditionValue) && conditionValue) {
            const pair = this.body.eval(scope);
            scope = getState(pair);
            value = getVal(pair);
            conditionValue = getVal(this.condition.eval(scope));
            if (this instanceof UntilStmt) {
                conditionValue = !conditionValue;
            }
        }
        return [value, scope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(
            new UntilStmt(
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

    eval(scope: Scope) {
        return this.value.eval(scope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope) {
        const rootExpr = this.expr;
        let [matchExprValue, newScope] = rootExpr.eval(scope);
        for (const matchCase of this.cases) {
            if (matchCase.matchExpr instanceof UnderscoreExpr) {
                return matchCase.expr.eval(newScope);
            }
            // FIXME decide if side effects are legal in a match expression
            const arr = matchCase.matchExpr.eval(newScope);
            const caseValue = getVal(arr);
            newScope = getState(arr);
            if (equal(caseValue, matchExprValue)) {
                return matchCase.expr.eval(newScope);
            }
        }
        throw RuntimePanic("Pattern match failed.");
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope): [Value, Scope] {
        // FIXME
        throw RuntimePanic("Tried to evaluate an UnderscoreExpr");
    }

    map(fn: (expr: Expr) => Expr): Expr {
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

    eval(scope: Scope) {
        return this.definition.eval(scope);
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new FunctionDefinition(copy(this.definition), this.tokens));
    }

    getDebugInfo = getDebugInfo;
}

export class IndexExpr implements Expr {
    arr: string;
    index: Expr;
    tokens: Token[];

    constructor(arr: string, index: Expr, tokens: Token[]) {
        this.arr = arr;
        this.index = index;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const [index, newScope] = this.index.eval(scope);
        if (typeof index !== "number") {
            // FIXME we probably should throw every RuntimePanic since
            // TypeScript isn't smart enough to know we throw
            throw RuntimePanic(
                "Indexing expression must evaluate to a number!"
            );
        }
        const array = newScope.lookup(this.arr);
        if (!Array.isArray(array)) {
            throw RuntimePanic(`${this.arr} is not an array!`);
        }
        return [array[index], newScope];
    }

    map(fn: (expr: Expr) => Expr): Expr {
        return fn(new IndexExpr(copy(this.arr), this.index, copy(this.tokens)));
    }

    getDebugInfo = getDebugInfo;
}

export class ArrayLiteral implements Expr {
    exprs: Expr[];
    tokens: Token[];

    constructor(exprs: Expr[], tokens: Token[]) {
        this.exprs = exprs;
        this.tokens = tokens;
    }

    eval(scope: Scope): [Value, Scope] {
        const resolved: Value[] = [];
        const newScope = this.exprs.reduce((acc: Scope, cur: Expr) => {
            const [val, scope]: [Value, Scope] = cur.eval(acc);
            resolved.push(val);
            return scope;
        }, scope);
        return [resolved, newScope];
    }

    map(fn: (expr: Expr) => Expr) {
        return new ArrayLiteral(
            this.exprs.map((e) => e.map(fn)),
            copy(this.tokens)
        );
    }

    getDebugInfo = getDebugInfo;
}

/*
export class FailedParse implements Expr {
    map(_: (expr: Expr) => Expr) {
        return this;
    }

    getDebugInfo = () => null;
}
*/
