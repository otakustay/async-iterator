import {Transform} from './interface.js';

export async function* map<T, R>(iterator: AsyncIterable<T>, fn: Transform<T, R>): AsyncIterable<R> {
    for await (const value of iterator) {
        const result = await fn(value);
        yield result;
    }
}
