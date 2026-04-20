import { ethers } from "ethers";
import { ERC20_ABI } from "./abi";
import { SUPPORTED_STABLECOINS } from "./constants";
import type { StablecoinBalance, StablecoinBalances } from "./types";
import type { StablecoinSymbol } from "./constants";

export async function getStablecoinBalances(
  address: string,
  provider: ethers.providers.Provider
): Promise<StablecoinBalances> {
  const balances: StablecoinBalances = {};

  const entries = Object.entries(SUPPORTED_STABLECOINS) as [
    StablecoinSymbol,
    string,
  ][];

  const results = await Promise.allSettled(
    entries.map(async ([symbol, tokenAddress]) => {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [balance, decimals] = await Promise.all([
        contract.balanceOf(address) as Promise<ethers.BigNumber>,
        contract.decimals() as Promise<number>,
      ]);
      return {
        symbol,
        balance: {
          raw: balance.toString(),
          formatted: ethers.utils.formatUnits(balance, decimals),
          decimals,
        } as StablecoinBalance,
      };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      balances[result.value.symbol] = result.value.balance;
    }
  }

  return balances;
}

export function formatStablecoin(
  amount: ethers.BigNumberish,
  decimals: number = 18,
  maxDecimals: number = 2
): string {
  const formatted = ethers.utils.formatUnits(amount, decimals);
  return parseFloat(formatted).toFixed(maxDecimals);
}

export function parseStablecoin(
  amount: string,
  decimals: number = 18
): ethers.BigNumber {
  return ethers.utils.parseUnits(amount, decimals);
}
