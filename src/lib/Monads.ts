export class Maybe<T> {
    value: T;
    isItThere: boolean;
    constructor(value: T) {
        if (value !== null) {
            this.value = value;
            this.isItThere = true;
        } else {
            this.isItThere = false;
        }
    }

    static of = value => new Maybe(value);

    map(fn) {
        if (this.isItThere) {
            return Maybe.of(fn(this.value));
        } else {
            return this;
        }
    }

    flatMap = fn => this.map(fn).value;
}

export class State<R, S> {
    value: R;
    state: S;
    constructor(value: R, state: S) {
        this.state = state;
        this.value = value;
    }

    static of = <U, V>(value: U, state: V) => new State<U, V>(value, state);

    map = <T>(fn: (a: R, b: S) => T): State<T, S> => 
        State.of(fn(this.value, this.state), this.state);

    flatMap = <T>(fn: (a: R, b: S) => State<T, S>): State<T, S> => 
        fn(this.value, this.state)
}

export class ID<T> {
    value: T;

    constructor(value: T) {
        this.value = value;
    }

    static of = <T>(value: T) => new ID(value);

    map = <S>(fn: (a: T) => S): ID<S> => 
        ID.of(fn(this.value))

    flatMap = <S>(fn: (a: T) => ID<S>): ID<S> => 
        fn(this.value)
}
