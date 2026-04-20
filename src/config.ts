export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress: string;
}
export const CELO_MAINNET: NetworkConfig = {
  chainId: 42220, name: 'Celo Mainnet', rpcUrl: 'https://forno.celo.org',
  explorerUrl: 'https://celoscan.io', contractAddress: '0x7a280e8b5995F72F20a1e90177C20D002aC1C3a4',
};
export const CELO_ALFAJORES: NetworkConfig = {
  chainId: 44787, name: 'Celo Alfajores', rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  explorerUrl: 'https://alfajores.celoscan.io', contractAddress: '',
};
export interface SDKConfig { network: NetworkConfig; rpcUrl?: string; timeout?: number; retries?: number; }
export function createConfig(overrides: Partial<SDKConfig> = {}): SDKConfig {
  return { network: overrides.network || CELO_MAINNET, rpcUrl: overrides.rpcUrl || CELO_MAINNET.rpcUrl, timeout: overrides.timeout || 30000, retries: overrides.retries || 3 };
}
