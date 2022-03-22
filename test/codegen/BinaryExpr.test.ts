import { x } from "code-red";
import { BinaryExpr } from "../../src/nodes/BinaryExpr";
import { StlBoolExpr, StlNumberExpr, StlStringExpr } from "../../src/nodes/PrimaryExpr";
import StlNumber from "../../src/StlNumber";
import Token from "../../src/Token";
import TokenType from "../../src/TokenType";
import { assertEqual } from "../Helpers";
import { it, describe } from "vitest";

describe("BinaryExpr codegen", () => {
	it("should compile additions", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.PLUS } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlAdd({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile subtractions", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.MINUS } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlSubtract({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile multiplications", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.STAR } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlMultiply({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile divisions", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.SLASH } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlDivide({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile modulus", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.MOD } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlMod({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile logical AND", () => {
		const node = BinaryExpr(
			StlBoolExpr(true, []),
			{ type: TokenType.AND } as Token,
			StlBoolExpr(false, []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlLogicalAnd({stlValue: true}, {stlValue: false})`
		);
	});

	it("should compile logical OR", () => {
		const node = BinaryExpr(
			StlBoolExpr(true, []),
			{ type: TokenType.OR } as Token,
			StlBoolExpr(false, []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlLogicalOr({stlValue: true}, {stlValue: false})`
		);
	});

	it("should compile concatenation", () => {
		const node = BinaryExpr(
			StlStringExpr("hello, ", []),
			{ type: TokenType.PLUS_PLUS } as Token,
			StlStringExpr("world", []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlConcat({stlValue: "hello, "}, {stlValue: "world"})`
		);
	});

	it("should compile greater equal", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.GREATER_EQUAL } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlGreaterEqual({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile greater", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.GREATER } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlGreater({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile less", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.LESS } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlLess({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile less equal", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.LESS_EQUAL } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlLessEqual({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});

	it("should compile equality", () => {
		const node = BinaryExpr(
			StlNumberExpr(StlNumber.of(2), []),
			{ type: TokenType.EQUAL_EQUAL } as Token,
			StlNumberExpr(StlNumber.of(2), []),
			[]
		).estree();
		assertEqual(
			node,
			x`stlEqual({stlValue: {top: 2n, bottom: 1n}}, {stlValue: {top: 2n, bottom: 1n}})`
		);
	});
});
