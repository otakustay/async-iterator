# async-iterator

This package includes a `AsyncIteratorController` class for manually control the creation and yielding of an `AsyncIterator`, also it tries to provide a set of utility functions for `AsyncIterator`s.

## AsyncIteratorController

One problem using async generator functions is that it's hard to transform a data source other than an `AsyncIterable`, such as streams or events.

```ts
function* readLines(file: string) {
    const readable = fs.createReadStream(file);
    const lines = readline.createInterface({input: readable});
    readable.on(
        'line',
        line => {
            // Now we are not able to yield it to parent function
        }
    );
}
```

This class is used to create a controller through which you can manually put values that yields to consumer, or mark it as "errored" or "completed".

### Yield value

The basic usage is to use `put` method to yield data, and use `toIterable` to get an `AsyncIterable` object that can be used in a `for await...of` loop.

```ts
function* readLines(file: string) {
    const readable = fs.createReadStream(file);
    const lines = readline.createInterface({input: readable});
    const controller = new AsyncIteratorController<string>();
    readable.on(
        'line',
        line => {
            // Put it to async iterator
            controller.put(line);
        }
    );
    // Remember to mark the controller as completed
    readable.on('close', () => controller.complete());
    // Return the async iterable
    return controller.toIterable();
}

// We can not consume it in a for await...of loop
for await (const line of readLines('./file.txt')) {
    console.log(line);
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

#### From a event emitter

Infinite user event:

```ts
function fromClick(node: HTMLElement) {
    const controller = new AsyncIteratorController<MouseEvent>();
    node.addEventListener('click', event => controller.put(event));
}
```

Finishable event:

```ts
function fromAnimation(animation: Animation) {
    const controller = new AsyncIteratorController<number>();
    animation.addEventListener('step', progress => controller.put(progress));
    animation.addEventListener('finish', () => controller.complete());
    return controller.toIterable();
}
```

#### From a stream

```ts
function fromReadableStream(stream: Readable) {
    const controller = new AsyncIteratorController<string>();
    stream.on('data', chunk => controller.put(chunk));
    stream.on('end', () => controller.complete());
    stream.on('error', error => controller.error(error));
    return controller.toIterable();
}
```

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
