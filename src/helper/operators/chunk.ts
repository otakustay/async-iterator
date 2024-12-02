export async function* chunk<T>(iterator: AsyncIterable<T>, size: number): AsyncIterable<T[]> {
    const state = {
        current: [] as T[],
    };

    for await (const value of iterator) {
        state.current.push(value);
        if (state.current.length === size) {
            yield state.current;
            state.current = [];
        }
    }

    if (state.current.length > 0) {
        yield state.current;
    }
}
