'use client';

import { useState, useCallback, useEffect } from 'react';

export interface UndoRedoState<T> {
  past: T[];
  future: T[];
}

export interface UseUndoRedoOptions<T> {
  maxHistory?: number;
  enableKeyboardShortcuts?: boolean;
  onUndo?: (item: T) => void;
  onRedo?: (item: T) => void;
}

export interface UseUndoRedoReturn<T> {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  recordChange: (next: T) => void;
  clearHistory: () => void;
}

/**
 * Pure transition helper: records a new state entry into history.
 * Slices past history to keep at most `maxHistory - 1` prior entries,
 * pushes currentState, and clears future redo entries.
 */
export function recordHistoryStep<T>(
  currentHistory: UndoRedoState<T>,
  currentState: T,
  maxHistory = 100
): UndoRedoState<T> {
  const sliceCount = Math.max(0, maxHistory - 1);
  return {
    past: [...currentHistory.past.slice(-sliceCount), currentState],
    future: [],
  };
}

/**
 * Pure transition helper: performs an undo step.
 * Pops the last entry from past and prepends currentState to future.
 */
export function undoHistoryStep<T>(
  currentHistory: UndoRedoState<T>,
  currentState: T
): { nextHistory: UndoRedoState<T>; targetState: T } | null {
  if (currentHistory.past.length === 0) return null;
  const targetState = currentHistory.past[currentHistory.past.length - 1];
  return {
    nextHistory: {
      past: currentHistory.past.slice(0, -1),
      future: [currentState, ...currentHistory.future],
    },
    targetState,
  };
}

/**
 * Pure transition helper: performs a redo step.
 * Shifts the first entry from future and appends currentState to past.
 */
export function redoHistoryStep<T>(
  currentHistory: UndoRedoState<T>,
  currentState: T
): { nextHistory: UndoRedoState<T>; targetState: T } | null {
  if (currentHistory.future.length === 0) return null;
  const targetState = currentHistory.future[0];
  return {
    nextHistory: {
      past: [...currentHistory.past, currentState],
      future: currentHistory.future.slice(1),
    },
    targetState,
  };
}

/**
 * Custom hook for managing undo/redo history stacks and keyboard shortcuts (Ctrl+Z / Ctrl+Y / Cmd+Z).
 */
export function useUndoRedo<T>(
  state: T,
  onChange: (next: T) => void,
  options?: UseUndoRedoOptions<T>
): UseUndoRedoReturn<T> {
  const maxHistory = options?.maxHistory ?? 100;
  const enableKeyboardShortcuts = options?.enableKeyboardShortcuts ?? true;
  const onUndo = options?.onUndo;
  const onRedo = options?.onRedo;

  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const recordChange = useCallback(
    (next: T) => {
      const sliceCount = Math.max(0, maxHistory - 1);
      setPast((p) => [...p.slice(-sliceCount), state]);
      setFuture([]);
      onChange(next);
    },
    [state, onChange, maxHistory]
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [state, ...f]);
    onChange(prev);
    onUndo?.(prev);
  }, [past, state, onChange, onUndo]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, state]);
    onChange(next);
    onRedo?.(next);
  }, [future, state, onChange, onRedo]);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  // Keyboard shortcut listener (Ctrl+Z / Ctrl+Y / Cmd+Z / Cmd+Shift+Z)
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, undo, redo]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    recordChange,
    clearHistory,
  };
}
