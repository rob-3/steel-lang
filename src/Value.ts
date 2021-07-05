import { StlFunction } from "./StlFunction";
import StlObject from "./StlObject";

export class Box<T> {
    value: T;
    constructor(value: T) {
        this.value = value;
    }
}

export type Value =
    | Box<number>
    | Box<boolean>
    | Box<string>
    | Box<StlFunction>
    | Box<Value[]>
    | Box<StlObject>;

export type UnboxedValue =
    | number
    | boolean
    | string
    | StlFunction
    | Value[]
    | StlObject;
