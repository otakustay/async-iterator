import {Predicate} from './interface.js';

export async function* filter<T>(iterator: AsyncIterable<T>, fn: Predicate<T>): AsyncIterable<T> {
    for await (const value of iterator) {
        const emit = await fn(value);
        if (emit) {
            yield value;
        }
    }
}
