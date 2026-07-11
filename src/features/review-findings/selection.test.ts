import { describe, expect, it } from 'vitest';
import type { FindingVM } from '@/types/view-models';
import {
  buildPublishPayload,
  canPublish,
  filterFindings,
  groupBySeverity,
  groupByFile,
  publishableFindings,
  summarizeSelection,
} from './selection';

function finding(overrides: Partial<FindingVM>): FindingVM {
  return {
    id: 'f1',
    severity: 'MEDIUM',
    category: 'BUG',
    filePath: 'a.ts',
    lineNumber: 10,
    title: 'title',
    explanation: 'why',
    evidence: 'code',
    suggestedFix: null,
    confidence: 0.5,
    isInline: true,
    publishState: 'UNPUBLISHED',
    isPublished: false,
    ...overrides,
  };
}

describe('findings selection logic', () => {
  it('treats only unpublished findings as publishable', () => {
    const list = [
      finding({ id: 'a' }),
      finding({ id: 'b', isPublished: true, publishState: 'PUBLISHED' }),
    ];
    expect(publishableFindings(list).map((f) => f.id)).toEqual(['a']);
  });

  it('groups by severity most-severe first, dropping empty groups', () => {
    const list = [
      finding({ id: 'low', severity: 'LOW' }),
      finding({ id: 'blk', severity: 'BLOCKER' }),
      finding({ id: 'med', severity: 'MEDIUM' }),
    ];
    expect(groupBySeverity(list).map((g) => g.key)).toEqual(['BLOCKER', 'MEDIUM', 'LOW']);
  });

  it('groups by file with general bucket for null paths', () => {
    const list = [finding({ id: 'a', filePath: 'z.ts' }), finding({ id: 'b', filePath: null })];
    const groups = groupByFile(list);
    expect(groups.map((g) => g.label)).toContain('General (no file)');
    expect(groups.map((g) => g.label)).toContain('z.ts');
  });

  it('filters by category and selected-only', () => {
    const list = [
      finding({ id: 'a', category: 'BUG' }),
      finding({ id: 'b', category: 'SECURITY' }),
    ];
    const selected = new Set(['a']);
    expect(filterFindings(list, { category: 'SECURITY' }, selected).map((f) => f.id)).toEqual([
      'b',
    ]);
    expect(filterFindings(list, { selectedOnly: true }, selected).map((f) => f.id)).toEqual(['a']);
  });

  it('summarizes inline vs general and downgrades', () => {
    const list = [
      finding({ id: 'a', isInline: true }),
      finding({ id: 'b', isInline: false, lineNumber: 5 }),
      finding({ id: 'c', isInline: false, lineNumber: null }),
    ];
    const summary = summarizeSelection(list, new Set(['a', 'b', 'c']));
    expect(summary).toEqual({ total: 3, inline: 1, general: 2, downgradedToGeneral: 1 });
  });

  it('builds a publish payload from only selected, publishable findings', () => {
    const list = [
      finding({ id: 'a' }),
      finding({ id: 'b', isPublished: true, publishState: 'PUBLISHED' }),
      finding({ id: 'c' }),
    ];
    const payload = buildPublishPayload(true, list, new Set(['a', 'b']));
    expect(payload).toEqual({ publishSummary: true, findingIds: ['a'] });
  });

  it('requires summary or at least one finding to publish', () => {
    expect(canPublish({ publishSummary: false, findingIds: [] })).toBe(false);
    expect(canPublish({ publishSummary: true, findingIds: [] })).toBe(true);
    expect(canPublish({ publishSummary: false, findingIds: ['a'] })).toBe(true);
  });
});
