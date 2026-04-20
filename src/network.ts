import { CHAIN_IDS, RPC_URLS } from "./constants";

export interface AddChainParams {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const CELO_CHAIN_PARAMS: AddChainParams = {
  chainId: "0x" + CHAIN_IDS.MAINNET.toString(16),
  chainName: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: [RPC_URLS.MAINNET],
  blockExplorerUrls: ["https://celoscan.io"],
};

export const ALFAJORES_CHAIN_PARAMS: AddChainParams = {
  chainId: "0x" + CHAIN_IDS.ALFAJORES.toString(16),
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: [RPC_URLS.ALFAJORES],
  blockExplorerUrls: ["https://alfajores.celoscan.io"],
};

/** Request wallet to switch to Celo network */
export async function switchToCelo(
  provider: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  testnet: boolean = false
): Promise<boolean> {
  const chainId = testnet
    ? "0x" + CHAIN_IDS.ALFAJORES.toString(16)
    : "0x" + CHAIN_IDS.MAINNET.toString(16);
  const params = testnet ? ALFAJORES_CHAIN_PARAMS : CELO_CHAIN_PARAMS;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
    return true;
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [params],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
