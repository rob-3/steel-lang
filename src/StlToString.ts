import { StlFunction } from "./StlFunction.js";
import StlObject from "./StlObject.js";
import { UnboxedValue } from "./Value.js";

export function stlToString(val: UnboxedValue): string {
	if (Array.isArray(val)) {
		return `[${val.map((boxed) => stlToString(boxed.value)).join(", ")}]`;
	} else if (val instanceof StlFunction) {
		return "<function>";
	} else if (val instanceof StlObject) {
		return `{ ${[...val.properties.entries()]
			.map(([key, value]) => `${key}: ${stlToString(value.value)}`)
			.join(", ")} }`;
	} else {
		return val.toString();
	}
}
