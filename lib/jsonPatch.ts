/**
 * RFC 6902 JSON Patch implementation in pure TypeScript.
 * Provides resilient, zero-dependency patch application for LLM-driven delta updates.
 */

export type PatchOp = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';

export interface JsonPatchOperation {
  op: PatchOp | string;
  path: string;
  value?: unknown;
  from?: string;
}

export interface PatchResult<T> {
  success: boolean;
  document: T;
  appliedCount: number;
  errors: string[];
}

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function unescapePointer(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

function parsePointer(path: string): string[] {
  if (!path || path === '/') return [];
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return normalized.split('/').map(unescapePointer);
}

function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function getTargetParent(
  root: unknown,
  tokens: string[],
  autoCreate = false
): { parent: unknown; key: string } | null {
  if (tokens.length === 0) return null;

  let current = root;
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (FORBIDDEN_KEYS.has(token)) return null;

    if (Array.isArray(current)) {
      const idx = parseInt(token, 10);
      if (isNaN(idx) || idx < 0 || idx >= current.length) return null;
      current = current[idx];
    } else if (isObject(current)) {
      if (!(token in current)) {
        if (autoCreate) {
          const nextToken = tokens[i + 1];
          const isNextArray = nextToken === '-' || (!isNaN(parseInt(nextToken, 10)) && /^\d+$/.test(nextToken));
          current[token] = isNextArray ? [] : {};
        } else {
          return null;
        }
      }
      current = current[token];
    } else {
      return null;
    }
  }

  const lastKey = tokens[tokens.length - 1];
  if (FORBIDDEN_KEYS.has(lastKey)) return null;

  return { parent: current, key: lastKey };
}

/**
 * Applies a single RFC 6902 operation onto the given mutable document.
 */
