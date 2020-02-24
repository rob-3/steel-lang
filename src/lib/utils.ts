export function map(fn) {
    return function(mappable) {
        return mappable.map(fn);
    }
}

export const spread = fn => arr => fn(...arr)
