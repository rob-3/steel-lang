import { UnboxedValue } from "./Value";

let printfn = (val: UnboxedValue) => console.log(val.toString());

export function setPrintFn(fn: (val: UnboxedValue) => void) {
    printfn = fn;
}

export function stlPrint(val: UnboxedValue) {
    printfn(val);
}
