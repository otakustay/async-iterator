import {expect, test} from 'vitest';
import {fromIntervalEach} from '../array.js';

test('yield every element', async () => {
    const result = [];
    const input = [1, 2, 3];
    for await (const item of fromIntervalEach(input, 1)) {
        result.push(item);
    }
    expect(result).toEqual(input);
});

test('allow zero interval', async () => {
    const result = [];
    const input = [1, 2, 3];
    for await (const item of fromIntervalEach(input, 0)) {
        result.push(item);
    }
    expect(result).toEqual(input);
});
