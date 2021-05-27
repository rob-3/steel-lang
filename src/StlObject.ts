import { Value } from "./Value";

export default class StlObject {
    map: Map<string, Value>;

    constructor(map: Map<string, Value>) {
        this.map = map;
    }
}