function applySingleOp(doc: unknown, operation: JsonPatchOperation): void {
  const op = operation.op.toLowerCase();
  let path = operation.path;

  // Resilient normalization for LLMs targeting string fields (bullets, skills, interests, description, content, summary, about) with array-like notation:
  // e.g. /workExperience/0/bullets/- or /customSections/0/content/0 -> /customSections/0/content
  let targetIndexForStringField: number | null = null;
  const arrayOnStringMatch = path.match(/^(.+\/(?:bullets|skills|interests|description|content|summary|about))\/(?:-|\d+|first|last)$/i);
  if (arrayOnStringMatch) {
    const rawIdxStr = path.slice(arrayOnStringMatch[1].length + 1);
    if (rawIdxStr === '0' || rawIdxStr.toLowerCase() === 'first') {
      targetIndexForStringField = 0;
    } else if (rawIdxStr.toLowerCase() === 'last' || rawIdxStr === '-') {
      targetIndexForStringField = -1;
    } else if (!isNaN(parseInt(rawIdxStr, 10))) {
      targetIndexForStringField = parseInt(rawIdxStr, 10);
    }
    path = arrayOnStringMatch[1];
  }

  const tokens = parsePointer(path);

  if (tokens.length === 0) {
    if (op === 'replace') {
      throw new Error('Cannot replace root document directly via patch token');
    }
    throw new Error(`Invalid root operation: ${op}`);
  }

  const target = getTargetParent(doc, tokens, op === 'add' || op === 'replace');
  if (!target) {
    throw new Error(`Target path not found: ${operation.path}`);
  }

  const { parent, key } = target;

  switch (op) {
    case 'add': {
      if (Array.isArray(parent)) {
        if (key === '-') {
          parent.push(operation.value);
        } else {
          const idx = parseInt(key, 10);
          if (isNaN(idx) || idx < 0) {
            throw new Error(`Invalid array index for add: ${key}`);
          }
          if (idx >= parent.length) {
            parent.push(operation.value);
          } else {
            parent.splice(idx, 0, operation.value);
          }
        }
      } else if (isObject(parent)) {
        if ((key === 'bullets' || key === 'description' || key === 'content') && typeof parent[key] === 'string' && typeof operation.value === 'string') {
          const existingText = parent[key].trim();
          const incomingText = operation.value.trim();
          if (!existingText) {
            parent[key] = incomingText;
          } else if (incomingText) {
            const existingLines = existingText.split('\n').map((l) => l.trim()).filter(Boolean);
            const incomingLines = incomingText.split('\n').map((l) => l.trim()).filter(Boolean);
            const newLinesToAdd = incomingLines.filter(
              (inc) => !existingLines.some((ex) => ex.toLowerCase() === inc.toLowerCase())
            );
            if (newLinesToAdd.length > 0) {
              parent[key] = [...existingLines, ...newLinesToAdd].join('\n');
            }
          }
        } else if ((key === 'skills' || key === 'interests') && typeof parent[key] === 'string' && typeof operation.value === 'string') {
          const existingText = parent[key].trim();
          const incomingText = operation.value.trim();
          if (!existingText) {
            parent[key] = incomingText;
          } else if (incomingText) {
            const existingItems = existingText.split(',').map((s) => s.trim()).filter(Boolean);
            const incomingItems = incomingText.split(',').map((s) => s.trim()).filter(Boolean);
            const newItemsToAdd = incomingItems.filter(
              (inc) => !existingItems.some((ex) => ex.toLowerCase() === inc.toLowerCase())
            );
            if (newItemsToAdd.length > 0) {
              parent[key] = [...existingItems, ...newItemsToAdd].join(', ');
            }
          }
        } else {
          parent[key] = operation.value;
        }
      } else {
        throw new Error(`Cannot add property to non-object parent at ${operation.path}`);
      }
      break;
    }

    case 'replace': {
      if (Array.isArray(parent)) {
        const idx = parseInt(key, 10);
        if (isNaN(idx) || idx < 0) {
          throw new Error(`Invalid array index for replace: ${key}`);
        }
        if (idx >= parent.length) {
          parent.push(operation.value);
        } else {
          parent[idx] = operation.value;
        }
      } else if (isObject(parent)) {
        parent[key] = operation.value;
      } else {
        throw new Error(`Cannot replace property on non-object parent at ${operation.path}`);
      }
      break;
    }

    case 'remove': {
      if (Array.isArray(parent)) {
        const idx = parseInt(key, 10);
        if (isNaN(idx) || idx < 0 || idx >= parent.length) {
          throw new Error(`Array index out of bounds for remove: ${key}`);
        }
        parent.splice(idx, 1);
      } else if (isObject(parent)) {
        const opVal = (operation as { value?: unknown }).value;
        const isStringProp = typeof parent[key] === 'string';

        if (isStringProp) {
          const currentStr = parent[key] as string;

          if (typeof opVal === 'string' && opVal.trim().length > 0) {
            const removeText = opVal.trim();
            const removeLines = new Set(
              removeText.split('\n').map((l) => l.trim().toLowerCase()).filter(Boolean)
            );
            const currentLines = currentStr.split('\n');
            const remainingLines = currentLines.filter(
              (line) => !removeLines.has(line.trim().toLowerCase())
            );
            parent[key] = remainingLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
          } else {
            // Model emitted `remove` on a string property (e.g. /customSections/0/content or /workExperience/0/bullets) WITHOUT value
            let blocks: string[];
            if (currentStr.includes('### ')) {
              blocks = currentStr.split(/(?=\n*###\s+)/).map((b) => b.trim()).filter(Boolean);
            } else {
              blocks = currentStr.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
            }

            if (blocks.length > 1) {
              let removeIdx = targetIndexForStringField !== null ? targetIndexForStringField : 0;
              if (removeIdx === -1 || removeIdx >= blocks.length) {
                removeIdx = blocks.length - 1;
              }
              if (removeIdx >= 0 && removeIdx < blocks.length) {
                blocks.splice(removeIdx, 1);
              }
              parent[key] = blocks.join('\n\n');
            } else {
              // Preserve key as empty string instead of deleting schema property
              parent[key] = '';
            }
          }
        } else {
          delete parent[key];
        }
      } else {
        throw new Error(`Cannot remove property from non-object parent at ${operation.path}`);
      }
      break;
    }

    case 'move': {
      if (!operation.from) throw new Error('Missing "from" path for move operation');
      const fromTokens = parsePointer(operation.from);
      const fromTarget = getTargetParent(doc, fromTokens, false);
      if (!fromTarget) throw new Error(`"from" path not found: ${operation.from}`);

      let movedVal: unknown;
      if (Array.isArray(fromTarget.parent)) {
        const fIdx = parseInt(fromTarget.key, 10);
        if (isNaN(fIdx) || fIdx < 0 || fIdx >= fromTarget.parent.length) {
          throw new Error(`Invalid from index for move: ${fromTarget.key}`);
        }
        movedVal = fromTarget.parent.splice(fIdx, 1)[0];
      } else if (isObject(fromTarget.parent)) {
        movedVal = fromTarget.parent[fromTarget.key];
        delete fromTarget.parent[fromTarget.key];
      }

      applySingleOp(doc, { op: 'add', path: operation.path, value: movedVal });
      break;
    }

    case 'copy': {
      if (!operation.from) throw new Error('Missing "from" path for copy operation');
      const fromTokens = parsePointer(operation.from);
      const fromTarget = getTargetParent(doc, fromTokens, false);
      if (!fromTarget) throw new Error(`"from" path not found: ${operation.from}`);

      let copiedVal: unknown;
      if (Array.isArray(fromTarget.parent)) {
        const fIdx = parseInt(fromTarget.key, 10);
        copiedVal = fromTarget.parent[fIdx];
      } else if (isObject(fromTarget.parent)) {
        copiedVal = fromTarget.parent[fromTarget.key];
      }

      const cloneVal = copiedVal !== undefined ? JSON.parse(JSON.stringify(copiedVal)) : undefined;
      applySingleOp(doc, { op: 'add', path: operation.path, value: cloneVal });
      break;
    }

    default:
      throw new Error(`Unsupported patch operation: ${op}`);
  }
}

/**
 * Normalizes an array of patch operations so that multiple removals on the same
 * array path are executed in descending index order. This prevents index shifting
 * from causing out-of-bounds errors when an LLM emits removals in ascending order
 * (e.g. [/certifications/2, /certifications/3] -> [/certifications/3, /certifications/2]).
 */
function normalizePatchesForArrayRemovals(patches: unknown[]): unknown[] {
  const normalized: unknown[] = [];
  let i = 0;
  while (i < patches.length) {
    const rawOp = patches[i];
    if (
      rawOp &&
      typeof rawOp === 'object' &&
      'op' in rawOp &&
      (rawOp as JsonPatchOperation).op?.toLowerCase() === 'remove' &&
      typeof (rawOp as JsonPatchOperation).path === 'string'
    ) {
      const match = (rawOp as JsonPatchOperation).path.match(/^(.+)\/(\d+)$/);
      if (match) {
        const parentPath = match[1];
        const group: { op: unknown; idx: number }[] = [];
        while (i < patches.length) {
          const curr = patches[i];
          if (
            curr &&
            typeof curr === 'object' &&
            'op' in curr &&
            (curr as JsonPatchOperation).op?.toLowerCase() === 'remove' &&
            typeof (curr as JsonPatchOperation).path === 'string'
          ) {
            const currMatch = (curr as JsonPatchOperation).path.match(/^(.+)\/(\d+)$/);
            if (currMatch && currMatch[1] === parentPath) {
              group.push({ op: curr, idx: parseInt(currMatch[2], 10) });
              i++;
              continue;
            }
          }
          break;
        }
        group.sort((a, b) => b.idx - a.idx);
        for (const item of group) {
          normalized.push(item.op);
        }
        continue;
      }
    }
    normalized.push(rawOp);
    i++;
  }
  return normalized;
}

/**
 * Applies an array of JSON patch operations to a document.
 * Returns a new cloned document if successful, or preserves the original state with errors reported.
 */
export function applyJsonPatches<T>(
  sourceDocument: T,
  patches: unknown,
  options: { allowPartial?: boolean } = {}
): PatchResult<T> {
  if (!sourceDocument || typeof sourceDocument !== 'object') {
    return {
      success: false,
      document: sourceDocument,
      appliedCount: 0,
      errors: ['Invalid source document — expected object or array'],
    };
  }

  if (!Array.isArray(patches)) {
    return {
      success: false,
      document: sourceDocument,
      appliedCount: 0,
      errors: ['Invalid patches parameter — expected array of operations'],
    };
  }

  const effectivePatches = normalizePatchesForArrayRemovals(patches);

  let docClone: T;
  try {
    docClone = structuredClone(sourceDocument);
  } catch {
    docClone = JSON.parse(JSON.stringify(sourceDocument)) as T;
  }

  const errors: string[] = [];
  let appliedCount = 0;

  for (let i = 0; i < effectivePatches.length; i++) {
    const rawOp = effectivePatches[i];
    if (!rawOp || typeof rawOp !== 'object' || !('op' in rawOp) || !('path' in rawOp)) {
      errors.push(`Patch #${i} is missing required fields (op, path)`);
      if (!options.allowPartial) {
        return { success: false, document: sourceDocument, appliedCount, errors };
      }
      continue;
    }

    const op = rawOp as JsonPatchOperation;
    try {
      applySingleOp(docClone, op);
      appliedCount++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Patch #${i} (${op.op} ${op.path}) failed: ${msg}`);
      if (!options.allowPartial) {
        // Atomic rollback
        return { success: false, document: sourceDocument, appliedCount, errors };
      }
    }
  }

  return {
    success: errors.length === 0,
    document: docClone,
    appliedCount,
    errors,
  };
}
