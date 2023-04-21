/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { assert } from "@fluidframework/common-utils";
import { ChangeFamily, ChangeFamilyEditor } from "../change-family";
import { GraphCommit, findCommonAncestor, tagChange } from "../rebase";
import { ReadonlyRepairDataStore } from "../repair";
import { IRepairDataStoreProvider } from "./repairDataStoreProvider";

/**
 * Manages the undo commit tree and repair data associated with undoable commits.
 */
export class UndoRedoManager<TChange, TEditor extends ChangeFamilyEditor> {
	/**
	 * @param repairDataStoryFactory - Factory for creating {@link RepairDataStore}s to create and store repair
	 * data for {@link UndoableCommit}s.
	 * @param changeFamily - {@link ChangeFamily} used for inverting changes.
	 * @param headUndoableCommit - Optional commit to set as the initial undoable commit.
	 */
	public constructor(
		public readonly repairDataStoreProvider: IRepairDataStoreProvider,
		private readonly changeFamily: ChangeFamily<TEditor, TChange>,
		private headUndoableCommit?: UndoableCommit<TChange>,
	) {}

	public get headUndoable(): UndoableCommit<TChange> | undefined {
		return this.headUndoableCommit;
	}

	/**
	 * Adds the provided commit to the undo commit tree.
	 * Should be called for all commits on the relevant branch, including undo commits.
	 */
	public trackCommit(
		commit: GraphCommit<TChange>,
		undoRedoManagerCommitType?: UndoRedoManagerCommitType,
	): void {
		switch (undoRedoManagerCommitType) {
			case UndoRedoManagerCommitType.Undo:
				// TODO check if this is the correct commit?
				this.headUndoableCommit = this.headUndoableCommit?.parent;
				return;
			default: {
				const parent = this.headUndoableCommit;
				const repairData = this.repairDataStoreProvider.createRepairData();
				repairData.capture(this.changeFamily.intoDelta(commit.change), commit.revision);
				this.headUndoableCommit = {
					commit,
					parent,
					repairData,
				};
			}
		}
	}

	/**
	 * Inverts the head undo commit and returns the inverted change.
	 * This change can then be applied and tracked.
	 */
	public undo(): TChange | undefined {
		const commitToUndo = this.headUndoableCommit;

		if (commitToUndo === undefined) {
			// No undoable commits, exit early
			return undefined;
		}

		const { commit, repairData } = commitToUndo;

		return this.changeFamily.rebaser.invert(
			tagChange(commit.change, commit.revision),
			false,
			repairData,
		);
	}

	/**
	 * Creates a copy of this `UndoRedoManager`.
	 * @param repairDataStoreProvider - Optional {@link IRepairDataStoreProvider} to use for the new `UndoRedoManager`.
	 * If one is not provided, the `repairDataStoreProvider` of this `UndoRedoManager` will be cloned.
	 */
	public clone(
		repairDataStoreProvider?: IRepairDataStoreProvider,
		headUndoableCommit?: UndoableCommit<TChange>,
	): UndoRedoManager<TChange, TEditor> {
		return new UndoRedoManager(
			repairDataStoreProvider ?? this.repairDataStoreProvider.clone(),
			this.changeFamily,
			headUndoableCommit ?? this.headUndoableCommit,
		);
	}

	/**
	 * TODO Rename
	 * @param baseHead - the head commit of the branch that was rebased onto.
	 * @param rebasedHead - the head commit of the newly rebased branch.
	 * @param baseUndoRedoManager - the {@link UndoRedoManager} of the branch that was rebased onto
	 * @param originalUndoRedoManager - the {@link UndoRedoManager} of the branch that was rebased.
	 */
	public createUndoRedoManagerAfterRebase(
		baseHead: GraphCommit<TChange>,
		rebasedHead: GraphCommit<TChange>,
		baseUndoRedoManager: UndoRedoManager<TChange, TEditor>,
		originalUndoRedoManager: UndoRedoManager<TChange, TEditor>,
	): UndoRedoManager<TChange, TEditor> {
		if (originalUndoRedoManager.headUndoable === undefined) {
			// The branch that was rebased had no undoable edits so the new undo redo manager
			// should be a copy of the undo redo manager from the base branch.
			return baseUndoRedoManager.clone(this.repairDataStoreProvider);
		}

		const rebasedPath: GraphCommit<TChange>[] = [];
		const ancestor = findCommonAncestor([baseHead], [rebasedHead, rebasedPath]);
		assert(ancestor === baseHead, "The rebased head should be based off of the base branch.");

		const markedCommits = markCommits(rebasedPath, originalUndoRedoManager.headUndoable);
		// Create a complete clone of the base undo redo manager for tracking the rebased path
		const undoRedoManager = baseUndoRedoManager.clone();

		markedCommits.forEach(({ commit, isUndoable }) => {
			if (isUndoable) {
				undoRedoManager.trackCommit(commit, UndoRedoManagerCommitType.Undoable);
			}
			undoRedoManager.repairDataStoreProvider.applyDelta(
				this.changeFamily.intoDelta(commit.change),
			);
		});

		return this.clone(this.repairDataStoreProvider, undoRedoManager.headUndoable);
	}
}

/**
 * Represents a commit that can be undone.
 */
export interface UndoableCommit<TChange> {
	/* The commit to undo */
	readonly commit: GraphCommit<TChange>;
	/* The repair data associated with the commit */
	readonly repairData: ReadonlyRepairDataStore;
	/* The next undoable commit. */
	readonly parent?: UndoableCommit<TChange>;
}

/**
 * The type of a commit in the context of undo/redo manager.
 */
export enum UndoRedoManagerCommitType {
	Undoable,
	Undo,
	Redo,
}

/**
 * Marks the commits in the provided path as undoable or redoable.
 * @param path - the path of commits that may or may not be undoable or redoable.
 * @param headUndoableCommit - the head undoable commit of the undo commit tree that may contain the commits in the path.
 */
export function markCommits<TChange>(
	path: GraphCommit<TChange>[],
	headUndoableCommit?: UndoableCommit<TChange>,
): { commit: GraphCommit<TChange>; isUndoable?: true }[] {
	let currentUndoable: UndoableCommit<TChange> | undefined = headUndoableCommit;

	if (currentUndoable === undefined) {
		// If there are no undoable commits, none are marked
		return path.map((commit) => ({ commit }));
	}

	// Walk up the commit tree to figure out which commits are undoable or redoable
	return path
		.reverse()
		.map((commit) => {
			const markedCommit: { commit: GraphCommit<TChange>; isUndoable?: true } = { commit };
			if (commit.revision === currentUndoable?.commit.revision) {
				markedCommit.isUndoable = true;
				currentUndoable = currentUndoable?.parent;
			}
			return markedCommit;
		})
		.reverse();
}
