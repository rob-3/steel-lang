import { State } from "../src/lib/Monads";
import { expect } from "chai";

describe("The State Monad", () => {
    const s = JSON.stringify;
    it("should do addition with state", () => {
        // intial value of 5, initial state of 6
        let state: State<number, number> = State.of(5, 6);
        const add = (a: number, b: number) => a + b;
        expect(s(state.map(add))).to.equal(s(State.of(11, 6)));
    });
});
