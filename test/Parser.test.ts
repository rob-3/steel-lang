import tokenize from "../src/Tokenizer";
import parse from "../src/Parser";
import { expect } from "chai";

describe("parse()", () => {
    it("should throw if a statement isn't terminated by a newline", () => {
        let src = "let 2 = 34 let 3 = 14"
        expect(() => parse(tokenize(src))).to.throw("Expected a newline!");
    });
});
