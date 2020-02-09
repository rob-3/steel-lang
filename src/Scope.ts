export default class Scope {
    bindings: Map<string, [any, boolean]>;
    parentScope: Scope;
    constructor(parentScope: Scope = null) {
        this.bindings = new Map();
        this.parentScope = parentScope;
    }

    get(identifier: string) {
        let value = this.bindings.get(identifier);
        if (value === undefined) {
            if (this.parentScope !== null) {
                return this.parentScope.get(identifier);
            } else {
                return null
            }
        } else {
            return value[0];
        }
    }

    set(identifier: string, [value, immutable]: [any, boolean]) {
        this.bindings.set(identifier, [value, immutable]);
    }

    has(key: string) {
        return this.bindings.has(key);
    }
}
