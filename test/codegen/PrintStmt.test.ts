import { x } from "code-red";
import { describe, it } from "vitest";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import { PrintStmt } from "../../src/nodes/PrintStmt";
import StlNumber from "../../src/StlNumber";
import { assertEqual } from "../Helpers";

describe("PrintStmt codegen", () => {
	it("should compile a print statement", () => {
		const node = PrintStmt(() => {})(PrimaryExpr(StlNumber.of(5))).estree();
		assertEqual(node, x`stlPrint({stlValue: {top: 5n, bottom: 1n}})`);
	});
});
