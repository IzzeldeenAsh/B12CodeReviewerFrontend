import { describe, expect, it } from 'vitest';
import { toFindingVM, toPullRequestVM, toReviewDetailVM } from './index';
import { toReviewStatus, toRecommendation, toSeverity } from './enum-guards';
import type { PullRequestWire, ReviewDetailWire } from '@/api/contracts/schemas';

describe('enum guards', () => {
  it('narrows known values and falls back safely', () => {
    expect(toReviewStatus('ANALYZING')).toBe('ANALYZING');
    expect(toReviewStatus('WAT')).toBe('FAILED');
    expect(toRecommendation('APPROVE')).toBe('APPROVE');
    expect(toRecommendation('WAT')).toBeNull();
    expect(toRecommendation(null)).toBeNull();
    expect(toSeverity('HIGH')).toBe('HIGH');
    expect(toSeverity('WAT')).toBe('UNKNOWN');
  });
});

describe('pull request mapper', () => {
  it('shortens branches/commits and parses dates', () => {
    const wire: PullRequestWire = {
      pullRequestId: 7,
      title: 'x',
      status: 'active',
      sourceRefName: 'refs/heads/feature/a',
      targetRefName: 'refs/heads/main',
      lastMergeSourceCommitId: 'abcdef1234567890',
      creationDate: '2026-01-02T03:04:05Z',
      isDraft: true,
    };
    const vm = toPullRequestVM(wire);
    expect(vm.sourceBranch).toBe('feature/a');
    expect(vm.targetBranch).toBe('main');
    expect(vm.sourceCommitShort).toBe('abcdef12');
    expect(vm.isDraft).toBe(true);
    expect(vm.createdAt).toBeInstanceOf(Date);
  });
});

describe('review detail mapper', () => {
  it('parses decimal cost string and maps findings', () => {
    const wire: ReviewDetailWire = {
      id: 'r1',
      status: 'COMPLETED',
      pullRequestId: 1,
      projectId: 'p',
      repositoryId: 'r',
      finalRecommendation: 'REQUEST_CHANGES',
      modelRecommendation: 'HUMAN_REVIEW',
      partial: true,
      createdAt: '2026-01-01T00:00:00Z',
      summary: 's',
      confidence: 0.8,
      model: 'claude-sonnet-5',
      inputTokens: 100,
      outputTokens: 20,
      estimatedCost: '0.1234',
      failureCode: null,
      findings: [
        {
          id: 'f',
          severity: 'BLOCKER',
          category: 'SECURITY',
          filePath: 'a.ts',
          lineNumber: 3,
          title: 't',
          explanation: 'e',
          evidence: 'v',
          suggestedFix: null,
          confidence: 0.9,
          isInline: true,
          publishState: 'PUBLISHED',
        },
      ],
    };
    const vm = toReviewDetailVM(wire);
    expect(vm.estimatedCost).toBeCloseTo(0.1234);
    expect(vm.partial).toBe(true);
    expect(vm.findings[0]?.isPublished).toBe(true);
  });

  it('handles null cost', () => {
    const finding = toFindingVM({
      id: 'f',
      severity: 'LOW',
      category: 'TESTING',
      filePath: null,
      lineNumber: null,
      title: 't',
      explanation: 'e',
      evidence: 'v',
      suggestedFix: null,
      confidence: 0.1,
      isInline: false,
      publishState: 'UNPUBLISHED',
    });
    expect(finding.isPublished).toBe(false);
    expect(finding.filePath).toBeNull();
  });
});
