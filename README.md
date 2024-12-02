# async-iterator

This package includes a `AsyncIteratorController` class for manually control the creation and yielding of an `AsyncIterator`, also it tries to provide a set of utility functions for `AsyncIterator`s.

## Use a controller

One problem using async generator functions is that it's hard to transform a data source other than an `AsyncIterable`, such as streams or events.

```ts
function* watchLocation() {
    window.navigator.geolocation.watchPosition(
        position => {
            // Now we are not able to yield it to parent function
        },
        error => {
            // Also we are not able to throw an error to parent function
        }
    );
}
```

This class is used to create a controller through which you can manually put values that yields to consumer, or mark it as "errored" or "completed".

### Yield value

The basic usage is to use `put` method to yield data, and use `toIterable` to get an `AsyncIterable` object that can be used in a `for await...of` loop.

```ts
function* watchLocation() {
    const controller = new AsyncIteratorController<GeolocationPosition>();
    window.navigator.geolocation.watchPosition(
        position => {
            // Put it to async iterator
            controller.put(position);
        },
        error => {
            // Mark async iterator as errored
            controller.error(error);
        }
    );
}

// We can not consume it in a for await...of loop
for await (const position of watchLocation()) {
    map.focusTo(position);
}
```

### Throw error

On condition of error, use `error` method to "throw" an `Errro` to comsumer.

```ts
function* randomPick() {
    const controller = new AsyncIteratorController<number>();
    const pick = () => {
        const value = Math.round(Math.random() * 100);

        if (value > 98) {
            controller.error(new Error('Value too large'));
        }
        else {
            controller.put(value);
            setTimeout(pick, 100);
        }
    };
    pick();
    return controller.toIterable();
}

// Error can be caught
for await (const value of randomPick()) {
    try {
        console.log(value);
    }
    catch (e) {
        console.error('Error', e);
    }
}
```

### Manually control index

In case your data is not in sequential order, you can manually control the index of each yielded value using `putAt` and `errorAt` method.

```ts
// Asume you receive message from a server having `order` property
interface MessageData {
    order: number;
    type: 'chunk' | 'error';
    value: string;
    finished: boolean;
}

function* receiveMessages() {
    const controller = new AsyncIteratorController<string>();
    server.on(
        'message',
        data => {
            if (type ==='chunk') {
                controller.putAt(data.order, data.value);
            }
            else {
                controller.errorAt(data.order, new Error('Error'));
            }

            if (data.finished) {
                controller.complete();
            }
        }
    );
```

### Example

#### From event source

```ts
import {fetchEventSource} from '@microsoft/fetch-event-source';

function fromEventSource(url: string) {
    const controller = new AsyncIteratorController<string>();
    fetchEventSource('/api/sse', {
        onmessage(message) {
            if (message.event === 'FatalError') {
                controller.error(new Error(message.data));
            }
            else {
                controller.put(message.data);
            }
        },
        onclose() {
            controller.complete();
        },
        onerror(error) {
            controller.error(error);
        }
    }
    return controller.toIterable();
);
```

#### From interval

```ts
function fromInterval(ms: number) {
    const controller = new AsyncIteratorController<number>();
    setInterval(
        () => {
            controller.put(Date.now());
        },
        ms
    );
    return controller.toIterable();
}
```

## Factory functions

This library includes a set of factory functions to create async iterables from other sources.

### From events

You can leverage `fromEvent` function to create an async iterable from a NodeJS's `EventEmitter` or DOM's `EventTarget`.

A infinite sequence of click events:

```ts
for await (const event of fromEvent(document.body, {dataEvent: 'click'})) {
    // Click events
}
```

Finishable event:

```ts
for await (const event of fromEvent(document.body, {dataEvent: 'input', finishEvent: 'change'})) {
    // Type until focus changed
}
```

### From streams

Use `fromStream` function to create an async iterable from a NodeJS's `Readable` instance.

```ts
for await (const text of fromStream(fs.createReadStream('./file.txt'))) {
    // One chunk from file
}
```

A `Readable` must have `data` event reporting chunks and `end` event to indicate the end of stream, an optional `error` event can be used to throw errors.

### From stream reader

Some DOM API returns a `ReadableStream` instance containing a `getReader()` method, this can be passed to `fromStreamReader` function to create an async iterable, the most common case is `fetch`.

```ts
const response = await fetch('...');

for await (const text of fromStreamReader(response.body.getReader())) {
    // One chunk from response
}
```

### From an array by interval

Once you have an array of items already, but want to process them at a fixed interval, the `fromIntervalEach` factory function is useful.

```ts
const text = await fetch('...').then(r => r.text());

// Print 60 characters per second
for await (const char of fromIntervalEach(text, 16)) {
    content.innerText += char;
}
```
