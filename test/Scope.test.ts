import { expect } from "chai";
import { stlEval } from "../src/Interpreter";
import Scope from "../src/Scope";

describe("class Scope", () => {
    it("should retrieve values with no parents", () => {
        let scope = new Scope();
        scope.setLocal("a", [49, false]);
        expect(scope.get("a")).to.equal(49);
    });

    it("should return null if the value doesn't exist", () => {
        let scope = new Scope();
        expect(scope.get("a")).to.equal(null);
    });

    it("should defer to higher parent scope", () => {
        let parentScope = new Scope();
        let childScope = new Scope(parentScope);
        parentScope.setLocal("a", [49, false]);
        expect(childScope.get("a")).to.equal(49);
    });

    it("should throw an error when reassigning to an immutable value", () => {
        const src: string = `
        let a = 5
        let b = 10
        a = 6
        `;
        const scope = new Scope();
        expect(() => stlEval(src, scope)).to.throw(
            'Cannot assign to immutable variable "a".'
        );
    });
});
