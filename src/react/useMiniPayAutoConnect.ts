import { useState, useEffect } from "react";
import { detectMiniPay } from "../minipay";

interface UseMiniPayAutoConnectOptions {
  connect?: () => Promise<unknown>;
  isConnected?: boolean;
}

interface UseMiniPayAutoConnectResult {
  autoConnected: boolean;
}

export function useMiniPayAutoConnect({
  connect,
  isConnected,
}: UseMiniPayAutoConnectOptions): UseMiniPayAutoConnectResult {
  const [autoConnected, setAutoConnected] = useState(false);

  useEffect(() => {
    if (isConnected || autoConnected) return;

    const tryAutoConnect = async () => {
      if (detectMiniPay() && connect) {
        try {
          await connect();
          setAutoConnected(true);
        } catch (err) {
          console.warn("[MiniPay] Auto-connect failed:", err);
        }
      }
    };

    const timer = setTimeout(tryAutoConnect, 300);
    return () => clearTimeout(timer);
  }, [connect, isConnected, autoConnected]);

  return { autoConnected };
}
