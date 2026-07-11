import type { CredentialType } from '@/types/domain';

/** Coordinates identifying a PR — shared by estimate and start-review. */
export interface ReviewTargetRequest {
  connectionId: string;
  projectId: string;
  repositoryId: string;
  pullRequestId: number;
}

export type EstimateReviewRequest = ReviewTargetRequest;
export type StartReviewRequest = ReviewTargetRequest;

export interface CreateConnectionRequest {
  name: string;
  organization: string;
  baseUrl?: string;
  credentialType: CredentialType;
  /** A REFERENCE to a credential (env var / Key Vault secret name), never the value. */
  credentialRef: string;
}

export interface PublishReviewRequest {
  publishSummary: boolean;
  findingIds: string[];
}
