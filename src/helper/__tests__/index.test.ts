import {expect, test} from 'vitest';
import {over} from '../index.js';

async function* generate() {
    yield 1;
    yield 2;
    await Promise.resolve();
    yield 3;
    yield 4;
    yield 5;
}

test('filter', async () => {
    const result = over(generate()).filter(x => x % 2 === 0);
    const values = [];
    for await (const value of result) {
        values.push(value);
    }
    expect(values).toEqual([2, 4]);
});

test('map', async () => {
    const result = over(generate()).map(x => x * 2);
    const values = [];
    for await (const value of result) {
        values.push(value);
    }
    expect(values).toEqual([2, 4, 6, 8, 10]);
});

test('chunk', async () => {
    const result = over(generate()).chunk(2);
    const values = [];
    for await (const value of result) {
        values.push(value);
    }
    expect(values).toEqual([[1, 2], [3, 4], [5]]);
});

test('debounce', async () => {
    const result = over(generate()).debounce(50);
    const values = [];
    for await (const value of result) {
        values.push(value);
    }
    expect(values).toEqual([[1, 2, 3, 4, 5]]);
});

test('take', async () => {
    const result = over(generate()).take(3);
    const values = [];
    for await (const value of result) {
        values.push(value);
    }
    expect(values).toEqual([1, 2, 3]);
});

test('until', async () => {
    const result = over(generate()).until(x => x === 3);
    const values = [];
    for await (const value of result) {
        values.push(value);
    }
    expect(values).toEqual([1, 2]);
});

test('chaining multiple operators', async () => {
    const result = over(generate())
        .filter(x => x % 2 !== 0)
        .map(x => x * 2)
        .take(2);
    const values = [];
    for await (const value of result) {
        values.push(value);
    }
    expect(values).toEqual([2, 6]);
});
