import {Predicate} from './interface.js';

export async function* until<T>(iterator: AsyncIterable<T>, predicate: Predicate<T>): AsyncIterable<T> {
    for await (const value of iterator) {
        const stop = await predicate(value);

        if (stop) {
            break;
        }

        yield value;
    }
}
