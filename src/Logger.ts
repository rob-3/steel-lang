import { UnboxedValue } from "./Value";

let printfn = (val: UnboxedValue) => console.log(toString(val));

export function setPrintFn(fn: (val: UnboxedValue) => void) {
	printfn = fn;
}

export function stlPrint(val: UnboxedValue) {
	printfn(val);
}

function toString(val: UnboxedValue): string {
	if (Array.isArray(val)) {
		return `[${val.map((boxed) => toString(boxed.value))}]`;
	} else {
		return val.toString();
	}
}
