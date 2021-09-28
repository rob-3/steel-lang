/**
 * A rational number type with arbitrary precision. It might be slow, but it is
 * accurate.
 */
export default class StlNumber {
    constructor(public top: bigint, public bottom: bigint = 1n) {}

    add(n: StlNumber) {
        if (this.bottom === n.bottom) {
            return new StlNumber(this.top + n.top, this.bottom);
        }
        return new StlNumber(this.top * n.bottom + n.top * this.bottom, this.bottom * n.bottom);
    }

    subtract(n: StlNumber) {
        if (this.bottom === n.bottom) {
            return new StlNumber(this.top - n.top, this.bottom);
        }
        return new StlNumber(this.top * n.bottom - n.top * this.bottom, this.bottom * n.bottom);
    }

    multiply(n: StlNumber) {
        return new StlNumber(this.top * n.top, this.bottom * n.bottom);
    }

    divide(n: StlNumber) {
        return new StlNumber(this.top * n.bottom, this.bottom * n.top);
    }

    toString() {
        if (this.bottom === 1n) {
            return this.top.toString();
        }
        return `${this.top.toString()}/${this.bottom.toString()}`;
    }
}
