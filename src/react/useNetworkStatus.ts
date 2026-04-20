import { useState, useEffect } from "react";
import { verifyCeloNetwork } from "../minipay";

interface NetworkStatus {
  isCelo: boolean;
  isMainnet: boolean;
  isTestnet: boolean;
  chainId: number | null;
  isChecking: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isCelo: false,
    isMainnet: false,
    isTestnet: false,
    chainId: null,
    isChecking: true,
  });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        if (!cancelled) setStatus((s) => ({ ...s, isChecking: false }));
        return;
      }

      try {
        const { ethers } = await import("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const result = await verifyCeloNetwork(provider);
        if (!cancelled) {
          setStatus({
            isCelo: result.isCelo,
            isMainnet: result.isMainnet,
            isTestnet: result.isTestnet,
            chainId: result.chainId,
            isChecking: false,
          });
        }
      } catch {
        if (!cancelled) setStatus((s) => ({ ...s, isChecking: false }));
      }
    };

    check();

    const handleChainChanged = () => { check(); };
    window.ethereum?.on?.("chainChanged", handleChainChanged);

    return () => {
      cancelled = true;
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  return status;
}
