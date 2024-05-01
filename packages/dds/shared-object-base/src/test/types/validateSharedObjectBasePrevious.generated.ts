/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/*
 * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
 * Generated by fluid-type-test-generator in @fluidframework/build-tools.
 */

import type * as old from "@fluidframework/shared-object-base-previous/internal";
import type * as current from "../../index.js";

// See 'build-tools/src/type-test-generator/compatibility.ts' for more information.
type TypeOnly<T> = T extends number
	? number
	: T extends string
	? string
	: T extends boolean | bigint | symbol
	? T
	: {
			[P in keyof T]: TypeOnly<T[P]>;
	  };

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassDeclaration_FluidSerializer": {"forwardCompat": false}
 */
declare function get_old_ClassDeclaration_FluidSerializer():
    TypeOnly<old.FluidSerializer>;
declare function use_current_ClassDeclaration_FluidSerializer(
    use: TypeOnly<current.FluidSerializer>): void;
use_current_ClassDeclaration_FluidSerializer(
    get_old_ClassDeclaration_FluidSerializer());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassDeclaration_FluidSerializer": {"backCompat": false}
 */
declare function get_current_ClassDeclaration_FluidSerializer():
    TypeOnly<current.FluidSerializer>;
declare function use_old_ClassDeclaration_FluidSerializer(
    use: TypeOnly<old.FluidSerializer>): void;
use_old_ClassDeclaration_FluidSerializer(
    get_current_ClassDeclaration_FluidSerializer());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "InterfaceDeclaration_IFluidSerializer": {"forwardCompat": false}
 */
declare function get_old_InterfaceDeclaration_IFluidSerializer():
    TypeOnly<old.IFluidSerializer>;
declare function use_current_InterfaceDeclaration_IFluidSerializer(
    use: TypeOnly<current.IFluidSerializer>): void;
use_current_InterfaceDeclaration_IFluidSerializer(
    get_old_InterfaceDeclaration_IFluidSerializer());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "InterfaceDeclaration_IFluidSerializer": {"backCompat": false}
 */
declare function get_current_InterfaceDeclaration_IFluidSerializer():
    TypeOnly<current.IFluidSerializer>;
declare function use_old_InterfaceDeclaration_IFluidSerializer(
    use: TypeOnly<old.IFluidSerializer>): void;
use_old_InterfaceDeclaration_IFluidSerializer(
    get_current_InterfaceDeclaration_IFluidSerializer());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "InterfaceDeclaration_ISharedObject": {"forwardCompat": false}
 */
declare function get_old_InterfaceDeclaration_ISharedObject():
    TypeOnly<old.ISharedObject>;
declare function use_current_InterfaceDeclaration_ISharedObject(
    use: TypeOnly<current.ISharedObject>): void;
use_current_InterfaceDeclaration_ISharedObject(
    get_old_InterfaceDeclaration_ISharedObject());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "InterfaceDeclaration_ISharedObject": {"backCompat": false}
 */
declare function get_current_InterfaceDeclaration_ISharedObject():
    TypeOnly<current.ISharedObject>;
declare function use_old_InterfaceDeclaration_ISharedObject(
    use: TypeOnly<old.ISharedObject>): void;
use_old_InterfaceDeclaration_ISharedObject(
    get_current_InterfaceDeclaration_ISharedObject());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "InterfaceDeclaration_ISharedObjectEvents": {"forwardCompat": false}
 */
declare function get_old_InterfaceDeclaration_ISharedObjectEvents():
    TypeOnly<old.ISharedObjectEvents>;
declare function use_current_InterfaceDeclaration_ISharedObjectEvents(
    use: TypeOnly<current.ISharedObjectEvents>): void;
use_current_InterfaceDeclaration_ISharedObjectEvents(
    get_old_InterfaceDeclaration_ISharedObjectEvents());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "InterfaceDeclaration_ISharedObjectEvents": {"backCompat": false}
 */
declare function get_current_InterfaceDeclaration_ISharedObjectEvents():
    TypeOnly<current.ISharedObjectEvents>;
declare function use_old_InterfaceDeclaration_ISharedObjectEvents(
    use: TypeOnly<old.ISharedObjectEvents>): void;
use_old_InterfaceDeclaration_ISharedObjectEvents(
    get_current_InterfaceDeclaration_ISharedObjectEvents());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "InterfaceDeclaration_ISharedObjectKind": {"forwardCompat": false}
 */
