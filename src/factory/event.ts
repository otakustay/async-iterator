import {AsyncIteratorController} from '../controller.js';

export interface EventDescription<E> {
    dataEvent: string;
    finishEvent?: string;
    errorEvent?: string;
    toError?: (value: E) => Error;
}

interface EventEmitterOnOff {
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
}

interface EventEmitterAddRemoveEventListener {
    addEventListener(event: string, listener: (...args: any[]) => void): void;
    removeEventListener(event: string, listener: (...args: any[]) => void): void;
}

export type EventEmitter = EventEmitterOnOff | EventEmitterAddRemoveEventListener;

function addEvent(emitter: EventEmitter, event: string, listener: (...args: any[]) => void) {
    if ('on' in emitter) {
        emitter.on(event, listener);
    }
    else if ('addEventListener' in emitter) {
        emitter.addEventListener(event, listener);
    }
    /* c8 ignore start */
    else {
        throw new Error('Unsupported event emitter');
    }
    /* c8 ignore stop */
}

function removeEvent(emitter: EventEmitter, event: string, listener: (...args: any[]) => void) {
    if ('off' in emitter) {
        emitter.off(event, listener);
    }
    else if ('removeEventListener' in emitter) {
        emitter.removeEventListener(event, listener);
    }
    /* c8 ignore start */
    else {
        throw new Error('Unsupported event emitter');
    }
    /* c8 ignore stop */
}

export function fromEvent<D, E = Error>(emitter: EventEmitter, description: EventDescription<E>) {
    const controller = new AsyncIteratorController<D>();
    const toError = (value: E) => {
        if (description.toError) {
            return description.toError(value);
        }

        return value instanceof Error ? value : new Error(`${value}`);
    };
    const onData = (value: D) => {
        controller.put(value);
    };
    const onFinish = () => {
        controller.complete();
        destroy();
    };
    const onError = (value: E) => {
        const error = toError(value);
        controller.error(error);
        destroy();
    };
    const destroy = () => {
        removeEvent(emitter, description.dataEvent, onData);
        if (description.finishEvent) {
            removeEvent(emitter, description.finishEvent, onFinish);
        }
        if (description.errorEvent) {
            removeEvent(emitter, description.errorEvent, onError);
        }
    };

    addEvent(emitter, description.dataEvent, onData);
    if (description.finishEvent) {
        addEvent(emitter, description.finishEvent, onFinish);
    }
    if (description.errorEvent) {
        addEvent(emitter, description.errorEvent, onError);
    }

    return controller.toIterable();
}
