import { Value } from "./Value";

let printfn = console.log;

export function setPrintFn(fn: (val: Value) => void) {
    printfn = fn;
}

export function stlPrint(val: Value) {
    printfn(val);
}
