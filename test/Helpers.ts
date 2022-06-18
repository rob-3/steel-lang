import { Node, print } from "code-red";
import { expect } from "vitest";

export const assertEqual = (node1: { node?: Node, errors?: Error[] } | Error, node2: Node) => {
	if (node1 instanceof Error) throw node1;
	if (!node1.node) throw Error("Node was empty!");
	if (node1.errors && node1.errors.length > 0) throw node1.errors;
	expect(print(node1.node).code).toEqual(print(node2).code);
};
