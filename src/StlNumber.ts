/**
 * A rational number type with arbitrary precision. It might be slow, but it is
 * accurate.
 */
export default class StlNumber {
    top: bigint;
    bottom: bigint;

    constructor(top: bigint, bottom: bigint = 1n) {
        if (bottom === 0n) {
            throw Error("Cannot use zero as denominator!");
        }
        const divisor = gcd(top, bottom);
        top /= divisor;
        bottom /= divisor;
        if (bottom < 0) {
            this.top = -top;
            this.bottom = -bottom;
        } else {
            this.top = top;
            this.bottom = bottom;
        }
    }

    static of(real: number | string) {
        if (typeof real === "number") {
            return new StlNumber(BigInt(real));
        } else {
            const decimalIndex = real.indexOf(".");
            if (decimalIndex === -1) {
                return new StlNumber(BigInt(real));
            }
            const decimalPlaces: bigint = BigInt(
                real.length - decimalIndex - 1
            );
            return new StlNumber(
                BigInt(
                    real.slice(0, decimalIndex) + real.slice(decimalIndex + 1)
                ),
                BigInt(10) ** decimalPlaces
            );
        }
    }

    add(n: StlNumber) {
        if (this.bottom === n.bottom) {
            return new StlNumber(this.top + n.top, this.bottom);
        }
        return new StlNumber(
            this.top * n.bottom + n.top * this.bottom,
            this.bottom * n.bottom
        );
    }

    subtract(n: StlNumber) {
        if (this.bottom === n.bottom) {
            return new StlNumber(this.top - n.top, this.bottom);
        }
        return new StlNumber(
            this.top * n.bottom - n.top * this.bottom,
            this.bottom * n.bottom
        );
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

    equals(n: StlNumber) {
        return this.top === n.top && this.bottom === n.bottom;
    }
}

function gcd(a: bigint, b: bigint): bigint {
    a = abs(a);
    b = abs(b);
    while (b > 0) {
        let temp = a;
        a = b % a;
        b = temp;
    }
    return a;
}

function abs(a: bigint): bigint {
    return a >= 0 ? a : -a;
}
