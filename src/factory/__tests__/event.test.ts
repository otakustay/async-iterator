import {EventEmitter} from 'node:events';
import {test, expect} from 'vitest';
import {fromEvent} from '../event.js';

test('event emitter compatibility', async () => {
    const emitter = new EventEmitter();
    const iterable = fromEvent<number>(emitter, {dataEvent: 'data'});
    emitter.emit('data', 1);
    emitter.emit('data', 2);
    const iterator = iterable[Symbol.asyncIterator]();
    expect(await iterator.next()).toEqual({value: 1, done: false});
    expect(await iterator.next()).toEqual({value: 2, done: false});
});

// @vitest-environment happy-dom
test('html element compatibility', async () => {
    const element = document.body;
    const iterable = fromEvent<Event>(element, {dataEvent: 'click', finishEvent: 'blur'});
    const event = new MouseEvent('click');
    element.dispatchEvent(event);
    element.dispatchEvent(new MouseEvent('blur'));
    const iterator = iterable[Symbol.asyncIterator]();
    expect(await iterator.next()).toEqual({value: event, done: false});
});

test('finish event', async () => {
    const emitter = new EventEmitter();
    const iterable = fromEvent<number>(emitter, {dataEvent: 'data', finishEvent: 'finish'});
    emitter.emit('data', 1);
    emitter.emit('finish');
    const iterator = iterable[Symbol.asyncIterator]();
    expect(await iterator.next()).toEqual({value: 1, done: false});
    expect(await iterator.next()).toEqual({value: undefined, done: true});
});

test('error event', async () => {
    const emitter = new EventEmitter();
    const iterable = fromEvent<number>(emitter, {dataEvent: 'data', errorEvent: 'error'});
    emitter.emit('data', 1);
    emitter.emit('error', new Error('Error'));
    const iterator = iterable[Symbol.asyncIterator]();
    expect(await iterator.next()).toEqual({value: 1, done: false});
    await expect(iterator.next()).rejects.toThrow('Error');
});

test('default toError', async () => {
    const emitter = new EventEmitter();
    const iterable = fromEvent<number>(emitter, {dataEvent: 'data', errorEvent: 'error'});
    emitter.emit('data', 1);
    emitter.emit('error', 123);
    const iterator = iterable[Symbol.asyncIterator]();
    expect(await iterator.next()).toEqual({value: 1, done: false});
    await expect(iterator.next()).rejects.toThrow('123');
});

test('custom toError', async () => {
    const emitter = new EventEmitter();
    const iterable = fromEvent<number, number>(
        emitter,
        {
            dataEvent: 'data',
            errorEvent: 'error',
            toError: (value: number) => new Error(`Error ${value}`),
        }
    );
    emitter.emit('data', 1);
    emitter.emit('error', 123);
    const iterator = iterable[Symbol.asyncIterator]();
    expect(await iterator.next()).toEqual({value: 1, done: false});
    await expect(iterator.next()).rejects.toThrow('Error 123');
});
