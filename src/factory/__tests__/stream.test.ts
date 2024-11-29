import {Readable} from 'node:stream';
import {test, expect} from 'vitest';
import {fromStream} from '../stream.js';

async function* sequence() {
    yield '1';
    await new Promise(resolve => setTimeout(resolve, 0));
    yield '2';
    await new Promise(resolve => setTimeout(resolve, 0));
    yield '3';
}

async function* error() {
    yield '1';
    await new Promise(resolve => setTimeout(resolve, 0));
    throw Error('Error');
}

test('stream read', async () => {
    const stream = Readable.from(sequence(), {objectMode: false, autoDestroy: true});
    const iterable = fromStream<Buffer>(stream);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: Buffer.from('1'), done: false});
    await expect(iterator.next()).resolves.toEqual({value: Buffer.from('2'), done: false});
    await expect(iterator.next()).resolves.toEqual({value: Buffer.from('3'), done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('stream error', async () => {
    const stream = Readable.from(error(), {objectMode: false, autoDestroy: true});
    const iterable = fromStream<Buffer>(stream);
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: Buffer.from('1'), done: false});
    await expect(iterator.next()).rejects.toThrow('Error');
});
