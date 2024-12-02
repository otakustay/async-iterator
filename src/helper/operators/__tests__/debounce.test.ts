import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {debounce} from '../debounce.js';

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function* generate(interval: number) {
    yield 1;
    await wait(interval);
    yield 2;
    await wait(interval);
    yield 3;
    await wait(interval);
    yield 4;
    await wait(interval);
    yield 5;
}

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

test('group items within debounce', async () => {
    const iterable = debounce(generate(0), 30);
    const iterator = iterable[Symbol.asyncIterator]();

    await vi.advanceTimersByTimeAsync(40);
    await expect(iterator.next()).resolves.toEqual({value: [1, 2, 3, 4, 5], done: false});
});

test('split at debounce timeout', async () => {
    const iterable = debounce(generate(10), 5);
    const iterator = iterable[Symbol.asyncIterator]();

    await vi.advanceTimersByTimeAsync(10);
    await expect(iterator.next()).resolves.toEqual({value: [1], done: false});
    await vi.advanceTimersByTimeAsync(10);
    await expect(iterator.next()).resolves.toEqual({value: [2], done: false});
    await vi.advanceTimersByTimeAsync(10);
    await expect(iterator.next()).resolves.toEqual({value: [3], done: false});
    await vi.advanceTimersByTimeAsync(10);
    await expect(iterator.next()).resolves.toEqual({value: [4], done: false});
    await vi.advanceTimersByTimeAsync(10);
    await expect(iterator.next()).resolves.toEqual({value: [5], done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});
