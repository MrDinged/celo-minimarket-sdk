import { useState, useEffect, useCallback } from "react";
import { detectMiniPay } from "../minipay";

interface UseMiniPayResult {
  isMiniPay: boolean;
  miniPayAddress: string | null;
  isLoading: boolean;
  connectMiniPay: () => Promise<string | null>;
}

export function useMiniPay(): UseMiniPayResult {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [miniPayAddress, setMiniPayAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detect = async () => {
      try {
        if (detectMiniPay()) {
          setIsMiniPay(true);
          const accounts = (await window.ethereum!.request({
            method: "eth_accounts",
          })) as string[];
          if (accounts?.[0]) setMiniPayAddress(accounts[0]);
        }
      } catch (err) {
        console.warn("MiniPay detection error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    detect();
  }, []);

  const connectMiniPay = useCallback(async (): Promise<string | null> => {
    if (!detectMiniPay()) return null;
    try {
      const accounts = (await window.ethereum!.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (accounts?.[0]) {
        setMiniPayAddress(accounts[0]);
        return accounts[0];
      }
    } catch (err) {
      console.error("MiniPay connect error:", err);
    }
    return null;
  }, []);

  return { isMiniPay, miniPayAddress, isLoading, connectMiniPay };
}