declare function get_old_InterfaceDeclaration_ISharedObjectKind():
    TypeOnly<old.ISharedObjectKind<any>>;
declare function use_current_InterfaceDeclaration_ISharedObjectKind(
    use: TypeOnly<current.ISharedObjectKind<any>>): void;
use_current_InterfaceDeclaration_ISharedObjectKind(
    get_old_InterfaceDeclaration_ISharedObjectKind());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "InterfaceDeclaration_ISharedObjectKind": {"backCompat": false}
 */
declare function get_current_InterfaceDeclaration_ISharedObjectKind():
    TypeOnly<current.ISharedObjectKind<any>>;
declare function use_old_InterfaceDeclaration_ISharedObjectKind(
    use: TypeOnly<old.ISharedObjectKind<any>>): void;
use_old_InterfaceDeclaration_ISharedObjectKind(
    get_current_InterfaceDeclaration_ISharedObjectKind());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassDeclaration_SharedObject": {"forwardCompat": false}
 */
declare function get_old_ClassDeclaration_SharedObject():
    TypeOnly<old.SharedObject>;
declare function use_current_ClassDeclaration_SharedObject(
    use: TypeOnly<current.SharedObject>): void;
use_current_ClassDeclaration_SharedObject(
    get_old_ClassDeclaration_SharedObject());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassDeclaration_SharedObject": {"backCompat": false}
 */
declare function get_current_ClassDeclaration_SharedObject():
    TypeOnly<current.SharedObject>;
declare function use_old_ClassDeclaration_SharedObject(
    use: TypeOnly<old.SharedObject>): void;
use_old_ClassDeclaration_SharedObject(
    get_current_ClassDeclaration_SharedObject());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassDeclaration_SharedObjectCore": {"forwardCompat": false}
 */
declare function get_old_ClassDeclaration_SharedObjectCore():
    TypeOnly<old.SharedObjectCore>;
declare function use_current_ClassDeclaration_SharedObjectCore(
    use: TypeOnly<current.SharedObjectCore>): void;
use_current_ClassDeclaration_SharedObjectCore(
    get_old_ClassDeclaration_SharedObjectCore());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassDeclaration_SharedObjectCore": {"backCompat": false}
 */
declare function get_current_ClassDeclaration_SharedObjectCore():
    TypeOnly<current.SharedObjectCore>;
declare function use_old_ClassDeclaration_SharedObjectCore(
    use: TypeOnly<old.SharedObjectCore>): void;
use_old_ClassDeclaration_SharedObjectCore(
    get_current_ClassDeclaration_SharedObjectCore());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassDeclaration_SummarySerializer": {"forwardCompat": false}
 */
declare function get_old_ClassDeclaration_SummarySerializer():
    TypeOnly<old.SummarySerializer>;
declare function use_current_ClassDeclaration_SummarySerializer(
    use: TypeOnly<current.SummarySerializer>): void;
use_current_ClassDeclaration_SummarySerializer(
    get_old_ClassDeclaration_SummarySerializer());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "ClassDeclaration_SummarySerializer": {"backCompat": false}
 */
declare function get_current_ClassDeclaration_SummarySerializer():
    TypeOnly<current.SummarySerializer>;
declare function use_old_ClassDeclaration_SummarySerializer(
    use: TypeOnly<old.SummarySerializer>): void;
use_old_ClassDeclaration_SummarySerializer(
    get_current_ClassDeclaration_SummarySerializer());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "EnumDeclaration_ValueType": {"forwardCompat": false}
 */
declare function get_old_EnumDeclaration_ValueType():
    TypeOnly<old.ValueType>;
declare function use_current_EnumDeclaration_ValueType(
    use: TypeOnly<current.ValueType>): void;
use_current_EnumDeclaration_ValueType(
    get_old_EnumDeclaration_ValueType());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "EnumDeclaration_ValueType": {"backCompat": false}
 */
declare function get_current_EnumDeclaration_ValueType():
    TypeOnly<current.ValueType>;
declare function use_old_EnumDeclaration_ValueType(
    use: TypeOnly<old.ValueType>): void;
use_old_EnumDeclaration_ValueType(
    get_current_EnumDeclaration_ValueType());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_bindHandles": {"forwardCompat": false}
 */
declare function get_old_FunctionDeclaration_bindHandles():
    TypeOnly<typeof old.bindHandles>;
declare function use_current_FunctionDeclaration_bindHandles(
    use: TypeOnly<typeof current.bindHandles>): void;
