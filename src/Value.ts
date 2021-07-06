import { StlFunction } from "./StlFunction";
import StlObject from "./StlObject";

export type Value =
    | number
    | boolean
    | string
    | StlFunction
    | Value[]
    | StlObject;
