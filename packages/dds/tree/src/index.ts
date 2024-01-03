/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export {
	EmptyKey,
	FieldKey,
	TreeType,
	Value,
	TreeValue,
	AnchorSet,
	DetachedField,
	UpPath,
	Range,
	RangeUpPath,
	PlaceUpPath,
	DetachedRangeUpPath,
	DetachedPlaceUpPath,
	PlaceIndex,
	NodeIndex,
	FieldUpPath,
	Anchor,
	RootField,
	ChildCollection,
	ChildLocation,
	DeltaVisitor,
	AnnouncedVisitor,
	FieldMapObject,
	NodeData,
	GenericTreeNode,
	JsonableTree,
	ProtoNodes,
	DeltaRoot,
	DeltaProtoNode,
	DeltaMark,
	DeltaDetachedNodeId,
	DeltaFieldMap,
	DeltaDetachedNodeChanges,
	DeltaDetachedNodeBuild,
	DeltaDetachedNodeDestruction,
	DeltaDetachedNodeRename,
	DeltaFieldChanges,
	RevisionTag,
	rootFieldKey,
	rootField,
	ITreeCursor,
	CursorLocationType,
	ITreeCursorSynchronous,
	GenericFieldsNode,
	AnchorLocator,
	TreeNavigationResult,
	IEditableForest,
	IForestSubscription,
	TreeLocation,
	FieldLocation,
	ForestLocation,
	ITreeSubscriptionCursor,
	ITreeSubscriptionCursorState,
	TreeNodeSchemaIdentifier,
	TreeFieldStoredSchema,
	ValueSchema,
	TreeNodeStoredSchema,
	TreeStoredSchemaSubscription,
	FieldKindIdentifier,
	TreeTypeSet,
	TreeStoredSchema,
	FieldAnchor,
	SchemaEvents,
	ChangesetLocalId,
	ForestEvents,
	PathRootPrefix,
	AnchorSlot,
	AnchorNode,
	anchorSlot,
	UpPathDefault,
	AnchorEvents,
	AnchorSetRootEvents,
	FieldKindSpecifier,
	AllowedUpdateType,
	PathVisitor,
	Adapters,
	TreeAdapter,
	MapTree,
	Revertible,
	RevertibleKind,
	RevertResult,
	DiscardResult,
	forbiddenFieldKindIdentifier,
	StoredSchemaCollection,
	ErasedTreeNodeSchemaDataFormat,
} from "./core/index.js";

export {
	Brand,
	Opaque,
	extractFromOpaque,
	brand,
	ValueFromBranded,
	NameFromBranded,
	JsonCompatibleReadOnly,
	JsonCompatible,
	JsonCompatibleObject,
	NestedMap,
	fail,
	IdAllocator,
	TransactionResult,
	BrandedKey,
	BrandedMapSubset,
	RangeQueryResult,
	Named,
	oneFromSet,
	disposeSymbol,
	IDisposable,
} from "./util/index.js";

export {
	Events,
	IsEvent,
	ISubscribable,
	createEmitter,
	IEmitter,
	NoListenersCallback,
	HasListeners,
} from "./events/index.js";

export { leaf } from "./domains/index.js";

export {
	FieldKind as FlexFieldKind,
	Multiplicity,
	isNeverField,
	FullSchemaPolicy,
	typeNameSymbol,
	valueSymbol,
	ContextuallyTypedNodeDataObject,
	ContextuallyTypedNodeData,
	MarkedArrayLike,
	isContextuallyTypedNodeDataObject,
	defaultSchemaPolicy,
	jsonableTreeFromCursor,
	StableNodeKey,
	LocalNodeKey,
	compareLocalNodeKeys,
	IDefaultEditBuilder,
	ValueFieldEditBuilder,
	OptionalFieldEditBuilder,
	SequenceFieldEditBuilder,
	prefixPath,
	prefixFieldPath,
	cursorForJsonableTreeNode as singleTextCursor,
	stackTreeNodeCursor,
	CursorAdapter,
	CursorWithNode,
	EditableTreeEvents,
	ArrayLikeMut,
	FieldKinds,
	ContextuallyTypedFieldData,
	cursorFromContextualData,
	AllowedTypes as FlexAllowedTypes,
	FlexTreeNodeSchema,
	FlexTreeSchema,
	SchemaLibrary,
	SchemaLibraryData,
	TreeFieldSchema,
	Any,
	NewFieldContent,
	NodeExistsConstraint,
	cursorForTypedTreeData,
	LazyTreeNodeSchema,
	FieldGenerator,
	TreeDataContext,
	nodeKeyFieldKey,
	SchemaLintConfiguration,
	TreeStatus,
	FlexTreeFieldNode,
	FlexibleFieldContent,
	FlexibleNodeContent,
	FlexTreeLeafNode,
	FlexTreeMapNode,
	FlexTreeOptionalField,
	FlexTreeRequiredField,
	FlexTreeSequenceField,
	FlexTreeObjectNode,
	FlexTreeObjectNodeTyped,
	AssignableFieldKinds,
	FlexTreeContext as TreeContext,
	FlexTreeTypedField,
	FlexTreeTypedNode,
	FlexTreeTypedNodeUnion,
	FlexTreeEntity,
	FlexTreeField,
	FlexTreeNode,
	TreeNodeSchemaBase,
	FieldNodeSchema,
	LeafNodeSchema,
	MapNodeSchema,
	ObjectNodeSchema,
	CheckTypesOverlap,
	SchemaBuilderBase,
	ImplicitFieldSchema as FlexImplicitFieldSchema,
	ImplicitAllowedTypes as FlexImplicitAllowedTypes,
	Unenforced,
	schemaIsFieldNode,
	schemaIsLeaf,
	schemaIsMap,
	schemaIsObjectNode,
	AllowedTypeSet,
	SchemaBuilderOptions,
	TreeEvent,
	SchemaCollection,
	TreeCompressionStrategy,
	treeSchemaFromStoredSchema,
	encodeTreeSchema,
	stackTreeFieldCursor,
	FlexTreeUnknownUnboxed,
	InsertableFlexNode,
	InsertableFlexField,
	AllowedTypesToFlexInsertableTree,
	ApplyMultiplicity,
	NormalizeObjectNodeFields,
	NormalizeFieldSchema,
	Fields,
	MapFieldSchema,
	ArrayToUnion,
	ExtractItemType,
	LazyItem,
} from "./feature-libraries/index.js";

