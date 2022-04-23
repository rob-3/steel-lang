import { x } from "code-red";
import { describe, expect, it } from "vitest";
import {
	MatchCase,
	MatchStmt,
	UnderscoreExpr,
} from "../../src/nodes/MatchStmt";
import { PrimaryExpr } from "../../src/nodes/PrimaryExpr";
import StlNumber from "../../src/StlNumber";
import { assertEqual } from "../Helpers";

describe("MatchStmt codegen", () => {
	it("should compile match statements with catch-all", () => {
		const node = MatchStmt(PrimaryExpr(StlNumber.of(3)), [
			MatchCase(PrimaryExpr(StlNumber.of(2)), PrimaryExpr("it was 2")),
			MatchCase(PrimaryExpr(StlNumber.of(3)), PrimaryExpr("it was 3")),
			MatchCase(UnderscoreExpr(), PrimaryExpr("it was not 2")),
		]).estree();
		if (node instanceof Error) throw node;
		assertEqual(
			node,
			x`((val) => {
				if (stlEqual(val, {stlValue: {top: 2n, bottom: 1n}})) return {stlValue: "it was 2"};
				if (stlEqual(val, {stlValue: {top: 3n, bottom: 1n}})) return {stlValue: "it was 3"};
				return {stlValue: "it was not 2"};
			})({stlValue: {top: 3n, bottom: 1n}})`
		);
	});

	it("should compile match statements without catch-all", () => {
		const node = MatchStmt(PrimaryExpr(StlNumber.of(3)), [
			MatchCase(PrimaryExpr(StlNumber.of(2)), PrimaryExpr("it was 2")),
			MatchCase(PrimaryExpr(StlNumber.of(3)), PrimaryExpr("it was 3")),
		]).estree();
		if (node instanceof Error) throw node;
		assertEqual(
			node,
			x`((val) => {
				if (stlEqual(val, {stlValue: {top: 2n, bottom: 1n}})) return {stlValue: "it was 2"};
				if (stlEqual(val, {stlValue: {top: 3n, bottom: 1n}})) return {stlValue: "it was 3"};
				return null;
			})({stlValue: {top: 3n, bottom: 1n}})`
		);
	});

	it("should compile match statements with a single item", () => {
		const node = MatchStmt(PrimaryExpr(StlNumber.of(3)), [
			MatchCase(PrimaryExpr(StlNumber.of(2)), PrimaryExpr("it was 2")),
		]).estree();
		if (node instanceof Error) throw node;
		assertEqual(
			node,
			x`((val) => {
				if (stlEqual(val, {stlValue: {top: 2n, bottom: 1n}})) return {stlValue: "it was 2"};
				return null;
			})({stlValue: {top: 3n, bottom: 1n}})`
		);
	});

	it("should not compile match statements with no items", () => {
		const err = MatchStmt(PrimaryExpr(StlNumber.of(3)), []).estree();
		expect(err instanceof Error).toBe(true);
	});
});
