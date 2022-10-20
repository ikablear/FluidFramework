/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { fail } from "assert";
import BTree from "sorted-btree";
import { assert } from "@fluidframework/common-utils";
import { IBtreeLeafNode, IBtreeInteriorNode } from "./persistedTypes";
import { IBtreeState, IChunkedBtree, IBtreeUpdate } from "./interfaces";

/**
 * Handles handles
 */
 export interface Handler<T, TNodeHandle, TValueHandle> {
    createHandle: (content: IBtreeInteriorNode<TNodeHandle> | IBtreeLeafNode) => Promise<TNodeHandle>;
    resolveHandle: (handle: TNodeHandle) => Promise<IBtreeInteriorNode<TNodeHandle> | IBtreeLeafNode>;
    compareHandles: (a: TNodeHandle | TValueHandle, b: TNodeHandle | TValueHandle) => number;
    discoverHandles: (value: T) => Iterable<TValueHandle>;
}

/**
 * TODO: docs
 */
export class ChunkedBtree<T, THandle, TValueHandle> implements IChunkedBtree<T, THandle, TValueHandle> {
    private readonly root: IBTreeNode<T, THandle, TValueHandle>;
    private readonly handles: BTree<THandle | TValueHandle, THandle | TValueHandle>;

    public static create<T, THandle, TValueHandle>(
        order: number,
        handler: Handler<T, THandle, TValueHandle>,
    ) {
        return new ChunkedBtree<T, THandle, TValueHandle>(order, 0, handler);
    }

    public static async load<T, THandle, TValueHandle>(
        { order, size, root, handles }: IBtreeState<THandle>,
        handler: Handler<T, THandle, TValueHandle>,
        isHandle: (handleOrNode: THandle | IBtreeLeafNode) => handleOrNode is THandle,
    ): Promise<ChunkedBtree<T, THandle, TValueHandle>> {
        if (isHandle(root)) {
            return new ChunkedBtree(
                order,
                size,
                handler,
                new LazyBTreeNode(root, order, handler.createHandle, handler.resolveHandle, handler.discoverHandles),
                handles,
            );
        } else {
            let btree = new ChunkedBtree<T, THandle, TValueHandle>(order, size, handler);
            assert(root.keys.length === root.values.length, "Malformed drone; should be same number of keys as values");
            for (const [i, key] of root.keys.entries()) {
                btree = await btree.set(key, root.values[i], [], []);
            }

            return btree;
        }
    }

    public static loadSync<T, THandle, TValueHandle>(
        { order, size, root }: IBtreeState<THandle>,
        handler: Handler<T, THandle, TValueHandle>,
        isHandle: (handleOrNode: THandle | IBtreeLeafNode) => handleOrNode is THandle,
    ): ChunkedBtree<T, THandle, TValueHandle> {
        if (isHandle(root)) {
            return new ChunkedBtree(
                order,
                size,
                handler,
                new LazyBTreeNode(root, order, handler.createHandle, handler.resolveHandle, handler.discoverHandles),
            );
        } else {
            fail("Cannot synchronously chunk btree.");
        }
    }

	private constructor(
        public readonly order: number,
        private readonly size: number,
        private readonly handler: Handler<T, THandle, TValueHandle>,
        root?: IBTreeNode<T, THandle, TValueHandle>,
        handles?: readonly (THandle | TValueHandle)[] | BTree<(THandle | TValueHandle), (THandle | TValueHandle)>,
    ) {
        assert(order >= 2, "Order out of bounds");
        this.root = root ?? new LeafyBTreeNode([], [], order, handler.createHandle, handler.discoverHandles);
        this.handles = new BTree(undefined, handler.compareHandles);
        if (handles !== undefined) {
            if (Array.isArray(handles)) {
                for (const handle of handles) {
                    this.handles.set(handle, handle);
                }
            } else {
                this.handles = handles as BTree<THandle | TValueHandle, THandle | TValueHandle>;
            }
        }
    }

    private cloneWithNewRoot(
        newRoot: IBTreeNode<T, THandle, TValueHandle>,
        newSize: number,
    ): ChunkedBtree<T, THandle, TValueHandle> {
        return new ChunkedBtree(this.order, newSize, this.handler, newRoot);
    }

    public get count(): number {
        return this.size;
    }

    public async min(): Promise<[string, T] | undefined> {
        return this.root.min();
    }

    public async max(): Promise<[string, T] | undefined> {
        return this.root.max();
    }

