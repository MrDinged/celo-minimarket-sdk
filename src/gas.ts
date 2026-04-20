import { ethers } from "ethers";

export interface GasEstimate {
  gasLimit: ethers.BigNumber;
  gasPrice: ethers.BigNumber;
  maxFeePerGas: ethers.BigNumber | null;
  estimatedCostWei: ethers.BigNumber;
  estimatedCostCelo: string;
}

/** Estimate gas for a contract transaction */
export async function estimateGas(
  contract: ethers.Contract,
  method: string,
  args: unknown[],
  overrides: ethers.CallOverrides = {}
): Promise<GasEstimate> {
  const gasLimit = await contract.estimateGas[method](...args, overrides);
  const feeData = await contract.provider.getFeeData();

  const gasPrice = feeData.gasPrice || ethers.BigNumber.from(0);
  const maxFeePerGas = feeData.maxFeePerGas;
  const effectivePrice = maxFeePerGas || gasPrice;

  const estimatedCostWei = gasLimit.mul(effectivePrice);

  return {
    gasLimit,
    gasPrice,
    maxFeePerGas,
    estimatedCostWei,
    estimatedCostCelo: ethers.utils.formatEther(estimatedCostWei),
  };
}

/** Add a gas buffer (default 20%) to a gas limit */
export function addGasBuffer(
  gasLimit: ethers.BigNumber,
  bufferPercent: number = 20
): ethers.BigNumber {
  return gasLimit.mul(100 + bufferPercent).div(100);
}
