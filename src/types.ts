import { ethers } from "ethers";

export interface Product {
  tokenId: number;
  vendor: string;
  name: string;
  priceWei: string;
  priceCUSD: string;
  description: string;
  imageData: string;
  active: boolean;
  sold: boolean;
}

export interface StablecoinBalance {
  raw: string;
  formatted: string;
  decimals: number;
}

export interface StablecoinBalances {
  [symbol: string]: StablecoinBalance;
}

export interface NetworkInfo {
  isCelo: boolean;
  chainId: number;
  isMainnet: boolean;
  isTestnet: boolean;
}

export interface MiniPayInfo {
  isMiniPay: boolean;
  provider: ethers.providers.ExternalProvider | null;
}

export interface MiniMarketConfig {
  contractAddress?: string;
  rpcUrl?: string;
  chainId?: number;
}

export interface AddProductParams {
  name: string;
  priceInCUSD: string;
  description: string;
  imageData: string;
}

export interface TransactionResult {
  hash: string;
  wait: () => Promise<ethers.providers.TransactionReceipt>;
}
