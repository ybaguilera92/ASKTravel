import {Item} from "./item";

export interface ILinkedList<T> {
    insertInBegin(data: T): Item<T>;
    insertAtEnd(data: T): Item<T>;
    deleteNode(node: Item<T>): void;
    traverse(): T[];
    size(): number;
    search(comparator: (data: T) => boolean): Item<T> | null;
}