export interface TransactionResult { hash: string; wait: () => Promise<TransactionReceipt>; }
export interface TransactionReceipt { hash: string; blockNumber: number; gasUsed: bigint; status: number; logs: any[]; }
export interface TransactionOptions { gasLimit?: bigint; maxFeePerGas?: bigint; maxPriorityFeePerGas?: bigint; value?: bigint; nonce?: number; }
export interface PendingTransaction { hash: string; method: string; args: any[]; timestamp: number; status: 'pending' | 'confirmed' | 'failed'; }
export function createPendingTx(hash: string, method: string, args: any[]): PendingTransaction {
  return { hash, method, args, timestamp: Date.now(), status: 'pending' };
}
