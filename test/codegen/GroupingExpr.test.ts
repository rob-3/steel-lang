import { Node, x } from "code-red";
import { describe, it } from "vitest";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import { GroupingExpr } from "../../src/nodes/GroupingExpr";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import StlNumber from "../../src/StlNumber";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";

// FIXME
describe("GroupingExpr codegen", () => {
	it("should compile parenthesized expressions", () => {
		const node: Node = GroupingExpr(
			BinaryExpr(
				PrimaryExpr(StlNumber.of(2)),
				TokenType.PLUS,
				PrimaryExpr(StlNumber.of(2))
			)
		).estree();
		assertEqual(
			node,
			x`stlAdd({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});
});
