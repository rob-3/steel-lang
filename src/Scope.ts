import { RuntimePanic } from "./Debug";
import { StlFunction } from "./StlFunction";
import { Value, Box } from "./Value";
import FunctionExpr from "./nodes/FunctionExpr";
import PrintStmt from "./nodes/PrintStmt";
import VariableExpr from "./nodes/VariableExpr";

/**
 * A Scope represents a lexical scope in the program. Each Scope has a set of
 * bindings from identifiers (names) to Value boolean pairs. Value represents
 * any possible value a variable could have. The boolean is true if the value is
 * immutable (can't be changed) and false if the value can be changed.
 * Each Scope also has a parent Scope that it can use to resolve nonlocal variables.
 */
export default class Scope {
    // FIXME this should probably be two separate hashmaps
    bindings: Map<string, [Value, boolean]>;
    parent: Scope | null;
    constructor(parent: Scope | null = null) {
        this.bindings = new Map();
        this.parent = parent;
        // library print function
        // FIXME null token lists
        const print = new StlFunction(
            new FunctionExpr(
                ["value"],
                new PrintStmt(new VariableExpr("value", []), []),
                []
            ),
            this
        );
        this.bindings.set("print", [new Box(print), false]);
    }

    get(identifier: string): Value | null {
        const pair = this.getPair(identifier);
        if (pair === null) {
            return pair;
        } else {
            return pair[0];
        }
    }

    /**
     * getPair looks up a identifier in the current Scope and returns the Value
     * and whether it is immutable as a pair. If the identifier is invalid,
     * returns null.
     *
     * @param identifier name to look up
     * @return a pair containing the Value and immutability status, or null
     */
    getPair(identifier: string): [Value, boolean] | null {
        const value = this.bindings.get(identifier);
        if (value === undefined) {
            if (this.parent !== null) {
                return this.parent.getPair(identifier);
            } else {
                return null;
            }
        } else {
            return value;
        }
    }

    setLocal(identifier: string, [value, immutable]: [Value, boolean]): void {
        this.bindings.set(identifier, [value, immutable]);
    }

    set(identifier: string, [value, immutable]: [Value, boolean]): void {
        if (this.bindings.has(identifier)) {
            this.setLocal(identifier, [value, immutable]);
        } else {
            if (this.parent !== null && this.parent.has(identifier)) {
                this.parent.setLocal(identifier, [value, immutable]);
            } else {
                if (this.parent) {
                    this.parent.set(identifier, [value, immutable]);
                } else {
                    this.bindings.set(identifier, [value, immutable]);
                }
            }
        }
    }

    assign(key: string, evaluatedExpr: Value): [Value, Scope] {
        const variable: [Value, boolean] | null = this.getPair(key);
        if (variable === null) {
            throw RuntimePanic(
                `Cannot assign to undefined variable "${key}". Did you forget to use the let keyword?`
            );
        } else {
            const immutable = variable[1];
            if (!immutable) {
                variable[0].value = evaluatedExpr.value;
                return [evaluatedExpr, this];
            } else {
                throw RuntimePanic(
                    `Cannot assign to immutable variable "${key}".`
                );
            }
        }
    }

    has(key: string): boolean {
        return this.bindings.has(key);
    }

    define(
        key: string,
        evaluatedExpr: Value,
        immutable: boolean
    ): [Value, Scope] {
        if (this.has(key)) {
            throw RuntimePanic(`Cannot redefine immutable variable ${key}.`);
        } else {
            const newScope = new LocalScope(this);
            newScope.setLocal(key, [evaluatedExpr, immutable]);
            // Allow for recursive functions
            if (evaluatedExpr.value instanceof StlFunction) {
                evaluatedExpr.value.scope = newScope;
            }
            return [evaluatedExpr, newScope];
        }
    }

    lookup(identifier: string): Value {
        const val = this.get(identifier);
        if (val === null) {
            throw RuntimePanic(`Variable "${identifier}" is not defined.`);
        } else {
            return val;
        }
    }
}

class LocalScope extends Scope {
    has(key: string): boolean {
        if (this.bindings.has(key)) {
            return true;
        } else if (this.parent !== null && this.parent.has(key)) {
            return true;
        } else {
            return false;
        }
    }
}
