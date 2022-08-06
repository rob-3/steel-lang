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
		expect(tokenize("var a <- ").chain(parse).swap().unsafeCoerce()).toEqual([
			Error(
				`parse error: Reached EOF before reading a primary
 --> <anonymous>:1:7
  |
1 |    var a <- 
  |          ^^`
			),
		]);
	});
	it("should give proper error on var all alone", () => {
		expect(tokenize("var").chain(parse).swap().unsafeCoerce()).toEqual([
			Error(
				`parse error: "var" is used to create a variable, but instead you put "EOF"
 --> <anonymous>:1:4
  |
1 |    var
  |       ^`
			),
		]);
	});
	it("should give proper error on using var as variable", () => {
		expect(tokenize("var var <-").chain(parse).swap().unsafeCoerce()).toEqual([
			Error(
				`parse error: Using "var" as a variable name is not allowed
 --> <anonymous>:1:5
  |
1 |    var var <-
  |        ^^^`
			),
		]);
	});
	it("should error on multiple adjacent identifiers", () => {
		expect(tokenize("hi hi").chain(parse).extract()).toEqual([
			Error(`parse error: Unexpected identifier ahead
 --> <anonymous>:1:4
  |
1 |    hi hi
  |       ^^`),
		]);
	});
});
