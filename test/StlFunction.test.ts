import parse from "../src/Parser";
import tokenize from "../src/Tokenizer";

it("should serialize anonymous function to standard string", () => {
	expect(
		tokenize("() -> 2")
			.chain(parse)
			.map((values) => values[0].toString())
			.unsafeCoerce()
	).toBe("[anonymous function]");
});
