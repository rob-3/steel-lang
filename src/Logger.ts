import { UnboxedValue } from "./Value";

let printfn = console.log;

export function setPrintFn(fn: (val: UnboxedValue) => void) {
    printfn = fn;
}

export function stlPrint(val: UnboxedValue) {
    printfn(val);
}
