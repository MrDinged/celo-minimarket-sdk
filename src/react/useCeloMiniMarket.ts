import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CeloMiniMarket } from "../client";
import type { Product, AddProductParams, TransactionResult } from "../types";

interface UseCeloMiniMarketOptions {
  provider?: ethers.providers.Web3Provider;
  contractAddress?: string;
}

interface UseCeloMiniMarketResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addProduct: (params: AddProductParams) => Promise<TransactionResult>;
  purchaseProduct: (tokenId: number, priceWei: string) => Promise<TransactionResult>;
  toggleProduct: (tokenId: number, active: boolean) => Promise<TransactionResult>;
  getProduct: (tokenId: number) => Promise<Product>;
}

export function useCeloMiniMarket({
  provider,
  contractAddress,
}: UseCeloMiniMarketOptions = {}): UseCeloMiniMarketResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getClient = useCallback((): CeloMiniMarket => {
    if (provider) {
      return CeloMiniMarket.fromProvider(provider, { contractAddress });
    }
    return new CeloMiniMarket({ contractAddress });
  }, [provider, contractAddress]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getClient();
      const active = await client.getActiveProducts();
      setProducts(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, [getClient]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addProduct = useCallback(
    async (params: AddProductParams): Promise<TransactionResult> => {
      const client = getClient();
      return client.addProduct(params);
    },
    [getClient]
  );

  const purchaseProduct = useCallback(
    async (tokenId: number, priceWei: string): Promise<TransactionResult> => {
      const client = getClient();
      return client.purchaseProduct(tokenId, priceWei);
    },
    [getClient]
  );

  const toggleProduct = useCallback(
    async (tokenId: number, active: boolean): Promise<TransactionResult> => {
      const client = getClient();
      return client.toggleProduct(tokenId, active);
    },
    [getClient]
  );

  const getProduct = useCallback(
    async (tokenId: number): Promise<Product> => {
      const client = getClient();
      return client.getProduct(tokenId);
    },
    [getClient]
  );

  return {
    products,
    isLoading,
    error,
    refetch,
    addProduct,
    purchaseProduct,
    toggleProduct,
    getProduct,
  };
}