export {
	TreeArrayNode,
	TreeMapNodeBase,
	Unhydrated,
	IterableTreeListContent,
	TreeNode,
	TreeArrayNodeBase,
	create,
} from "./simple-tree/index.js";

export {
	ISharedTree,
	ITreeCheckout,
	ITransaction,
	runSynchronous,
	SharedTreeFactory,
	SharedTreeOptions,
	ITreeCheckoutFork,
	CheckoutEvents,
	SchematizeConfiguration,
	TreeContent,
	InitializeAndSchematizeConfiguration,
	SchemaConfiguration,
	ForestType,
	SharedTreeContentSnapshot,
	FlexTreeView,
	ITreeViewFork,
	buildTreeConfiguration,
	ISharedTreeEditor,
	ISchemaEditor,
} from "./shared-tree/index.js";

export {
	ITree,
	TreeNodeSchema,
	TreeConfiguration,
	TreeView,
	SchemaFactory,
	Tree,
	TreeApi,
	ImplicitFieldSchema,
	TreeFieldFromImplicitField,
	TreeNodeEvents,
	NodeFromSchema,
	TreeMapNode,
	InsertableTreeNodeFromImplicitAllowedTypes,
	TreeLeafValue,
	type,
	WithType,
	AllowedTypes,
	ApplyKind,
	FieldKind,
	FieldSchema,
	ImplicitAllowedTypes,
	InsertableObjectFromSchemaRecord,
	InsertableTreeFieldFromImplicitField,
	InsertableTypedNode,
	NodeBuilderData,
	NodeKind,
	ObjectFromSchemaRecord,
	TreeNodeFromImplicitAllowedTypes,
	TreeNodeSchemaClass,
	TreeNodeSchemaCore,
	TreeNodeSchemaNonClass,

	// experimental @internal APIs:
	adaptEnum,
	enumFromStrings,
	singletonSchema,
	typedObjectValues,

	// test recursive schema for checking that d.ts files handles schema correctly
	test_RecursiveObject,
	test_RecursiveObject_base,
} from "./simple-tree/index.js";
export { SharedTree, TreeFactory } from "./treeFactory.js";

export type { ICodecOptions, JsonValidator, SchemaValidationFunction } from "./codec/index.js";
export { noopValidator } from "./codec/index.js";
export { typeboxValidator } from "./external-utilities/index.js";

// TODO: When previously tagged '@internal', these types could not be included in `InternalClassTreeTypes` due to https://github.com/microsoft/rushstack/issues/3639
export {
	Invariant,
	Contravariant,
	Covariant,
	BrandedType,
	ExtractFromOpaque,
	Assume,
	AllowOptional,
	RequiredFields,
	OptionalFields,
	_InlineTrick,
	_RecursiveTrick,
	FlattenKeys,
	AllowOptionalNotFlattened,
	isAny,
	BrandedKeyContent,
	ErasedType,
	Erased,
	RestrictiveReadonlyRecord,
	MakeNominal,
} from "./util/index.js";

export {
	NormalizeField,
	NormalizeAllowedTypes,
	FlexTreeTypedFieldInner,
	FlexTreeUnboxFieldInner,
	FlexTreeObjectNodeFields,
	FlexTreeUnboxField,
	FlexTreeUnboxNode,
	FlexTreeUnboxNodeUnion,
	FlexTreeNodeKeyField,
	IsArrayOfOne,
	FlexibleNodeSubSequence,
	flexTreeMarker,
	FlexTreeEntityKind,
	NodeKeys,
	CollectOptions,
	TypedFields,
	UnbrandedName,
	EmptyObject,
	FlexList,
	FlexListToUnion,

	// These field kind types really only need to show up via FieldKinds.name, and not as top level names in the package.
	// These names also are collision prone.
	Required,
	Optional,
	NodeKeyFieldKind,
	Forbidden,
	Sequence,
} from "./feature-libraries/index.js";
