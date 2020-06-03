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

export class State<S, A> {
    _fn: (state: S) => [A, S]

    constructor(fn: (state: S) => [A, S]) {
        this._fn = fn;
    }

    static of = <S, A>(fn: (state: S) => [A, S]) => new State(fn);
        
    flatMap = <B>(fn: (value: A, state: S) => [B, S]): State<S, B> => {
        return State.of<S, B>((state: S): [B, S] => {
            let [value, newState]: [A, S] = this._fn(state);
            return fn(value, newState);
        });
    }

    map = <B>(fn: (value: A) => B): State<S, B> => {
        return State.of<S, B>((state: S): [B, S] => {
            let [value, newState]: [A, S] = this._fn(state);
            return [fn(value), newState];
        });
    }

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
