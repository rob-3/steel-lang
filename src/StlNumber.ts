/**
 * A rational number type with arbitrary precision. It might be slow, but it is
 * accurate.
 */
export default class StlNumber {
    constructor(public top: bigint, public bottom: bigint = 1n) {}

    static of(real: number | string) {
        if (typeof real === "number") {
            return new StlNumber(BigInt(real));
        } else {
            const decimalIndex = real.indexOf(".");
            if (decimalIndex === -1) {
                return new StlNumber(BigInt(real));
            }
            const decimalPlaces: bigint = BigInt(real.length - decimalIndex - 1);
            return new StlNumber(BigInt(real.slice(0, decimalIndex) + real.slice(decimalIndex + 1)), BigInt(10)**decimalPlaces);
        }
    }

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

    opposite() {
        return new StlNumber(-this.top, this.bottom);
    }

    mod(n: StlNumber): StlNumber {
        throw Error("Can't do mod for now!");
    }

    toString() {
        if (this.bottom === 1n) {
            return this.top.toString();
        }
        return `${this.top.toString()}/${this.bottom.toString()}`;
    }
}
