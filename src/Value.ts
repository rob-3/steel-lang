import { StlFunction } from "./StlFunction";
import StlObject from "./StlObject";

export type Value = NonNullValue | null;
export type NonNullValue =
    | number
    | boolean
    | string
    | StlFunction
    | Value[]
    | StlObject;
