import chai = require("chai");
import spies = require("chai-spies");
chai.use(spies);
const expect = chai.expect;
import { generateMessage } from "../src/Debug";
import { Location } from "../src/TokenizerHelpers";

/*
 * The standard error format, shamelessly stolen from rust
 */

/*
error: 
  --> ${filename}:${line}:${column}
   |
26 |        ${bad_line}
   |        ^^^^^
*/

describe("debugging tools", () => {
    it("should print an error object correctly", () => {
        expect(
            generateMessage({
                message: "hi",
                location: new Location([4, 1], [4, 5], "hi"),
                badLine: "evil line!"
            })
        ).to.equal(
            `error: hi 
 --> hi:4:1
  |
4 |    evil line!
  |    ^^^^
`
        );
    });
});
