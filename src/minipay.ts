import { CHAIN_IDS } from "./constants";

declare global {
  interface Window {
    ethereum?: {
      isMiniPay?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export function detectMiniPay(): boolean {
  return !!(
    typeof window !== "undefined" &&
    window.ethereum &&
    window.ethereum.isMiniPay
  );
}

export function getMiniPayProvider(): Window["ethereum"] | null {
  if (detectMiniPay()) return window.ethereum!;
  return null;
}

export async function requestMiniPayAccounts(): Promise<string[]> {
  const provider = getMiniPayProvider();
  if (!provider) return [];
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  return accounts || [];
}

export async function getMiniPayAddress(): Promise<string | null> {
  const accounts = await requestMiniPayAccounts();
  return accounts[0] || null;
}

export function buildMiniPayTransaction<
  T extends Record<string, unknown>,
>(txParams: T): Omit<T, "maxFeePerGas" | "maxPriorityFeePerGas" | "type"> {
  if (!detectMiniPay()) return txParams;
  const tx = { ...txParams };
  delete tx.maxFeePerGas;
  delete tx.maxPriorityFeePerGas;
  delete tx.type;
  return tx;
}

export async function verifyCeloNetwork(provider: {
  getNetwork: () => Promise<{ chainId: number }>;
}) {
  try {
    const network = await provider.getNetwork();
    return {
      isCelo:
        network.chainId === CHAIN_IDS.MAINNET ||
        network.chainId === CHAIN_IDS.ALFAJORES,
      chainId: network.chainId,
      isMainnet: network.chainId === CHAIN_IDS.MAINNET,
      isTestnet: network.chainId === CHAIN_IDS.ALFAJORES,
    };
  } catch {
    return { isCelo: false, chainId: 0, isMainnet: false, isTestnet: false };
  }
}
