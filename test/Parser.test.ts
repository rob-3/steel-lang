import parse from "../src/Parser.js";
import tokenize from "../src/Tokenizer.js";
import { describe, it, expect } from "vitest";

describe("parse()", () => {
	it("should give proper error on unclosed array literal", () => {
		expect(tokenize("[").chain(parse).swap().unsafeCoerce()).toEqual([
			Error(
				`parse error: Expected "]", got EOF
 --> <anonymous>:1:2
  |
1 |    [
  |     ^`
			),
		]);
	});
	it("should give proper error on unfinished assignment", () => {
		expect(tokenize("let a = ").chain(parse).swap().unsafeCoerce()).toEqual([
			Error(
				`parse error: Reached EOF before reading a primary
 --> <anonymous>:1:7
  |
1 |    let a = 
  |          ^`
			),
		]);
	});
	it("should give proper error on let all alone", () => {
		expect(tokenize("let").chain(parse).swap().unsafeCoerce()).toEqual([
			Error(
				`parse error: "let" is used to create a variable, but instead you put "EOF"
 --> <anonymous>:1:4
  |
1 |    let
  |       ^`
			),
		]);
	});
	it("should give proper error on using let as variable", () => {
		expect(tokenize("let let =").chain(parse).swap().unsafeCoerce()).toEqual([
			Error(
				`parse error: Using "let" as a variable name is not allowed
 --> <anonymous>:1:5
  |
1 |    let let =
  |        ^^^`
			),
		]);
	});
});