	public async get(key: string): Promise<T | undefined> {
        return this.root.get(key);
	}

    public async has(key: string): Promise<boolean> {
        return this.root.has(key);
    }

    public async set(
        key: string,
        value: T,
        addedHandles: (THandle | TValueHandle)[],
        deletedHandles: (THandle | TValueHandle)[],
    ): Promise<ChunkedBtree<T, THandle, TValueHandle>> {
        const { added, node: result } = await this.root.set(key, value, addedHandles, deletedHandles);
        let newRoot: IBTreeNode<T, THandle, TValueHandle>;
        if (Array.isArray(result)) {
            const [nodeA, k, nodeB] = result;
            newRoot = new BTreeNode(
                [k],
                [nodeA, nodeB],
                this.order,
                this.handler.createHandle,
                this.handler.resolveHandle,
            );
        } else {
            newRoot = result;
        }
        return this.cloneWithNewRoot(newRoot, added ? this.size + 1 : this.size);
    }

    public async delete(
        key: string,
        deletedHandles: (THandle | TValueHandle)[],
    ): Promise<ChunkedBtree<T, THandle, TValueHandle>> {
        const { deleted, node: newRoot } = await this.root.delete(key, deletedHandles);
        return this.cloneWithNewRoot(newRoot, deleted ? this.size - 1 : this.size);
    }

    public summarizeSync(
        updates: Iterable<[string, T]>,
        deletes: Iterable<string>,
    ): IBtreeState<THandle | TValueHandle, IBtreeLeafNode> {
        const map = new Map<string, T>(updates);
        for (const d of deletes) {
            map.delete(d);
        }

        return {
            order: this.order,
            size: this.size,
            root: {
                keys: [...map.keys()],
                values: [...map.values()],
            },
            handles: [],
        };
    }

	public async flush(
        updates: Iterable<[string, T]>, deletes: Iterable<string>,
    ): Promise<IBtreeUpdate<THandle, TValueHandle>> {
        const newHandles: THandle[] = [];
        const deletedHandles: (THandle | TValueHandle)[] = [];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let btree: ChunkedBtree<T, THandle, TValueHandle> = this;
		for (const [key, value] of updates) {
            btree = await btree.set(key, value, newHandles, deletedHandles);
        }

        // TODO: this should handle values with handles
        for (const key of deletes) {
            btree = await btree.delete(key, deletedHandles);
        }

        const newRoot = await btree.root.upload(newHandles);
        return {
            newSize: btree.size,
            newRoot,
            newHandles,
            deletedHandles,
        };
	}

    public clear(): ChunkedBtree<T, THandle, TValueHandle> {
        return new ChunkedBtree(this.order, 0, this.handler);
    }

    public update(update: IBtreeUpdate<THandle, TValueHandle>): ChunkedBtree<T, THandle, TValueHandle> {
        const { newRoot, newSize, newHandles, deletedHandles } = update;
        const handles = this.handles.clone();
        for (const handle of newHandles) {
            handles.set(handle, handle);
        }
        handles.deleteKeys(deletedHandles);
        return new ChunkedBtree(
            this.order,
            newSize,
            this.handler,
            new LazyBTreeNode(
                newRoot,
                this.order,
                this.handler.createHandle,
                this.handler.resolveHandle,
                this.handler.discoverHandles,
            ),
            handles,
        );
    }

    public getAllHandles(): (THandle | TValueHandle)[] {
        return this.handles.keysArray();
    }

    public evict(evictionCountHint: number): void {
        this.root.evict({ remaining: evictionCountHint });
    }

    public workingSetSize(): number {
        return this.root.workingSetSize();
    }
}

interface SetReturnVal<T, THandle, TValueHandle> {
    added: boolean;
    node: IBTreeNode<T, THandle, TValueHandle>
        | [IBTreeNode<T, THandle, TValueHandle>, string, IBTreeNode<T, THandle, TValueHandle>];
}

interface DeleteReturnVal<T, THandle, TValueHandle> {
    deleted: boolean;
    node: IBTreeNode<T, THandle, TValueHandle>;
}

interface IBTreeNode<T, THandle, TValueHandle> {
    min(): Promise<[string, T] | undefined>;
    max(): Promise<[string, T] | undefined>;
    has(key: string): Promise<boolean>;
    get(key: string): Promise<T | undefined>;
    set(
        key: string,
        value: T,
        addedHandles: (THandle | TValueHandle)[],
        deletedHandles: (THandle | TValueHandle)[]
    ): Promise<SetReturnVal<T, THandle, TValueHandle>>;
    delete(key: string, deletedHandles: (THandle | TValueHandle)[]): Promise<DeleteReturnVal<T, THandle, TValueHandle>>;
    upload(newHandles: THandle[]): Promise<THandle>;
    evict(evicted: { remaining: number; }): number;
    workingSetSize(): number;
}

