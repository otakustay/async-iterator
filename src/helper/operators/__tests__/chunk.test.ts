import {expect, test} from 'vitest';
import {chunk} from '../chunk.js';

async function* generate() {
    yield 1;
    await Promise.resolve();
    yield 2;
    yield 3;
    await Promise.resolve();
    yield 4;
    yield 5;
}

async function* empty() {
}

test('chunk with size 2', async () => {
    const iterable = chunk(generate(), 2);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: [1, 2], done: false});
    await expect(iterator.next()).resolves.toEqual({value: [3, 4], done: false});
    await expect(iterator.next()).resolves.toEqual({value: [5], done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('chunk with size larger than input', async () => {
    const iterable = chunk(generate(), 10);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: [1, 2, 3, 4, 5], done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('chunk with size 1', async () => {
    const iterable = chunk(generate(), 1);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: [1], done: false});
    await expect(iterator.next()).resolves.toEqual({value: [2], done: false});
    await expect(iterator.next()).resolves.toEqual({value: [3], done: false});
    await expect(iterator.next()).resolves.toEqual({value: [4], done: false});
    await expect(iterator.next()).resolves.toEqual({value: [5], done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('chunk with empty input', async () => {
    const iterable = chunk(empty(), 2);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});
