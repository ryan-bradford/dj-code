export class FixedStack<T> implements Iterable<T> {

    private array: Array<T>;

    constructor(private targetLength: number, array?: Array<T>) {
        if (!targetLength && !array) {
            throw "BAD";
        }
        this.array = array ? array : [];
    }

    [Symbol.iterator](): Iterator<T, any, undefined> {
        return this.array[Symbol.iterator]();
    }

    push(t: T) {
        this.array.push(t);
        if (this.array.length > this.targetLength) {
            this.array = this.array.slice(1, this.targetLength + 1);
        }
    }

    forEach(callback: (val: T) => void) {
        this.array.forEach(callback);
    }

    length(): number {
        return this.array.length;
    }

    getArray(): Array<T> {
        return this.array;
    }

    getLast(): T {
        if (!this.array.length) {
            return undefined;
        }
        return this.getTopN(1)[0];
    }

    getTopN(toGet: number): Array<T> {
        return this.array.slice(this.array.length - toGet, this.array.length);
    }

    isEmpty(): boolean {
        return this.array.length === 0;
    }

}
