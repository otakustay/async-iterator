import {test, expect} from 'vitest';
import {fromStreamReader} from '../reader.js';

test('read every chunk', async () => {
    const stream = new ReadableStream<number>({
        async start(controller) {
            controller.enqueue(1);
            await new Promise(r => setTimeout(r, 0));
            controller.enqueue(2);
            controller.close();
        },
    });
    const iterable = fromStreamReader(stream.getReader());
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).resolves.toEqual({value: 2, done: false});
    await expect(iterator.next()).resolves.toEqual({value: undefined, done: true});
});

test('throw string', async () => {
    const stream = new ReadableStream<number>({
        async start(controller) {
            controller.enqueue(1);
            await new Promise(r => setTimeout(r, 0));
            controller.error('Error Message');
        },
    });
    const iterable = fromStreamReader(stream.getReader());
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).rejects.toThrow('Error Message');
});

test('throw error', async () => {
    const stream = new ReadableStream<number>({
        async start(controller) {
            controller.enqueue(1);
            await new Promise(r => setTimeout(r, 0));
            controller.error(new Error('Error'));
        },
    });
    const iterable = fromStreamReader(stream.getReader());
    const iterator = iterable[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({value: 1, done: false});
    await expect(iterator.next()).rejects.toThrow('Error');
});
