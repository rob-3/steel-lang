import { Node, print } from "code-red";
import { expect } from "vitest";

export const assertEqual = (node1: { node: Node } | Error, node2: Node) => {
	if (node1 instanceof Error) throw node1;
	expect(print(node1.node).code).toEqual(print(node2).code);
};
