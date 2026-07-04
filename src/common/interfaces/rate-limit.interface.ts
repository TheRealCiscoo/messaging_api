export interface IRateLimitEntry {
  count: number;
  expireAt: number;
}

export const requests = new Map<string, IRateLimitEntry>();
