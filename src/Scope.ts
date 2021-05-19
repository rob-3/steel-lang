import { RuntimePanic } from "./Debug";
import { StlFunction } from "./StlFunction";
import { Value } from "./Value";

/**
 * A Scope represents a lexical scope in the program. Each Scope has a set of
 * bindings from identifiers (names) to Value boolean pairs. Value represents
 * any possible value a variable could have. The boolean is true if the value is
 * immutable (can't be changed) and false if the value can be changed.
 * Each Scope also has a parent Scope that it can use to resolve nonlocal variables.
 */
export default class Scope {
    bindings: Map<string, [Value, boolean]>;
    parentScope: Scope | null;
    constructor(parentScope: Scope | null = null) {
        this.bindings = new Map();
        this.parentScope = parentScope;
    }

    get(identifier: string): Value | null {
        const pair = this.getPair(identifier);
        if (pair == null) {
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
            if (this.parentScope !== null) {
                return this.parentScope.getPair(identifier);
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
            if (this.parentScope !== null && this.parentScope.has(identifier)) {
                this.parentScope.setLocal(identifier, [value, immutable]);
            } else {
                if (this.parentScope) {
                    this.parentScope.set(identifier, [value, immutable]);
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
                `Cannot assign to undefined variable "${key}". Did you forget to use the var keyword?`
            );
        } else {
            const immutable = variable[1];
            if (!immutable) {
                this.set(key, [evaluatedExpr, false]);
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
            if (evaluatedExpr instanceof StlFunction) {
                evaluatedExpr.scope = newScope;
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
        } else if (this.parentScope !== null && this.parentScope.has(key)) {
            return true;
        } else {
            return false;
        }
    }
}
