export type Predicate<T> = (value: T) => boolean | Promise<boolean>;

export type Transform<T, R> = (value: T) => R | Promise<R>;
