import { x } from "code-red";
import { assertEqual } from "../Helpers";
import { it, describe } from "vitest";
import { ArrayLiteral } from "../../src/nodes/ArrayLiteral";
import { StlNumberExpr } from "../../src/nodes/PrimaryExpr";
import StlNumber from "../../src/StlNumber";

describe("ArrayLiteral codegen", () => {
	it("should compile arrays", () => {
		const node = ArrayLiteral(
			[StlNumberExpr(StlNumber.of("2.5"), []), StlNumberExpr(StlNumber.of(5), [])],
			[]
		).estree();
		assertEqual(node, x`{stlValue: [{stlValue: {top: 5n, bottom: 2n}}, {stlValue: {top: 5n, bottom: 1n}}]}`);
	});
});
