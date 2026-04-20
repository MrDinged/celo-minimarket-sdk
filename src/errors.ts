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
export function parseError(error: unknown): CeloMiniMarketError {
  const msg = (error as Error)?.message || String(error);
  if (msg.includes('insufficient funds')) return new InsufficientFundsError('unknown', 'unknown');
  if (msg.includes('not found')) return new ProductNotFoundError(0);
  if (msg.includes('already sold')) return new ProductSoldError(0);
  return new CeloMiniMarketError(msg, 'UNKNOWN');
}
