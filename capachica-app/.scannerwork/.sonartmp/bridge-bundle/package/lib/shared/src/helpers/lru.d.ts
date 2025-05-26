export declare class LRU<T> {
    private readonly max;
    private readonly cache;
    constructor(max?: number);
    get(): T[];
    set(item: T): void;
    clear(): void;
}
