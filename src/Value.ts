import { StlFunction } from "./StlFunction";
import StlObject from "./StlObject";
import StlNumber from "./StlNumber";

export class Box<T> {
	value: T;
	constructor(value: T) {
		this.value = value;
	}
}

export type Value =
	| Box<StlNumber>
	| Box<boolean>
	| Box<string>
	| Box<StlFunction>
	| Box<Value[]>
	| Box<StlObject>;

export type UnboxedValue =
	| StlNumber
	| boolean
	| string
	| StlFunction
	| Value[]
	| StlObject;
