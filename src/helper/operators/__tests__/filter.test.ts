import {expect, test} from 'vitest';
import {filter} from '../filter.js';

async function* generate() {
    yield 1;
    await Promise.resolve();
    yield 2;
    yield 3;
    yield 4;
}

test('filter even numbers', async () => {
    const iterable = filter(generate(), v => v % 2 === 0);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 4, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('allow predicate to return promise', async () => {
    const iterable = filter(generate(), v => Promise.resolve(v % 2 === 0));
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 4, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('filter with async predicate', async () => {
    const iterable = filter(generate(), async v => {
        await Promise.resolve(); // 模拟异步操作
        return v > 2;
    });
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 3, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 4, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('filter all elements', async () => {
    const iterable = filter(generate(), () => true);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 3, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 4, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('filter no elements', async () => {
    const iterable = filter(generate(), () => false);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});
