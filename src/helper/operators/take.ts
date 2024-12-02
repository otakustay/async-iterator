export async function* take<T>(iterator: AsyncIterable<T>, count: number): AsyncIterable<T> {
    if (count <= 0) {
        return;
    }

    const state = {
        cursor: 0,
    };

    for await (const value of iterator) {
        yield value;

        state.cursor++;

        if (state.cursor >= count) {
            break;
        }
    }
}
