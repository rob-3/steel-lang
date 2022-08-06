import { x } from "code-red";
import { describe, it } from "vitest";
import { IndexExpr } from "../../src/nodes/IndexExpr";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import StlNumber from "../../src/StlNumber";
import { assertEqual } from "../Helpers";

describe("IndexExpr codegen", () => {
	it("should compile a basic literal index", () => {
		const node = IndexExpr("array", PrimaryExpr(StlNumber.of(2))).estree();
		assertEqual(
			node,
			x`stlUnwrap(array)[stlUnwrap({stlValue: {top: 2n, bottom: 1n}})]`
		);
	});
});