class BTreeNode<T, THandle, TValueHandle> {
    public constructor(
        public readonly keys: readonly string[],
        public readonly children: readonly (IBTreeNode<T, THandle, TValueHandle>)[],
        public readonly order: number,
        public readonly createHandle: (content: IBtreeInteriorNode<THandle> | IBtreeLeafNode) => Promise<THandle>,
        public readonly resolveHandle: (handle: THandle) => Promise<IBtreeInteriorNode<THandle> | IBtreeLeafNode>,
    ) {
        assert(children.length >= 1, "Unexpected empty interior node");
        assert(keys.length === children.length - 1, "Must have exactly one more child than keys");
    }

    public async has(key: string): Promise<boolean> {
        for (let i = 0; i < this.children.length; i++) {
            if (i === this.keys.length || key < this.keys[i]) {
                return this.children[i].has(key);
            }
        }

        throw new Error("Unreachable code");
    }

    public async min(): Promise<[string, T] | undefined> {
        if (this.children.length === 0) {
            return undefined;
        }
        return this.children[0].min();
    }

    public async max(): Promise<[string, T] | undefined> {
        if (this.children.length === 0) {
            return undefined;
        }
        return this.children[this.children.length - 1].max();
    }

    public async get(key: string): Promise<T | undefined> {
        for (let i = 0; i < this.children.length; i++) {
            if (i === this.keys.length || key < this.keys[i]) {
                return this.children[i].get(key);
            }
        }

        throw new Error("Unreachable code");
    }

    public async set(
        key: string, value: T, addedHandles: (THandle | TValueHandle)[], deletedHandles: (THandle | TValueHandle)[],
    ): Promise<SetReturnVal<T, THandle, TValueHandle>> {
        for (let i = 0; i < this.children.length; i++) {
            if (i === this.keys.length || key < this.keys[i]) {
                const { added, node: childResult }
                    = await this.children[i].set(key, value, addedHandles, deletedHandles);
                if (Array.isArray(childResult)) {
                    // The child split in half
                    const [childA, k, childB] = childResult;
                    const keys = insert(this.keys, i, k);
                    const children = insert(remove(this.children, i), i, childA, childB);
                    if (keys.length >= this.order) {
                        // Split
                        const keys2 = keys.splice(Math.floor(keys.length / 2), Math.ceil(keys.length / 2));
                        const children2 = children.splice(
                            Math.ceil(children.length / 2),
                            Math.floor(children.length / 2),
                        );

                        return {
                            added,
                            node: [
                                new BTreeNode(keys, children, this.order, this.createHandle, this.resolveHandle),
                                keys2.splice(0, 1)[0],
                                new BTreeNode(keys2, children2, this.order, this.createHandle, this.resolveHandle),
                            ],
                        };
                    }

                    return {
                        added,
                        node: new BTreeNode(keys, children, this.order, this.createHandle, this.resolveHandle),
                    };
                } else {
                    // Replace the child
                    const children = [...this.children];
                    children[i] = childResult;
                    return {
                        added,
                        node: new BTreeNode(this.keys, children, this.order, this.createHandle, this.resolveHandle),
                    };
                }
            }
        }

        throw new Error("Unreachable code");
    }

    public async delete(key: string,
        deletedHandles: (THandle | TValueHandle)[],
    ): Promise<DeleteReturnVal<T, THandle, TValueHandle>> {
        for (let i = 0; i < this.children.length; i++) {
            if (i === this.keys.length || key < this.keys[i]) {
                const { deleted, node } = await this.children[i].delete(key, deletedHandles);
                if (!deleted) {
                    return {
                        deleted: false,
                        node: this,
                    };
                }
                const children = [...this.children];
                children[i] = node;
                return {
                    deleted: true,
                    node: new BTreeNode(this.keys, children, this.order, this.createHandle, this.resolveHandle),
                };
            }
        }

        throw new Error("Unreachable code");
    }

    public async upload(newHandles: THandle[]): Promise<THandle> {
        const worker: IBtreeInteriorNode<THandle> = {
            keys: this.keys,
            children: await Promise.all(this.children.map(async (c) => c.upload(newHandles))),
        };

        const thisHandle = await this.createHandle(worker);
        newHandles.push(thisHandle);
        return thisHandle;
    }

