import {Readable} from 'node:stream';
import {fromEvent} from './event.js';

export function fromStream<T>(stream: Readable) {
    return fromEvent<T>(stream, {dataEvent: 'data', finishEvent: 'end', errorEvent: 'error'});
}
