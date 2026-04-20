export function formatCelo(wei: bigint, decimals: number = 4): string {
  const v = Number(wei) / 1e18;
  if (v === 0) return '0'; if (v < 0.0001) return '< 0.0001';
  return v.toFixed(decimals).replace(/\.?0+$/, '');
}
export function parseCelo(celo: string | number): bigint { return BigInt(Math.floor(Number(celo) * 1e18)); }
export function shortenAddress(addr: string, chars: number = 4): string { return addr ? `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}` : ''; }
export function shortenTxHash(hash: string, chars: number = 6): string { return hash ? `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}` : ''; }
export function explorerTxUrl(hash: string, base = 'https://celoscan.io'): string { return `${base}/tx/${hash}`; }
export function explorerAddressUrl(addr: string, base = 'https://celoscan.io'): string { return `${base}/address/${addr}`; }
