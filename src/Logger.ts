import { UnboxedValue } from "./Value.js";

export function toString(val: UnboxedValue): string {
	if (Array.isArray(val)) {
		return `[${val.map((boxed) => toString(boxed.value))}]`;
	} else {
		return val.toString();
	}
}
