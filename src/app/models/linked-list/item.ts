export class Item<T> {
    public next: Item<T> | null = null;
    public prev: Item<T> | null = null;
    constructor(public data: T) {}
}