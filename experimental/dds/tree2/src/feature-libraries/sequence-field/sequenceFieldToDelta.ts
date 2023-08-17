/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { assert, unreachableCase } from "@fluidframework/common-utils";
import { brandOpaque, fail, Mutable, OffsetListFactory } from "../../util";
import { Delta, RepairDataBuilder } from "../../core";
import { singleTextCursor } from "../treeTextCursor";
import { IdAllocator } from "../modular-schema";
import { Mark, MarkList, NoopMarkType } from "./format";
import {
	areInputCellsEmpty,
	areOutputCellsEmpty,
	getEffectiveNodeChanges,
	markIsTransient,
} from "./utils";

export type ToDelta<TNodeChange> = (
	child: TNodeChange,
	repairDataBuilder: RepairDataBuilder,
	idAllocator: IdAllocator,
) => Delta.Modify;

export function sequenceFieldToDelta<TNodeChange>(
	marks: MarkList<TNodeChange>,
	deltaFromChild: ToDelta<TNodeChange>,
	repairDataBuilder: RepairDataBuilder,
	idAllocator: IdAllocator,
): Delta.MarkList {
	const out = new OffsetListFactory<Delta.Mark>();
	for (const mark of marks) {
		const changes = getEffectiveNodeChanges(mark);
		const cellDelta = cellDeltaFromMark(
			mark,
			changes === undefined,
			repairDataBuilder,
			idAllocator,
		);

		if (!Array.isArray(cellDelta)) {
			const fullDelta = withChildModificationsIfAny(
				changes,
				cellDelta,
				deltaFromChild,
				repairDataBuilder,
				idAllocator,
			);
			out.push(fullDelta);
		} else {
			cellDelta.forEach((delta) => out.push(delta));
		}
	}
	return out.list;
}

function cellDeltaFromMark<TNodeChange>(
	mark: Mark<TNodeChange>,
	ignoreTransient: boolean,
	repairDataBuilder: RepairDataBuilder,
	idAllocator: IdAllocator,
): Mutable<Delta.Mark> | Delta.Mark[] {
	if (!areInputCellsEmpty(mark) && !areOutputCellsEmpty(mark)) {
		// Since each cell is associated with exactly one node,
		// the cell starting end ending populated means the cell content has not changed.
		return mark.count;
	} else if (
		areInputCellsEmpty(mark) &&
		areOutputCellsEmpty(mark) &&
		(!markIsTransient(mark) || ignoreTransient)
	) {
		// The cell starting and ending empty means the cell content has not changed,
		// unless transient content was inserted/attached.
		return 0;
	} else {
		const type = mark.type;
		// Inline into `switch(mark.type)` once we upgrade to TS 4.7
		switch (type) {
			case "Insert": {
				const cursors = mark.content.map(singleTextCursor);
				const insertMark: Mutable<Delta.Insert> = {
					type: Delta.MarkType.Insert,
					content: cursors,
				};
				if (mark.transientDetach !== undefined) {
					insertMark.isTransient = true;
				}
				return insertMark;
			}
			case "MoveIn":
			case "ReturnTo": {
				return {
					type: Delta.MarkType.MoveIn,
					count: mark.count,
					moveId: brandOpaque<Delta.MoveId>(mark.id),
				};
			}
			case NoopMarkType: {
				return mark.count;
			}
			case "Delete": {
				const detachedField = repairDataBuilder.handler({
					revision: mark.revision,
					localId: mark.id,
				});
				const moveOutMarks: Mutable<Delta.MoveOut>[] = [];
				const moveInMarks: Delta.MoveIn[] = [];
				for (let i = 0; i < mark.count; i++) {
					const moveId = brandOpaque<Delta.MoveId>(idAllocator());
					moveOutMarks.push({
						type: Delta.MarkType.MoveOut,
						moveId,
						count: 1,
						isRemoval: true,
					});
					moveInMarks.push({
						type: Delta.MarkType.MoveIn,
						count: 1,
						moveId,
						isRemoval: true,
					});
				}
				repairDataBuilder.accumulator(detachedField, moveInMarks);
				return moveOutMarks.length === 1 ? moveOutMarks[0] : moveOutMarks;
			}
			case "MoveOut":
			case "ReturnFrom": {
				return {
					type: Delta.MarkType.MoveOut,
					moveId: brandOpaque<Delta.MoveId>(mark.id),
					count: mark.count,
				};
			}
			case "Revive": {
				const insertMark: Mutable<Delta.Insert> = {
					type: Delta.MarkType.Insert,
					content: mark.content,
				};
				if (mark.transientDetach !== undefined) {
					insertMark.isTransient = true;
				}
				return insertMark;
			}
			case "Placeholder":
				fail("Should not have placeholders in a changeset being converted to delta");
			default:
				unreachableCase(type);
		}
	}
}

function withChildModificationsIfAny<TNodeChange>(
	changes: TNodeChange | undefined,
	deltaMark: Mutable<Delta.Mark>,
	deltaFromChild: ToDelta<TNodeChange>,
	repairDataBuilder: RepairDataBuilder,
	idAllocator: IdAllocator,
): Delta.Mark {
	if (changes !== undefined) {
		const modify = deltaFromChild(changes, repairDataBuilder, idAllocator);
		if (modify.fields !== undefined) {
			if (typeof deltaMark === "number") {
				assert(deltaMark === 1, 0x72d /* Invalid nested changes on non-1 skip mark */);
				return modify;
			} else {
				assert(
					deltaMark.type !== Delta.MarkType.MoveIn,
					0x72e /* Invalid nested changes on MoveIn mark */,
				);
				return { ...deltaMark, fields: modify.fields };
			}
		}
	}
	return deltaMark;
}
