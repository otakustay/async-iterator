interface QueueItemResolved<T> {
    state: 'resolved';
    value: T;
}

interface QueueItemError {
    state: 'error';
    error: Error;
}

interface YieldResult<T> {
    value: T;
    done: false;
}

interface QueueItemPending<T> {
    state: 'pending';
    promise: Promise<YieldResult<T>>;
    resolve: (data: YieldResult<T>) => void;
    reject: (error: Error) => void;
}

function createPendingItem<T>(): QueueItemPending<T> {
    const item: Partial<QueueItemPending<T>> = {
        state: 'pending',
    };
    item.promise = new Promise<YieldResult<T>>((resolve, reject) => Object.assign(item, {resolve, reject}));
    return item as QueueItemPending<T>;
}

/**
 * A intermediate medium allows to put data and pull them as an async generator.
 */
export class AsyncIteratorController<T = any> {
    private chunksCount = -1;

    private readonly queue: Array<QueueItemResolved<T> | QueueItemPending<T> | QueueItemError> = [];

    private cursor = 0;

    /**
     * Put a chunk into current execution.
     *
     * @param index The chunk index
     * @param value The chunk value
     */
    putAt(index: number, value: T) {
        /* v8 ignore start */
        if (this.chunksCount >= 0) {
            return;
        }
        /* v8 ignore end */

        const current = this.queue.at(index);

        if (current && current.state === 'pending') {
            current.resolve({value, done: false});
        }

        const item: QueueItemResolved<T> = {
            state: 'resolved',
            value,
        };
        this.queue[index] = item;
        this.cursor = index + 1;
    }

    /**
     * Put a chunk into current execution.
     *
     * @param value The chunk value
     */
    put(value: T) {
        this.putAt(this.cursor, value);
    }

    /**
     * Mark current execution to an error state.
     *
     * @param index The chunk index
     * @param error The error reason
     */
    errorAt(index: number, error: Error) {
        /* v8 ignore start */
        if (this.chunksCount >= 0) {
            return;
        }
        /* v8 ignore end */

        const current = this.queue.at(index);

        if (current && current.state === 'pending') {
            current.reject(error);
        }

        const item: QueueItemError = {
            state: 'error',
            error,
        };
        this.queue[index] = item;
        this.cursor = index + 1;

        // An errored iterator is always completed.
        this.complete();
    }

    /**
     * Mark current execution to an error state.
     *
     * @param error The error reason
     */
    error(error: Error) {
        this.errorAt(this.cursor, error);
    }

    /**
     * Mark current execution to a complete state.
     */
    complete() {
        this.chunksCount = this.queue.length;
    }

    /**
     * Create an `AsyncIterable` for current execution.
     *
     * @returns An `AsyncIterable` object that can iterate over the chunks of current execution.
     */
    toIterable(): AsyncIterable<T> {
        return {
            [Symbol.asyncIterator]: (): AsyncIterator<T> => {
                const state = {
                    cursor: 0,
                };
                const pull = (): Promise<IteratorResult<T>> => {
                    const index = state.cursor;
                    if (this.chunksCount >= 0 && index >= this.chunksCount) {
                        return Promise.resolve({value: undefined, done: true});
                    }

                    const item = this.queue.at(index);
                    state.cursor++;

                    if (item) {
                        switch (item.state) {
                            case 'pending':
                                return item.promise;
                            case 'resolved':
                                return Promise.resolve({value: item.value, done: false});
                            case 'error':
                                return Promise.reject(item.error);
                        }
                    }

                    const pendingItem = createPendingItem<T>();
                    this.queue[index] = pendingItem;
                    return pendingItem.promise;
                };
                return {
                    next: pull,
                };
            },
        };
    }
}
