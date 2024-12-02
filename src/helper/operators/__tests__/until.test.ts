import {expect, test} from 'vitest';
import {until} from '../until.js';

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

test('until with predicate stopping at 3', async () => {
    const iterable = until(generate(), value => value === 3);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('allow predicate to return promise', async () => {
    const iterable = until(generate(), value => Promise.resolve(value === 3));
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('until with predicate never met', async () => {
    const iterable = until(generate(), value => value > 10);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 3, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 4, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 5, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('until with predicate met immediately', async () => {
    const iterable = until(generate(), value => value >= 2);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('until with empty input', async () => {
    const iterable = until(empty(), () => true);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});
