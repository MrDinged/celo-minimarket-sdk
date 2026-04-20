export interface ProductAddedEvent {
  event: 'ProductAdded';
  tokenId: bigint;
  vendor: string;
  name: string;
  priceWei: bigint;
  blockNumber: number;
  transactionHash: string;
}
export interface ProductPurchasedEvent {
  event: 'ProductPurchased';
  tokenId: bigint;
  buyer: string;
  vendor: string;
  price: bigint;
  blockNumber: number;
  transactionHash: string;
}
export interface ProductStatusToggledEvent {
  event: 'ProductStatusToggled';
  tokenId: bigint;
  active: boolean;
  blockNumber: number;
  transactionHash: string;
}
export type MarketplaceEvent = ProductAddedEvent | ProductPurchasedEvent | ProductStatusToggledEvent;
export interface EventFilter {
  fromBlock?: number;
  toBlock?: number | 'latest';
  vendor?: string;
  tokenId?: bigint;
}
export interface EventSubscription { unsubscribe: () => void; }
