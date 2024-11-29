import {AsyncIteratorController} from '../controller.js';

async function consume<T>(controller: AsyncIteratorController<T>, reader: ReadableStreamDefaultReader<T>) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            const result = await reader.read();

            if (result.done) {
                break;
            }

            controller.put(result.value);
        }
        controller.complete();
    }
    catch (ex) {
        controller.error(ex instanceof Error ? ex : new Error(`${ex}`));
    }
}

export function fromStreamReader<T>(reader: ReadableStreamDefaultReader<T>) {
    const controller = new AsyncIteratorController<T>();
    void consume(controller, reader);
    return controller.toIterable();
}
