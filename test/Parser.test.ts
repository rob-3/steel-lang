import parse from "../src/Parser";
import tokenize from '../src/Tokenizer';

describe("parse()", () => {
    it("should give proper error on unclosed array literal", () => {
      expect(tokenize("[").chain(parse).swap().unsafeCoerce()).toEqual([Error(
`parse error: Expected "]", got EOF
 --> <anonymous>:1:2
  |
1 |    [
  |     ^`
      )]);
    })
});
