import { Value, StlFunction } from "./InterpreterHelpers";
import { Scoped } from "./Interpreter";
import { RuntimePanic } from "./Debug";

export default class Scope {
    bindings: Map<string, [Value, boolean]>;
    parentScope: Scope;
    constructor(parentScope: Scope = null) {
        this.bindings = new Map();
        this.parentScope = parentScope;
    }

    get(identifier: string): Value {
        let value = this.bindings.get(identifier);
        if (value === undefined) {
            if (this.parentScope !== null) {
                return this.parentScope.get(identifier);
            } else {
                return null;
            }
        } else {
            return value[0];
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
                this.parentScope.set(identifier, [value, immutable]);
            }
        }
    }

    assign(key: string, evaluatedExpr: Value): Scoped<Value> {
        let variable = this.get(key);
        if (variable === null) {
            throw RuntimePanic(`Cannot assign to undefined variable "${key}".`);
        } else {
            let immutable = variable[1];
            if (!immutable) {
                this.set(key, [evaluatedExpr, false]);
                return [evaluatedExpr, this];
            } else {
                throw RuntimePanic(`Cannot assign to immutable variable "${key}".`);
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
    ): Scoped<Value> {
        if (this.has(key)) {
            throw RuntimePanic(`Cannot redefine immutable variable ${key}.`);
        } else {
            let newScope = new Scope(this);
            newScope.setLocal(key, [evaluatedExpr, immutable]);
            // Allow for recursive functions
            if (evaluatedExpr instanceof StlFunction) {
                evaluatedExpr.scope = newScope;
            }
            return [evaluatedExpr, newScope];
        }
    }

    lookup(identifier: string): Value {
        let val = this.get(identifier);
        if (val === null) {
            throw RuntimePanic(`Variable "${identifier}" is not defined.`);
        } else {
            return val;
        }
    }
}
