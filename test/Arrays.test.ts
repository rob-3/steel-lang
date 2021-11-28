import parse from '../src/Parser';
import tokenize from '../src/Tokenizer';

describe("Steel arrays", () => {
    it("should not throw a parse error when assigning to array index", () => {
        expect(tokenize(`let ~a = []\na[0] = 5`).chain(parse).isRight()).toBe(true);
    })
})
