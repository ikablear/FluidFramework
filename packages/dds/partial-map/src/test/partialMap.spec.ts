/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "assert";
import { IFluidHandle } from "@fluidframework/core-interfaces";
import { ISummaryBlob } from "@fluidframework/protocol-definitions";
import { IGCTestProvider, runGCTests } from "@fluid-internal/test-dds-utils";
import {
    MockFluidDataStoreRuntime,
    MockContainerRuntimeFactory,
    MockSharedObjectServices,
    MockStorage,
} from "@fluidframework/test-runtime-utils";
import { SharedPartialMap, PartialMapFactory } from "../partialMap";

function createConnectedMap(id: string, runtimeFactory: MockContainerRuntimeFactory): SharedPartialMap {
    const dataStoreRuntime = new MockFluidDataStoreRuntime();
    const containerRuntime = runtimeFactory.createContainerRuntime(dataStoreRuntime);
    const services = {
        deltaConnection: containerRuntime.createDeltaConnection(),
        objectStorage: new MockStorage(),
    };
    const map = new SharedPartialMap(id, dataStoreRuntime, PartialMapFactory.Attributes);
    map.connect(services);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return map;
}

function createLocalMap(id: string): SharedPartialMap {
    const map = new SharedPartialMap(id, new MockFluidDataStoreRuntime(), PartialMapFactory.Attributes);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return map;
}

class TestSharedPartialMap extends SharedPartialMap {
    // public testApplyStashedOp(content: any): MapLocalOpMetadata {
    //     return this.applyStashedOp(content) as MapLocalOpMetadata;
    // }
}

