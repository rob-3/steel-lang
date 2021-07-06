import { StlFunction } from "./StlFunction";
import StlObject from "./StlObject";

export type Value = NonNullValue;
export type NonNullValue =
    | number
    | boolean
    | string
    | StlFunction
    | Value[]
    | StlObject;
