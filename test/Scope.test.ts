import Scope from "../src/Scope";
import { expect } from "chai";

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
});
