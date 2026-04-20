/** SDK version, kept in sync with package.json */
export const SDK_VERSION = "1.0.0";

/** Minimum supported ethers.js version */
export const MIN_ETHERS_VERSION = "5.7.0";

/** Print SDK info to console (useful for debugging) */
export function printSDKInfo(): void {
  console.log(`celo-minimarket SDK v${SDK_VERSION}`);
  console.log(`Requires ethers.js >= ${MIN_ETHERS_VERSION}`);
}
