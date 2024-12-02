import {AsyncIteratorController} from '../../controller.js';

interface Context<T> {
    buffer: T[];
    timer: ReturnType<typeof setTimeout> | null;
    interval: number;
}

async function consume<T>(iterable: AsyncIterable<T>, context: Context<T>, controller: AsyncIteratorController<T[]>) {
    const flush = () => {
        if (context.buffer.length > 0) {
            controller.put(context.buffer);
            context.buffer = [];
        }
    };
    const begineTimer = () => {
        if (context.timer) {
            clearTimeout(context.timer);
        }
        context.timer = setTimeout(flush, context.interval);
    };

    for await (const value of iterable) {
        context.buffer.push(value);
        begineTimer();
    }
    flush();
    controller.complete();
}

export function debounce<T>(iterable: AsyncIterable<T>, ms: number): AsyncIterable<T[]> {
    const state: Context<T> = {
        buffer: [],
        timer: null,
        interval: ms,
    };
    const controller = new AsyncIteratorController<T[]>();

    consume(iterable, state, controller).catch((ex: unknown) => controller.error(ex));

    return controller.toIterable();
}
