import {test, expect} from 'vitest';
import {AsyncIteratorController} from '../controller.js';

test('put and consume', async () => {
    const controller = new AsyncIteratorController();
    controller.putAt(0, 1);
    controller.putAt(1, 2);
    controller.putAt(2, 3);
    controller.complete();
    const iterator = controller.toIterable()[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({done: false, value: 1});
    await expect(iterator.next()).resolves.toEqual({done: false, value: 2});
    await expect(iterator.next()).resolves.toEqual({done: false, value: 3});
    await expect(iterator.next()).resolves.toEqual({done: true, value: undefined});
});

test('put auto index', async () => {
    const controller = new AsyncIteratorController();
    controller.put(1);
    controller.put(2);
    controller.put(3);
    controller.complete();
    const iterator = controller.toIterable()[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({done: false, value: 1});
    await expect(iterator.next()).resolves.toEqual({done: false, value: 2});
    await expect(iterator.next()).resolves.toEqual({done: false, value: 3});
    await expect(iterator.next()).resolves.toEqual({done: true, value: undefined});
});

test('put mixed index', async () => {
    const controller = new AsyncIteratorController();
    controller.put(1);
    controller.putAt(1, 2);
    controller.put(3);
    controller.complete();
    const iterator = controller.toIterable()[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({done: false, value: 1});
    await expect(iterator.next()).resolves.toEqual({done: false, value: 2});
    await expect(iterator.next()).resolves.toEqual({done: false, value: 3});
    await expect(iterator.next()).resolves.toEqual({done: true, value: undefined});
});

test('consume before put', async () => {
    const controller = new AsyncIteratorController();
    const iterator = controller.toIterable()[Symbol.asyncIterator]();
    const pendingValue = iterator.next();
    controller.putAt(0, 1);
    controller.complete();
    expect(await pendingValue).toEqual({done: false, value: 1});
    await expect(iterator.next()).resolves.toEqual({done: true, value: undefined});
});

test('consume before complete', async () => {
    const controller = new AsyncIteratorController();
    const iterator = controller.toIterable()[Symbol.asyncIterator]();
    const pendingValue = iterator.next();
    controller.complete();
    expect(await pendingValue).toEqual({done: true, value: undefined});
});

test('multiple iteration', async () => {
    const controller = new AsyncIteratorController();
    const iterable = controller.toIterable();
    const first = iterable[Symbol.asyncIterator]();
    const second = iterable[Symbol.asyncIterator]();
    const firstPendingValue = first.next();
    const secondPendingValue = second.next();
    controller.putAt(0, 1);
    controller.complete();
    expect(await firstPendingValue).toEqual({done: false, value: 1});
    expect(await secondPendingValue).toEqual({done: false, value: 1});
    expect(await first.next()).toEqual({done: true, value: undefined});
    expect(await second.next()).toEqual({done: true, value: undefined});
});

test('put after done', async () => {
    const controller = new AsyncIteratorController();
    controller.putAt(0, 1);
    controller.complete();
    controller.putAt(1, 2);
    const iterator = controller.toIterable()[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({done: false, value: 1});
    await expect(iterator.next()).resolves.toEqual({done: true, value: undefined});
});

test('error first', async () => {
    const controller = new AsyncIteratorController();
    controller.errorAt(0, new Error('Error'));
    const iterator = controller.toIterable()[Symbol.asyncIterator]();
    await expect(iterator.next()).rejects.toThrow('Error');
    await expect(iterator.next()).resolves.toEqual({done: true, value: undefined});
});

test('consume before error', async () => {
    const controller = new AsyncIteratorController();
    const iterator = controller.toIterable()[Symbol.asyncIterator]();
    const pendingValue = iterator.next();
    controller.errorAt(0, new Error('Error'));
    await expect(pendingValue).rejects.toThrow('Error');
});

test('error auto index', async () => {
    const controller = new AsyncIteratorController();
    controller.put(1);
    controller.error(new Error('Error'));
    const iterator = controller.toIterable()[Symbol.asyncIterator]();
    await expect(iterator.next()).resolves.toEqual({done: false, value: 1});
    await expect(iterator.next()).rejects.toThrow('Error');
});
