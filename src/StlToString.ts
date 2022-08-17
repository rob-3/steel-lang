import { UnboxedValue } from "./Value.js";

export function stlToString(val: UnboxedValue): string {
	if (Array.isArray(val)) {
		return `[${val.map((boxed) => stlToString(boxed.value))}]`;
	} else {
		return val.toString();
	}
}
