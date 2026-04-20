export class CeloMiniMarketError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'CeloMiniMarketError';
    this.code = code;
    this.details = details;
  }
}
export class InsufficientFundsError extends CeloMiniMarketError {
  constructor(required: string, available: string) {
    super(`Insufficient funds: need ${required}, have ${available}`, 'INSUFFICIENT_FUNDS', { required, available });
    this.name = 'InsufficientFundsError';
  }
}
export class ProductNotFoundError extends CeloMiniMarketError {
  constructor(tokenId: number) {
    super(`Product ${tokenId} not found`, 'PRODUCT_NOT_FOUND', { tokenId });
    this.name = 'ProductNotFoundError';
  }
}
export class ProductSoldError extends CeloMiniMarketError {
  constructor(tokenId: number) {
    super(`Product ${tokenId} already sold`, 'PRODUCT_SOLD', { tokenId });
    this.name = 'ProductSoldError';
  }
}
export class NetworkError extends CeloMiniMarketError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}
export class TransactionError extends CeloMiniMarketError {
  public readonly txHash?: string;
  constructor(message: string, txHash?: string) {
    super(message, 'TRANSACTION_ERROR', { txHash });
    this.name = 'TransactionError';
    this.txHash = txHash;
  }
}
export class ApprovalError extends CeloMiniMarketError {
  constructor(spender: string, amount: string) {
    super(`Approval failed for ${spender} with amount ${amount}`, 'APPROVAL_ERROR', { spender, amount });
    this.name = 'ApprovalError';
  }
}
export class ContractNotDeployedError extends CeloMiniMarketError {
  constructor(address: string) {
    super(`No contract deployed at ${address}`, 'CONTRACT_NOT_DEPLOYED', { address });
    this.name = 'ContractNotDeployedError';
  }
}
export function parseError(error: unknown): CeloMiniMarketError {
  const msg = (error as Error)?.message || String(error);
  if (msg.includes('insufficient funds') || msg.includes('INSUFFICIENT_FUNDS'))
    return new InsufficientFundsError('unknown', 'unknown');
  if (msg.includes('not found') || msg.includes('nonexistent token'))
    return new ProductNotFoundError(0);
  if (msg.includes('already sold') || msg.includes('product is sold'))
    return new ProductSoldError(0);
  if (msg.includes('execution reverted'))
    return new TransactionError(msg);
  if (msg.includes('network') || msg.includes('timeout') || msg.includes('ETIMEDOUT'))
    return new NetworkError(msg);
  return new CeloMiniMarketError(msg, 'UNKNOWN');
}
export function isUserRejection(error: unknown): boolean {
  const msg = (error as Error)?.message || String(error);
  return msg.includes('user rejected') || msg.includes('User denied') || msg.includes('ACTION_REJECTED');
}
