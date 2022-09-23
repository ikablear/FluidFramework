/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { assert } from "@fluidframework/common-utils";
import { IFluidSerializer, ISerializedHandle, isSerializedHandle } from "@fluidframework/shared-object-base";
import { IBeeTree } from "./interfaces";
import { IDroneBee, IQueenBee } from "./persistedTypes";

export class BeeTreeJSMap<T> implements IBeeTree<T, ISerializedHandle> {
	public static async create<T>(
        queen: IQueenBee<ISerializedHandle | IDroneBee>,
        serializer: IFluidSerializer,
        createHandle: (content: IDroneBee) => Promise<ISerializedHandle>,
    ): Promise<BeeTreeJSMap<T>> {
        let drone: IDroneBee;

        if (isSerializedHandle(queen.root)) {
            const deserializedHandle = serializer.parse(String(queen.root));
            assert(typeof deserializedHandle === "object", "Deserialization of root handle failed");
            drone = await deserializedHandle.get() as IDroneBee;
        } else {
            drone = queen.root;
        }

        const keys = drone.keys;
        const values = drone.values;

        const beeTree = new BeeTreeJSMap<T>(createHandle);

        assert(keys.length === values.length, "Keys and values must correspond to each other");

        for (const [index, key] of keys.entries()) {
            beeTree.map.set(key, values[index]);
        }

        return beeTree;
	}

    public constructor(private readonly createHandle: (content: IDroneBee) => Promise<ISerializedHandle>) {}

    private readonly map = new Map<string, T>();

	public async get(key: string): Promise<T | undefined> {
        return this.map.get(key);
	}

    public async has(key: string): Promise<boolean> {
        return this.map.has(key);
    }

	public async summarize(
        updates: Map<string, T>,
        deletes: Set<string>,
    ): Promise<IQueenBee<ISerializedHandle>> {
		for (const [key, value] of updates.entries()) {
			this.map.set(key, value);
        }

        for (const key of deletes.keys()) {
            this.map.delete(key);
        }

		const drone: IDroneBee = {
            keys: Array.from(this.map.keys()),
            values: Array.from(this.map.values()),
        };

        const queen: IQueenBee<ISerializedHandle> = {
            order: 32,
            root: await this.createHandle(drone),
        };
        return queen;
	}

    public summarizeSync(
        updates: Map<string, T>,
        deletes: Set<string>,
    ): IQueenBee<IDroneBee> {
		for (const [key, value] of updates.entries()) {
			this.map.set(key, value);
        }

        for (const key of deletes.keys()) {
            this.map.delete(key);
        }

		const drone: IDroneBee = {
            keys: Array.from(this.map.keys()),
            values: Array.from(this.map.values()),
        };

        const queen: IQueenBee<IDroneBee> = {
            order: 32,
            root: drone,
        };

        return queen;
	}
}