describe("PartialMap", () => {
    describe("Local state", () => {
        let map: SharedPartialMap;

        beforeEach(async () => {
            map = createLocalMap("testMap");
        });

        describe("API", () => {
            it("Can create a new map", () => {
                assert.ok(map, "could not create a new map");
            });

            it("Can set and get map data", async () => {
                map.set("testKey", "testValue");
                map.set("testKey2", "testValue2");
                assert.equal(await map.get("testKey"), "testValue", "could not retrieve set key 1");
                assert.equal(await map.get("testKey2"), "testValue2", "could not retreive set key 2");
            });

            it("should fire correct map events", async () => {
                const dummyMap = map;
                let valueChangedExpected = true;
                let clearExpected = false;
                let previousValue: any;

                dummyMap.on("op", (arg1, arg2, arg3) => {
                    assert.fail("shouldn't receive an op event");
                });
                dummyMap.on("valueChanged", (changed, local, target) => {
                    assert.equal(valueChangedExpected, true, "valueChange event not expected");
                    valueChangedExpected = false;

                    assert.equal(changed.key, "marco");
                    assert.equal(changed.previousValue, previousValue);

                    assert.equal(local, true, "local should be true for local action for valueChanged event");
                    assert.equal(target, dummyMap, "target should be the map for valueChanged event");
                });
                dummyMap.on("clear", (local, target) => {
                    assert.equal(clearExpected, true, "clear event not expected");
                    clearExpected = false;

                    assert.equal(local, true, "local should be true for local action  for clear event");
                    assert.equal(target, dummyMap, "target should be the map for clear event");
                });
                dummyMap.on("error", (error) => {
                    // propagate error in the event handlers
                    throw error;
                });

                // Test set
                previousValue = undefined;
                dummyMap.set("marco", "polo");
                assert.equal(valueChangedExpected, false, "missing valueChanged event");

                // Test delete
                previousValue = "polo";
                valueChangedExpected = true;
                dummyMap.delete("marco");
                assert.equal(valueChangedExpected, false, "missing valueChanged event");

                // Test clear
                clearExpected = true;
                dummyMap.clear();
                assert.equal(clearExpected, false, "missing clear event");
            });

            it("Should return undefined when a key does not exist in the map", async () => {
                assert.equal(await map.get("missing"), undefined, "get() did not return undefined for missing key");
            });

            it("Should reject undefined and null key sets", () => {
                assert.throws(() => {
                    map.set(undefined as any, "one");
                }, "Should throw for key of undefined");
                assert.throws(() => {
                    map.set(null as any, "two");
                }, "Should throw for key of null");
            });
        });

        describe("Op processing", () => {
            /**
             * These tests test the scenario found in the following bug:
             * {@link https://github.com/microsoft/FluidFramework/issues/2400}
             *
             * - A SharedPartialMap in local state set a key.
             *
             * - A second SharedPartialMap is then created from the snapshot of the first one.
             *
             * - The second SharedPartialMap sets a new value to the same key.
             *
             * - The expected behavior is that the first SharedPartialMap updates the key with the new value.
             * But in the bug the first SharedPartialMap stores the key in its pending state even though it
             * does not send out an op. So, when it gets a remote op with the same key, it ignores it as it
             * has a pending set with the same key.
             */
            it("should correctly process a set operation sent in local state", async () => {
                const dataStoreRuntime1 = new MockFluidDataStoreRuntime();
                const map1 = new SharedPartialMap("testMap1", dataStoreRuntime1, PartialMapFactory.Attributes);

                // Set a key in local state.
                const key = "testKey";
                const value = "testValue";
                map1.set(key, value);

                // Load a new SharedPartialMap in connected state from the snapshot of the first one.
                const containerRuntimeFactory = new MockContainerRuntimeFactory();
                const dataStoreRuntime2 = new MockFluidDataStoreRuntime();
                const containerRuntime2 = containerRuntimeFactory.createContainerRuntime(dataStoreRuntime2);
                const services2 = MockSharedObjectServices.createFromSummary(map1.getAttachSummary().summary);
                services2.deltaConnection = containerRuntime2.createDeltaConnection();

                const map2 = new SharedPartialMap("testMap2", dataStoreRuntime2, PartialMapFactory.Attributes);
                await map2.load(services2);

                // Now connect the first SharedPartialMap
                dataStoreRuntime1.local = false;
                const containerRuntime1 = containerRuntimeFactory.createContainerRuntime(dataStoreRuntime1);
                const services1 = {
                    deltaConnection: containerRuntime1.createDeltaConnection(),
                    objectStorage: new MockStorage(undefined),
                };
                map1.connect(services1);

                // Verify that both the maps have the key.
                assert.equal(await map1.get(key), value, "The first map does not have the key");
                assert.equal(await map2.get(key), value, "The second map does not have the key");

                // Set a new value for the same key in the second SharedPartialMap.
                const newValue = "newvalue";
                map2.set(key, newValue);

                // Process the message.
                containerRuntimeFactory.processAllMessages();

                // Verify that both the maps have the new value.
                assert.equal(map1.get(key), newValue, "The first map did not get the new value");
                assert.equal(map2.get(key), newValue, "The second map did not get the new value");
            });

            // it("metadata op", async () => {
            //     const serializable: ISerializableValue = { type: "Plain", value: "value" };
            //     const dataStoreRuntime1 = new MockFluidDataStoreRuntime();
            //     const op: IMapSetOperation = { type: "set", key: "key", value: serializable };
            //     const map1 = new TestSharedPartialMap("testMap1", dataStoreRuntime1, MapFactory.Attributes);
            //     let metadata = map1.testApplyStashedOp(op);
            //     assert.equal(metadata.type, "add");
            //     assert.equal(metadata.pendingMessageId, 0);
            //     const editmetadata = map1.testApplyStashedOp(op) as IMapKeyEditLocalOpMetadata;
            //     assert.equal(editmetadata.type, "edit");
            //     assert.equal(editmetadata.pendingMessageId, 1);
            //     assert.equal(editmetadata.previousValue.value, "value");
            //     const serializable2: ISerializableValue = { type: "Plain", value: "value2" };
            //     const op2: IMapSetOperation = { type: "set", key: "key2", value: serializable2 };
            //     metadata = map1.testApplyStashedOp(op2);
            //     assert.equal(metadata.type, "add");
            //     assert.equal(metadata.pendingMessageId, 2);
            //     const op3: IMapDeleteOperation = { type: "delete", key: "key2" };
            //     metadata = map1.testApplyStashedOp(op3) as IMapKeyEditLocalOpMetadata;
            //     assert.equal(metadata.type, "edit");
            //     assert.equal(metadata.pendingMessageId, 3);
            //     assert.equal(metadata.previousValue.value, "value2");
            //     const op4: IMapClearOperation = { type: "clear" };
            //     metadata = map1.testApplyStashedOp(op4) as IMapClearLocalOpMetadata;
            //     assert.equal(metadata.pendingMessageId, 4);
            //     assert.equal(metadata.type, "clear");
            //     assert.equal(metadata.previousMap?.get("key")?.value, "value");
            //     assert.equal(metadata.previousMap?.has("key2"), false);
            // });
        });
    });

    describe("Connected state", () => {
        let containerRuntimeFactory: MockContainerRuntimeFactory;
        let map1: SharedPartialMap;
        let map2: SharedPartialMap;

        beforeEach(async () => {
            containerRuntimeFactory = new MockContainerRuntimeFactory();
            // Create the first map
            map1 = createConnectedMap("map1", containerRuntimeFactory);
            // Create and connect a second map
            map2 = createConnectedMap("map2", containerRuntimeFactory);
        });

        describe("API", () => {
            describe(".get()", () => {
                it("Should be able to retrieve a key", async () => {
                    const value = "value";
                    map1.set("test", value);

                    containerRuntimeFactory.processAllMessages();

                    // Verify the local SharedPartialMap
                    assert.equal(await map1.get("test"), value, "could not retrieve key");

                    // Verify the remote SharedPartialMap
                    assert.equal(await map2.get("test"), value, "could not retrieve key from the remote map");
                });
            });

            describe(".has()", () => {
                it("Should return false when a key is not in the map", async () => {
                    assert.equal(await map1.has("notInSet"), false, "has() did not return false for missing key");
                });

                it("Should return true when a key is in the map", async () => {
                    map1.set("inSet", "value");

                    containerRuntimeFactory.processAllMessages();

                    // Verify the local SharedPartialMap
                    assert.equal(await map1.has("inSet"), true, "could not find the key");

                    // Verify the remote SharedPartialMap
                    assert.equal(await map2.has("inSet"), true, "could not find the key in the remote map");
                });
            });

            describe(".set()", () => {
                it("Should set a key to a value", async () => {
                    const value = "value";
                    map1.set("test", value);

                    containerRuntimeFactory.processAllMessages();

                    // Verify the local SharedPartialMap
                    assert.equal(await map1.has("test"), true, "could not find the set key");
                    assert.equal(await map1.get("test"), value, "could not get the set key");

                    // Verify the remote SharedPartialMap
                    assert.equal(await map2.has("test"), true, "could not find the set key in remote map");
                    assert.equal(await map2.get("test"), value, "could not get the set key from remote map");
                });

                it("Should be able to set a shared object handle as a key", async () => {
                    const subMap = createLocalMap("subMap");
                    map1.set("test", subMap.handle);

                    containerRuntimeFactory.processAllMessages();

                    // Verify the local SharedPartialMap
                    const localSubMap = await map1.get<IFluidHandle>("test");
                    assert(localSubMap);
                    assert.equal(
                        localSubMap.absolutePath, subMap.handle.absolutePath, "could not get the handle's path");

                    // Verify the remote SharedPartialMap
                    const remoteSubMap = await map2.get<IFluidHandle>("test");
                    assert(remoteSubMap);
                    assert.equal(
                        remoteSubMap.absolutePath,
                        subMap.handle.absolutePath,
                        "could not get the handle's path in remote map");
                });

                it("Should be able to set and retrieve a plain object with nested handles", async () => {
                    const subMap = createLocalMap("subMap");
                    const subMap2 = createLocalMap("subMap2");
                    const containingObject = {
                        subMapHandle: subMap.handle,
                        nestedObj: {
                            subMap2Handle: subMap2.handle,
                        },
                    };
                    map1.set("object", containingObject);

                    containerRuntimeFactory.processAllMessages();

                    const retrieved = await map1.get("object");
                    const retrievedSubMap = await retrieved.subMapHandle.get();
                    assert.equal(retrievedSubMap, subMap, "could not get nested map 1");
                    const retrievedSubMap2 = await retrieved.nestedObj.subMap2Handle.get();
                    assert.equal(retrievedSubMap2, subMap2, "could not get nested map 2");
                });

                it("Shouldn't clear value if there is pending set", () => {
                    const valuesChanged: IValueChanged[] = [];
                    let clearCount = 0;

                    map1.on("valueChanged", (changed, local, target) => {
                        valuesChanged.push(changed);
                    });
                    map1.on("clear", (local, target) => {
                        clearCount++;
                    });

                    map2.set("map2key", "value2");
                    map2.clear();
                    map1.set("map1Key", "value1");
                    map2.clear();

                    containerRuntimeFactory.processSomeMessages(2);

                    assert.equal(valuesChanged.length, 3);
                    assert.equal(valuesChanged[0].key, "map1Key");
                    assert.equal(valuesChanged[0].previousValue, undefined);
                    assert.equal(valuesChanged[1].key, "map2key");
                    assert.equal(valuesChanged[1].previousValue, undefined);
                    assert.equal(valuesChanged[2].key, "map1Key");
                    assert.equal(valuesChanged[2].previousValue, undefined);
                    assert.equal(clearCount, 1);
                    assert.equal(map1.size, 1);
                    assert.equal(map1.get("map1Key"), "value1");

                    containerRuntimeFactory.processSomeMessages(2);

                    assert.equal(valuesChanged.length, 3);
                    assert.equal(clearCount, 2);
                    assert.equal(map1.size, 0);
                });

                it("Shouldn't overwrite value if there is pending set", () => {
                    const value1 = "value1";
                    const pending1 = "pending1";
                    const pending2 = "pending2";
                    map1.set("test", value1);
                    map2.set("test", pending1);
                    map2.set("test", pending2);

                    containerRuntimeFactory.processSomeMessages(1);

                    // Verify the SharedPartialMap with processed message
                    assert.equal(map1.has("test"), true, "could not find the set key");
                    assert.equal(map1.get("test"), value1, "could not get the set key");

                    // Verify the SharedPartialMap with 2 pending messages
                    assert.equal(map2.has("test"), true, "could not find the set key in pending map");
                    assert.equal(map2.get("test"), pending2, "could not get the set key from pending map");

                    containerRuntimeFactory.processSomeMessages(1);

                    // Verify the SharedPartialMap gets updated from remote
                    assert.equal(map1.has("test"), true, "could not find the set key");
                    assert.equal(map1.get("test"), pending1, "could not get the set key");

                    // Verify the SharedPartialMap with 1 pending message
                    assert.equal(map2.has("test"), true, "could not find the set key in pending map");
                    assert.equal(map2.get("test"), pending2, "could not get the set key from pending map");
                });

                it("Shouldn't set values when pending clear", () => {
                    const key = "test";
                    map1.set(key, "map1value1");
                    map2.set(key, "map2value2");
                    map2.clear();
                    map2.set(key, "map2value3");
                    map2.clear();

                    // map1.set(key, "map1value1");
                    containerRuntimeFactory.processSomeMessages(1);

                    // Verify the SharedPartialMap with processed message
                    assert.equal(map1.has("test"), true, "could not find the set key");
                    assert.equal(map1.get("test"), "map1value1", "could not get the set key");

                    // Verify the SharedPartialMap with 2 pending clears
                    assert.equal(map2.has("test"), false, "found the set key in pending map");

                    // map2.set(key, "map2value2");
                    containerRuntimeFactory.processSomeMessages(1);

                    // Verify the SharedPartialMap gets updated from remote
                    assert.equal(map1.has("test"), true, "could not find the set key");
                    assert.equal(map1.get("test"), "map2value2", "could not get the set key");

                    // Verify the SharedPartialMap with 2 pending clears
                    assert.equal(map2.has("test"), false, "found the set key in pending map");

                    // map2.clear();
                    containerRuntimeFactory.processSomeMessages(1);

                    // Verify the SharedPartialMap gets updated from remote clear
                    assert.equal(map1.has("test"), false, "found the set key");

                    // Verify the SharedPartialMap with 1 pending clear
                    assert.equal(map2.has("test"), false, "found the set key in pending map");

                    // map2.set(key, "map2value3");
                    containerRuntimeFactory.processSomeMessages(1);

                    // Verify the SharedPartialMap gets updated from remote
                    assert.equal(map1.has("test"), true, "could not find the set key");
                    assert.equal(map1.get("test"), "map2value3", "could not get the set key");

                    // Verify the SharedPartialMap with 1 pending clear
                    assert.equal(map2.has("test"), false, "found the set key in pending map");

                    // map2.clear();
                    containerRuntimeFactory.processSomeMessages(1);

                    // Verify the SharedPartialMap gets updated from remote clear
                    assert.equal(map1.has("test"), false, "found the set key");

                    // Verify the SharedPartialMap with no more pending clear
                    assert.equal(map2.has("test"), false, "found the set key in pending map");

                    map1.set(key, "map1value4");
                    containerRuntimeFactory.processSomeMessages(1);

                    // Verify the SharedPartialMap gets updated from local
                    assert.equal(map1.has("test"), true, "could not find the set key");
                    assert.equal(map1.get("test"), "map1value4", "could not get the set key");

                    // Verify the SharedPartialMap gets updated from remote
                    assert.equal(map1.has("test"), true, "could not find the set key");
                    assert.equal(map1.get("test"), "map1value4", "could not get the set key");
                });
            });

            describe(".delete()", () => {
                it("Can set and delete map key", async () => {
                    map1.set("testKey", "testValue");
                    map1.set("testKey2", "testValue2");
                    map1.delete("testKey");
                    map1.delete("testKey2");
                    assert.equal(map1.has("testKey"), false, "could not delete key 1");
                    assert.equal(map1.has("testKey2"), false, "could not delete key 2");
                    map1.set("testKey", "testValue");
                    map1.set("testKey2", "testValue2");
                    assert.equal(map1.get("testKey"), "testValue", "could not retrieve set key 1 after delete");
                    assert.equal(map1.get("testKey2"), "testValue2", "could not retrieve set key 2 after delete");
                });
            });
        });
    });

    describe("Garbage Collection", () => {
        class GCSharedPartialMapProvider implements IGCTestProvider {
            private subMapCount = 0;
            private _expectedRoutes: string[] = [];
            private readonly map1: SharedPartialMap;
            private readonly map2: SharedPartialMap;
            private readonly containerRuntimeFactory: MockContainerRuntimeFactory;

            constructor() {
                this.containerRuntimeFactory = new MockContainerRuntimeFactory();
                this.map1 = createConnectedMap("map1", this.containerRuntimeFactory);
                this.map2 = createConnectedMap("map2", this.containerRuntimeFactory);
            }

            public get sharedObject() {
                // Return the remote SharedPartialMap because we want to verify its summary data.
                return this.map2;
            }

            public get expectedOutboundRoutes() {
                return this._expectedRoutes;
            }

            public async addOutboundRoutes() {
                const newSubMapId = `subMap-${++this.subMapCount}`;
                const subMap = createLocalMap(newSubMapId);
                this.map1.set(newSubMapId, subMap.handle);
                this._expectedRoutes.push(subMap.handle.absolutePath);
                this.containerRuntimeFactory.processAllMessages();
            }

            public async deleteOutboundRoutes() {
                // Delete the last handle that was added.
                const subMapId = `subMap-${this.subMapCount}`;
                const deletedHandle = await this.map1.get<IFluidHandle>(subMapId);
                assert(deletedHandle, "Route must be added before deleting");

                this.map1.delete(subMapId);
                // Remove deleted handle's route from expected routes.
                this._expectedRoutes = this._expectedRoutes.filter((route) => route !== deletedHandle.absolutePath);
                this.containerRuntimeFactory.processAllMessages();
            }

            public async addNestedHandles() {
                const subMapId1 = `subMap-${++this.subMapCount}`;
                const subMapId2 = `subMap-${++this.subMapCount}`;
                const subMap = createLocalMap(subMapId1);
                const subMap2 = createLocalMap(subMapId2);
                const containingObject = {
                    subMapHandle: subMap.handle,
                    nestedObj: {
                        subMap2Handle: subMap2.handle,
                    },
                };
                this.map1.set(subMapId2, containingObject);
                this._expectedRoutes.push(subMap.handle.absolutePath, subMap2.handle.absolutePath);
                this.containerRuntimeFactory.processAllMessages();
            }
        }

        runGCTests(GCSharedPartialMapProvider);
    });
});
