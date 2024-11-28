async function wait(ms: number) {
    if (ms <= 0) {
        return Promise.resolve();
    }

    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function* fromIntervalEach<T>(array: T[], interval: number) {
    for (let i = 0; i < array.length; ++i) {
        if (i > 0) {
            await wait(interval);
        }
        yield array[i];
    }
}
