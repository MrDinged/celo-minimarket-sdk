import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getStablecoinBalances } from "../tokens";
import type { StablecoinBalances } from "../types";

interface UseStablecoinBalancesResult {
  balances: StablecoinBalances | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStablecoinBalances(
  address: string | null | undefined,
  provider?: ethers.providers.Provider
): UseStablecoinBalancesResult {
  const [balances, setBalances] = useState<StablecoinBalances | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const rpcProvider =
        provider ||
        new ethers.providers.JsonRpcProvider("https://forno.celo.org", 42220);
      const result = await getStablecoinBalances(address, rpcProvider);
      setBalances(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setIsLoading(false);
    }
  }, [address, provider]);

  useEffect(() => {
    if (address) refetch();
  }, [address, refetch]);

  return { balances, isLoading, error, refetch };
}
