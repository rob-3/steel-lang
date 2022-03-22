import { Node, print } from "code-red";
import { expect } from "vitest";

export const assertEqual = (node1: Node, node2: Node) => {
	expect(print(node1).code).toEqual(print(node2).code);
};
