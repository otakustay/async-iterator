import {expect, test} from 'vitest';
import {take} from '../take.js';

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

test('take 3 items', async () => {
    const iterable = take(generate(), 3);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 3, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('take more items than available', async () => {
    const iterable = take(generate(), 10);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 3, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 4, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 5, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('take 0 items', async () => {
    const iterable = take(generate(), 0);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('take negative number of items', async () => {
    const iterable = take(generate(), -1);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('take from empty input', async () => {
    const iterable = take(empty(), 5);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});