    public evict(evicted: { remaining: number; }): number {
        let unevictedEntriesBelow = 0;
        for (const child of this.children) {
            unevictedEntriesBelow += child.evict(evicted);
            if (evicted.remaining <= 0) {
                break;
            }
        }
        return unevictedEntriesBelow;
    }

    public workingSetSize(): number {
        let entriesBelow = 0;
        for (const child of this.children) {
            entriesBelow += child.workingSetSize();
        }
        return entriesBelow;
    }
}

class LeafyBTreeNode<T, THandle, TValueHandle> implements IBTreeNode<T, THandle, TValueHandle> {
    public constructor(
        public readonly keys: readonly string[],
        public readonly values: readonly T[],
        public readonly order: number,
        public readonly createHandle: (content: IBtreeLeafNode | IBtreeInteriorNode<THandle>) => Promise<THandle>,
        public readonly discoverHandles: (value: T) => Iterable<TValueHandle>,
    ) {
        assert(keys.length === values.length, "Invalid keys or values");
    }

    public async min(): Promise<[string, T] | undefined> {
        if (this.keys.length === 0) {
            return undefined;
        }
        return [this.keys[0], this.values[0]];
    }

    public async max(): Promise<[string, T] | undefined> {
        if (this.keys.length === 0) {
            return undefined;
        }
        const last = this.keys.length - 1;
        return [this.keys[last], this.values[last]];
    }

    public async has(key: string): Promise<boolean> {
        for (const k of this.keys) {
            if (k === key) {
                return true;
            }
        }

        return false;
    }

    public async get(key: string): Promise<T | undefined> {
        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i] === key) {
                return this.values[i];
            }
        }

        return undefined;
    }

    public async set(
        key: string,
        value: T,
        addedHandles: (THandle | TValueHandle)[],
        _: (THandle | TValueHandle)[],
    ): Promise<SetReturnVal<T, THandle, TValueHandle>> {
        addedHandles.push(...this.discoverHandles(value));
        for (let i = 0; i <= this.keys.length; i++) {
            if (this.keys[i] === key) {
                // Already have a value for this key, so just clone ourselves but replace the value
                const values = [...this.values.slice(0, i), value, ...this.values.slice(i + 1)];
                return {
                    added: false,
                    node: new LeafyBTreeNode(this.keys, values, this.order, this.createHandle, this.discoverHandles),
                };
            }
            if (i === this.keys.length || key < this.keys[i]) {
                const keys = insert(this.keys, i, key);
                const values = insert(this.values, i, value);
                if (keys.length >= this.order) {
                    // Split
                    const keys2 = keys.splice(Math.ceil(keys.length / 2), Math.floor(keys.length / 2));
                    const values2 = values.splice(Math.ceil(values.length / 2), Math.floor(values.length / 2));
                    return {
                        added: true,
                        node: [
                            new LeafyBTreeNode(keys, values, this.order, this.createHandle, this.discoverHandles),
                            keys2[0],
                            new LeafyBTreeNode(keys2, values2, this.order, this.createHandle, this.discoverHandles),
                        ],
                    };
                }
                return {
                    added: true,
                    node: new LeafyBTreeNode(keys, values, this.order, this.createHandle, this.discoverHandles),
                };
            }
        }

        throw new Error("Unreachable code");
    }

    public async delete(
        key: string,
        deletedHandles: (THandle | TValueHandle)[],
    ): Promise<DeleteReturnVal<T, THandle, TValueHandle>> {
        for (let i = 0; i <= this.keys.length; i++) {
            if (this.keys[i] === key) {
                const value = this.values[i];
                deletedHandles.push(...this.discoverHandles(value));
                const keys = remove(this.keys, i);
                const values = remove(this.values, i);
                return {
                    deleted: true,
                    node: new LeafyBTreeNode(keys, values, this.order, this.createHandle, this.discoverHandles),
                };
            }
        }

        return {
            deleted: false,
            node: this,
        };
    }

    public async upload(newHandles: THandle[]): Promise<THandle> {
        const drone: IBtreeLeafNode = {
            keys: this.keys,
            values: this.values,
        };

        const thisHandle = await this.createHandle(drone);
        newHandles.push(thisHandle);
        return thisHandle;
    }

    public evict(evicted: { remaining: number; }): number {
        return this.keys.length;
    }

    public workingSetSize(): number {
        return this.keys.length;
    }
}

