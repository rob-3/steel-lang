export const compose = (...fns) => (value) => fns.reduce((acc, cur) => cur(acc), value);
