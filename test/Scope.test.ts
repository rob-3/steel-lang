import { stlEval } from "../src/Interpreter";
import Scope from "../src/Scope";
import { Box } from "../src/Value";
import StlNumber from '../src/StlNumber';

describe("class Scope", () => {
    it("should retrieve values with no parents", () => {
        let scope = new Scope();
        scope.setLocal("a", [new Box(new StlNumber(49n)), false]);
        expect(scope.get("a")?.value).toEqual(new StlNumber(49n));
    });

    it("should return null if the value doesn't exist", () => {
        let scope = new Scope();
        expect(scope.get("a")?.value).toBeUndefined();
    });

    it("should defer to higher parent scope", () => {
        let parentScope = new Scope();
        let childScope = new Scope(parentScope);
        parentScope.setLocal("a", [new Box(new StlNumber(49n)), false]);
        expect(childScope.get("a")?.value).toEqual(new StlNumber(49n));
    });

    it("should throw an error when reassigning to an immutable value", () => {
        const src: string = `
        let a = 5
        let b = 10
        a = 6
        `;
        const scope = new Scope();
        expect(() => stlEval(src, scope)).toThrow(
            'Cannot assign to immutable variable "a".'
        );
    });
});
