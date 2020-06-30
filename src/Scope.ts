import { Value } from "./InterpreterHelpers";

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

    assign(identifier: string, [value, immutable]: [Value, boolean]): void {
        if (this.bindings.has(identifier)) {
            this.setLocal(identifier, [value, immutable]);
        } else {
            if (this.parentScope !== null && this.parentScope.has(identifier)) {
                this.parentScope.setLocal(identifier, [value, immutable]);
            } else {
                this.parentScope.assign(identifier, [value, immutable]);
            }
        }
    }

    has(key: string): boolean {
        return this.bindings.has(key);
    }
}