class LazyBTreeNode<T, THandle, TValueHandle> implements IBTreeNode<T, THandle, TValueHandle> {
    private node?: IBTreeNode<T, THandle, TValueHandle>;

    public constructor(
        private readonly handle: THandle,
        public readonly order: number,
        private readonly createHandle: (content: IBtreeInteriorNode<THandle> | IBtreeLeafNode) => Promise<THandle>,
        private readonly resolveHandle: (handle: THandle) => Promise<IBtreeInteriorNode<THandle> | IBtreeLeafNode>,
        private readonly discoverHandles: (value: T) => Iterable<TValueHandle>,
    ) {}

    private async load(): Promise<IBTreeNode<T, THandle, TValueHandle>> {
        if (this.node === undefined) {
            const loadedNode = await this.resolveHandle(this.handle);
            this.node = this.isLeafNode(loadedNode) ? new LeafyBTreeNode(
                    loadedNode.keys,
                    loadedNode.values,
                    this.order,
                    this.createHandle,
                    this.discoverHandles,
                ) : new BTreeNode(
                    loadedNode.keys,
                    loadedNode.children.map(
                        (handle) => new LazyBTreeNode(
                            handle,
                            this.order,
                            this.createHandle,
                            this.resolveHandle,
                            this.discoverHandles),
                    ),
                    this.order,
                    this.createHandle,
                    this.resolveHandle,
                );
        }

        return this.node;
    }

    public async min(): Promise<[string, T] | undefined> {
        return (await this.load()).min();
    }

    public async max(): Promise<[string, T] | undefined> {
        return (await this.load()).max();
    }

    public async has(key: string): Promise<boolean> {
        return (await this.load()).has(key);
    }

    public async get(key: string): Promise<T | undefined> {
        return (await this.load()).get(key);
    }

    public async set(
        key: string,
        value: T,
        addedHandles: THandle[],
        deletedHandles: THandle[],
    ): Promise<SetReturnVal<T, THandle, TValueHandle>> {
        deletedHandles.push(this.handle);
        return (await this.load()).set(key, value, addedHandles, deletedHandles);
    }

    public async delete(
        key: string,
        deletedHandles: (THandle | TValueHandle)[],
    ): Promise<DeleteReturnVal<T, THandle, TValueHandle>> {
        deletedHandles.push(this.handle);
        return (await this.load()).delete(key, deletedHandles);
    }

    public async upload(newHandles: THandle[]): Promise<THandle> {
        return this.handle;
    }

    private isLeafNode(node: IBtreeInteriorNode<THandle> | IBtreeLeafNode): node is IBtreeLeafNode {
        return (node as IBtreeLeafNode).values !== undefined;
    }

    public evict(evicted: { remaining: number; }): number {
        if (this.node === undefined) {
            return 0;
        }
        const unevictedEntriesBelow = this.node.evict(evicted);
        evicted.remaining -= unevictedEntriesBelow;
        if (evicted.remaining > 0) {
            this.node = undefined;
        }
        return 0;
    }

    public workingSetSize(): number {
        if (this.node === undefined) {
            return 0;
        }
        return this.node.workingSetSize();
    }
}

// /**
// * The value xor'd with the result index when a search fails.
// */
// const failureXor = -1;

// /**
// * Performs a binary search on the sorted array.
// * @returns the index of the key for `search`, or (if not present) the index it would have been inserted into xor'd
// * with `failureXor`. Note that negating is not an adequate solution as that could result in -0.
// */
// function search<T>(
//    elements: readonly T[],
//    target: T,
//    comparator: (a: T, b: T) => number,
// ): number | undefined {
//    let low = 0;
//    let high = elements.length - 1;
//    let mid = high >> 1;
//    while (low < high) {
//        const c = comparator(target, elements[mid]);
//        if (c > 0) {
//            low = mid + 1;
//        } else if (c < 0) {
//            high = mid;
//        } else if (c === 0) {
//            return mid;
//        } else {
//            throw new Error("Invalid comparator.");
//        }
//        mid = (low + high) >> 1;
//    }
//    return (mid * 2) ^ failureXor;
// }

function insert<T>(array: readonly T[], index: number, ...values: T[]): T[] {
    return [...array.slice(0, index), ...values, ...array.slice(index)];
}

function remove<T>(array: readonly T[], index: number, count = 1): T[] {
    return [...array.slice(0, index), ...array.slice(index + count)];
}
