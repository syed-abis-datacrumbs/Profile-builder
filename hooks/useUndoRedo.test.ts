import { describe, expect, it } from 'bun:test';
import {
  recordHistoryStep,
  undoHistoryStep,
  redoHistoryStep,
  UndoRedoState,
} from './useUndoRedo';

describe('useUndoRedo history state machine', () => {
  it('records new history entries and resets future', () => {
    const initial: UndoRedoState<string> = { past: [], future: ['stale-future'] };
    const next = recordHistoryStep(initial, 'state-1', 100);

    expect(next.past).toEqual(['state-1']);
    expect(next.future).toEqual([]);
  });

  it('enforces maxHistory boundary via slicing', () => {
    let history: UndoRedoState<number> = { past: [], future: [] };
    const maxHistory = 4; // allows max 4 entries: 3 prior + 1 current

    for (let i = 0; i < 10; i++) {
      history = recordHistoryStep(history, i, maxHistory);
    }

    // Since maxHistory is 4, sliceCount is maxHistory - 1 = 3.
    // past can have at most 4 items: the 3 sliced items + the newly pushed item.
    expect(history.past.length).toBe(4);
    expect(history.past).toEqual([6, 7, 8, 9]);
    expect(history.future).toEqual([]);
  });

  it('undo pops from past and prepends to future', () => {
    const history: UndoRedoState<string> = {
      past: ['v1', 'v2'],
      future: [],
    };
    const currentState = 'v3';

    const result = undoHistoryStep(history, currentState);
    expect(result).not.toBeNull();
    expect(result!.targetState).toBe('v2');
    expect(result!.nextHistory.past).toEqual(['v1']);
    expect(result!.nextHistory.future).toEqual(['v3']);
  });

  it('undo returns null when past is empty', () => {
    const history: UndoRedoState<string> = {
      past: [],
      future: ['v2'],
    };
    const result = undoHistoryStep(history, 'v1');
    expect(result).toBeNull();
  });

  it('redo shifts from future and appends to past', () => {
    const history: UndoRedoState<string> = {
      past: ['v1'],
      future: ['v3', 'v4'],
    };
    const currentState = 'v2';

    const result = redoHistoryStep(history, currentState);
    expect(result).not.toBeNull();
    expect(result!.targetState).toBe('v3');
    expect(result!.nextHistory.past).toEqual(['v1', 'v2']);
    expect(result!.nextHistory.future).toEqual(['v4']);
  });

  it('redo returns null when future is empty', () => {
    const history: UndoRedoState<string> = {
      past: ['v1'],
      future: [],
    };
    const result = redoHistoryStep(history, 'v2');
    expect(result).toBeNull();
  });

  it('maintains integrity across a full record -> undo -> redo -> branch sequence', () => {
    let history: UndoRedoState<string> = { past: [], future: [] };
    let state = 'step-0';

    // 1. Record step-1
    history = recordHistoryStep(history, state);
    state = 'step-1';

    // 2. Record step-2
    history = recordHistoryStep(history, state);
    state = 'step-2';

    expect(history.past).toEqual(['step-0', 'step-1']);
    expect(history.future).toEqual([]);

    // 3. Undo to step-1
    const undo1 = undoHistoryStep(history, state);
    expect(undo1).not.toBeNull();
    history = undo1!.nextHistory;
    state = undo1!.targetState;

    expect(state).toBe('step-1');
    expect(history.past).toEqual(['step-0']);
    expect(history.future).toEqual(['step-2']);

    // 4. Undo to step-0
    const undo2 = undoHistoryStep(history, state);
    expect(undo2).not.toBeNull();
    history = undo2!.nextHistory;
    state = undo2!.targetState;

    expect(state).toBe('step-0');
    expect(history.past).toEqual([]);
    expect(history.future).toEqual(['step-1', 'step-2']);

    // 5. Undo again when empty -> returns null
    const undo3 = undoHistoryStep(history, state);
    expect(undo3).toBeNull();

    // 6. Redo to step-1
    const redo1 = redoHistoryStep(history, state);
    expect(redo1).not.toBeNull();
    history = redo1!.nextHistory;
    state = redo1!.targetState;

    expect(state).toBe('step-1');
    expect(history.past).toEqual(['step-0']);
    expect(history.future).toEqual(['step-2']);

    // 7. Branching edit: record new step-3 while future was non-empty
    history = recordHistoryStep(history, state);
    state = 'step-3';

    expect(state).toBe('step-3');
    expect(history.past).toEqual(['step-0', 'step-1']);
    expect(history.future).toEqual([]); // future was discarded upon new edit

    // 8. Redo is now impossible
    const redoAfterBranch = redoHistoryStep(history, state);
    expect(redoAfterBranch).toBeNull();
  });
});
