import { StlFunction } from "./StlFunction";
export type Value = NonNullValue | null;
export type NonNullValue =
    | number
    | boolean
    | string
    | StlFunction
    | Value[]
    | StlObject;
