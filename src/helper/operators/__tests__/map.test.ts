import {expect, test} from 'vitest';
import {map} from '../map.js';

async function* generate() {
    yield 1;
    await Promise.resolve();
    yield 2;
}

test('map over array', async () => {
    const iterable = map(generate(), v => v * 2);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 4, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('allow return promise', async () => {
    const iterable = map(generate(), v => Promise.resolve(v * 2));
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 4, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});