use_current_FunctionDeclaration_bindHandles(
    get_old_FunctionDeclaration_bindHandles());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_bindHandles": {"backCompat": false}
 */
declare function get_current_FunctionDeclaration_bindHandles():
    TypeOnly<typeof current.bindHandles>;
declare function use_old_FunctionDeclaration_bindHandles(
    use: TypeOnly<typeof old.bindHandles>): void;
use_old_FunctionDeclaration_bindHandles(
    get_current_FunctionDeclaration_bindHandles());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_createSingleBlobSummary": {"forwardCompat": false}
 */
declare function get_old_FunctionDeclaration_createSingleBlobSummary():
    TypeOnly<typeof old.createSingleBlobSummary>;
declare function use_current_FunctionDeclaration_createSingleBlobSummary(
    use: TypeOnly<typeof current.createSingleBlobSummary>): void;
use_current_FunctionDeclaration_createSingleBlobSummary(
    get_old_FunctionDeclaration_createSingleBlobSummary());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_createSingleBlobSummary": {"backCompat": false}
 */
declare function get_current_FunctionDeclaration_createSingleBlobSummary():
    TypeOnly<typeof current.createSingleBlobSummary>;
declare function use_old_FunctionDeclaration_createSingleBlobSummary(
    use: TypeOnly<typeof old.createSingleBlobSummary>): void;
use_old_FunctionDeclaration_createSingleBlobSummary(
    get_current_FunctionDeclaration_createSingleBlobSummary());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_makeHandlesSerializable": {"forwardCompat": false}
 */
declare function get_old_FunctionDeclaration_makeHandlesSerializable():
    TypeOnly<typeof old.makeHandlesSerializable>;
declare function use_current_FunctionDeclaration_makeHandlesSerializable(
    use: TypeOnly<typeof current.makeHandlesSerializable>): void;
use_current_FunctionDeclaration_makeHandlesSerializable(
    get_old_FunctionDeclaration_makeHandlesSerializable());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_makeHandlesSerializable": {"backCompat": false}
 */
declare function get_current_FunctionDeclaration_makeHandlesSerializable():
    TypeOnly<typeof current.makeHandlesSerializable>;
declare function use_old_FunctionDeclaration_makeHandlesSerializable(
    use: TypeOnly<typeof old.makeHandlesSerializable>): void;
use_old_FunctionDeclaration_makeHandlesSerializable(
    get_current_FunctionDeclaration_makeHandlesSerializable());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_parseHandles": {"forwardCompat": false}
 */
declare function get_old_FunctionDeclaration_parseHandles():
    TypeOnly<typeof old.parseHandles>;
declare function use_current_FunctionDeclaration_parseHandles(
    use: TypeOnly<typeof current.parseHandles>): void;
use_current_FunctionDeclaration_parseHandles(
    get_old_FunctionDeclaration_parseHandles());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_parseHandles": {"backCompat": false}
 */
declare function get_current_FunctionDeclaration_parseHandles():
    TypeOnly<typeof current.parseHandles>;
declare function use_old_FunctionDeclaration_parseHandles(
    use: TypeOnly<typeof old.parseHandles>): void;
use_old_FunctionDeclaration_parseHandles(
    get_current_FunctionDeclaration_parseHandles());

/*
 * Validate forward compatibility by using the old type in place of the current type.
 * If this test starts failing, it indicates a change that is not forward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_serializeHandles": {"forwardCompat": false}
 */
declare function get_old_FunctionDeclaration_serializeHandles():
    TypeOnly<typeof old.serializeHandles>;
declare function use_current_FunctionDeclaration_serializeHandles(
    use: TypeOnly<typeof current.serializeHandles>): void;
use_current_FunctionDeclaration_serializeHandles(
    get_old_FunctionDeclaration_serializeHandles());

/*
 * Validate backward compatibility by using the current type in place of the old type.
 * If this test starts failing, it indicates a change that is not backward compatible.
 * To acknowledge the breaking change, add the following to package.json under
 * typeValidation.broken:
 * "FunctionDeclaration_serializeHandles": {"backCompat": false}
 */
declare function get_current_FunctionDeclaration_serializeHandles():
    TypeOnly<typeof current.serializeHandles>;
declare function use_old_FunctionDeclaration_serializeHandles(
    use: TypeOnly<typeof old.serializeHandles>): void;
use_old_FunctionDeclaration_serializeHandles(
    get_current_FunctionDeclaration_serializeHandles());
