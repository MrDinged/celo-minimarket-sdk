import { ethers } from "ethers";
import { ERC20_ABI } from "./abi";
import { CONTRACTS } from "./constants";

/** Check the current cUSD allowance for the marketplace contract */
export async function getAllowance(
  owner: string,
  spender: string = CONTRACTS.CeloMiniMarket,
  provider: ethers.providers.Provider,
  tokenAddress: string = CONTRACTS.cUSD
): Promise<ethers.BigNumber> {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  return token.allowance(owner, spender);
}

/** Approve the marketplace contract to spend cUSD */
export async function approveToken(
  signer: ethers.Signer,
  amount: ethers.BigNumberish,
  spender: string = CONTRACTS.CeloMiniMarket,
  tokenAddress: string = CONTRACTS.cUSD
): Promise<ethers.ContractTransaction> {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  return token.approve(spender, amount);
}

/** Check if sufficient allowance exists, approve if not */
export async function ensureAllowance(
  signer: ethers.Signer,
  amount: ethers.BigNumberish,
  spender: string = CONTRACTS.CeloMiniMarket,
  tokenAddress: string = CONTRACTS.cUSD
): Promise<ethers.ContractTransaction | null> {
  const owner = await signer.getAddress();
  const provider = signer.provider;
  if (!provider) throw new Error("Signer must be connected to a provider");

  const current = await getAllowance(owner, spender, provider, tokenAddress);
  if (current.gte(amount)) return null;

  return approveToken(signer, amount, spender, tokenAddress);
}
