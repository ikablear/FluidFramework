/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ISharedObjectEvents } from "@fluidframework/shared-object-base";
import { IBtreeLeafNode, IBtreeUpdate } from "./persistedTypes";

/**
 * Type of "valueChanged" event parameter.
 */
 export interface IValueChanged {
    /**
     * The key storing the value that changed.
     */
    key: string;
}

export enum SharedPartialMapEvents {
    ValueChanged = "valueChanged",
    Clear = "clear",
    StartFlush = "startFlush",
    Flush = "flush",
}

/**
 * Events emitted in response to changes to the  data.
 */
 export interface ISharedPartialMapEvents extends ISharedObjectEvents {
    /**
     * Emitted when a key is set or deleted.
     *
     * @remarks Listener parameters:
     *
     * - `changed` - Information on the key that changed and its value prior to the change.
     *
     * - `local` - Whether the change originated from this client.
     *
     * - `target` - The  itself.
     */
    (event: SharedPartialMapEvents.ValueChanged, listener: (changed: string, local: boolean) => void);

    /**
     * Emitted when the map is cleared.
     *
     * @remarks Listener parameters:
     *
     * - `local` - Whether the clear originated from this client.
     *
     * - `target` -  itself.
     */
    (event: SharedPartialMapEvents.Clear, listener: (local: boolean) => void);

    /**
     * Emitted when the map's in-memory modifications begin being flushed to storage.
     * Only emitted from the quorum leader.
     *
     * @remarks Listener parameters:
     *
     * - `local` - Whether the clear originated from this client.
     *
     * - `target` -  itself.
     */
    (event: SharedPartialMapEvents.StartFlush, listener: () => void);

    /**
     * Emitted when the map's in-memory modifications are flushed to storage.
     *
     * @remarks Listener parameters:
     *
     * - `local` - Whether the clear originated from this client.
     *
     * - `target` -  itself.
     */
    (event: SharedPartialMapEvents.Flush, listener: (isLeader: boolean) => void);
}

/**
 * TODO docs
 */
export interface IChunkedBtree<T, THandle> {
    order: number;

    get(key: string): Promise<T | undefined>;

    has(key: string): Promise<boolean>;

    clear(): IChunkedBtree<T, THandle>;

    flush(
        updates: Map<string, T>,
        deletes: Set<string>,
    ): Promise<{
        readonly newRoot: THandle;
        readonly newHandles: THandle[];
        readonly deletedHandles: THandle[];
    }>;

    summarizeSync(
        updates: Map<string, T>,
        deletes: Set<string>,
    ): IBTreeState<THandle, IBtreeLeafNode>;

    update(update: IBtreeUpdate<THandle>): IChunkedBtree<T, THandle>;

    getAllHandles(): THandle[];

    evict(evictionCountHint: number);

    workingSetSize(): number;
}

/** The state used to to save/load a ChunkedBTree */
export interface IBTreeState<THandle, TRoot extends IBtreeLeafNode | THandle = IBtreeLeafNode | THandle> {
    readonly order: number;
    readonly root: TRoot;
    readonly handles: THandle[];
}
