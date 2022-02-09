import { Value } from "./Value";

export default class StlObject {
	properties: Map<string, Value>;

	constructor(properties: Map<string, Value>) {
		this.properties = properties;
	}
}
