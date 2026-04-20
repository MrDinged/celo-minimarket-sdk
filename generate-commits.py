#!/usr/bin/env python3
"""Generate meaningful commits for the celo-minimarket-sdk repo."""

import subprocess, os, textwrap

os.chdir(os.path.expanduser("~/celo-minimarket/sdk"))

def run(cmd):
    subprocess.run(cmd, shell=True, check=True)

def write(path, content):
    os.makedirs(os.path.dirname(path) if "/" in path else ".", exist_ok=True)
    with open(path, "w") as f:
        f.write(textwrap.dedent(content).lstrip("\n"))

def commit(msg):
    run("git add -A")
    run(f'git commit -m "{msg}"')

# ── Commit 2: Add .npmignore ──
write(".npmignore", """\
src/
tsconfig*.json
.gitignore
*.tsbuildinfo
node_modules/
""")
commit("chore: add .npmignore to exclude source files from package")

# ── Commit 3: Add CONTRIBUTING.md ──
write("CONTRIBUTING.md", """\
# Contributing to celo-minimarket SDK

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/celo-minimarket-sdk.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/my-feature`

## Development

- Build: `npm run build`
- Clean: `npm run clean`

## Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Keep functions focused and small

## Pull Requests

- Describe your changes clearly
- Reference related issues
- Ensure the build passes before submitting

## Reporting Issues

Use GitHub Issues to report bugs or request features. Include:
- Steps to reproduce
- Expected vs actual behavior
- SDK version and environment details
""")
commit("docs: add CONTRIBUTING.md with development guidelines")

# ── Commit 4: Add version utility ──
write("src/version.ts", """\
/** SDK version, kept in sync with package.json */
export const SDK_VERSION = "1.0.0";

/** Minimum supported ethers.js version */
export const MIN_ETHERS_VERSION = "5.7.0";

/** Print SDK info to console (useful for debugging) */
export function printSDKInfo(): void {
  console.log(`celo-minimarket SDK v${SDK_VERSION}`);
  console.log(`Requires ethers.js >= ${MIN_ETHERS_VERSION}`);
}
""")
commit("feat: add version utility module for SDK versioning")

# ── Commit 5: Add validation helpers ──
write("src/validation.ts", """\
import { ethers } from "ethers";

/** Validate an Ethereum address */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
}

/** Validate a positive price string (in cUSD) */
export function isValidPrice(price: string): boolean {
  try {
    const parsed = parseFloat(price);
    return !isNaN(parsed) && parsed > 0 && parsed < 1e12;
  } catch {
    return false;
  }
}

/** Validate product name (non-empty, max 100 chars) */
export function isValidProductName(name: string): boolean {
  return typeof name === "string" && name.trim().length > 0 && name.length <= 100;
}

/** Validate product description (max 500 chars) */
export function isValidDescription(description: string): boolean {
  return typeof description === "string" && description.length <= 500;
}

/** Validate token ID */
export function isValidTokenId(tokenId: number): boolean {
  return Number.isInteger(tokenId) && tokenId >= 0;
}

/** Validate AddProductParams */
export function validateAddProductParams(params: {
  name: string;
  priceInCUSD: string;
  description: string;
  imageData: string;
}): string[] {
  const errors: string[] = [];
  if (!isValidProductName(params.name)) errors.push("Invalid product name");
  if (!isValidPrice(params.priceInCUSD)) errors.push("Invalid price");
  if (!isValidDescription(params.description)) errors.push("Description too long");
  if (!params.imageData || params.imageData.trim().length === 0) errors.push("Image data required");
  return errors;
}
""")
commit("feat: add input validation helpers for addresses and product params")

# ── Commit 6: Add retry utility ──
write("src/retry.ts", """\
import { NetworkError } from "./errors";

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

/** Retry an async operation with exponential backoff */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay } = { ...DEFAULT_RETRY, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxRetries) break;
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new NetworkError(
    `Operation failed after ${maxRetries + 1} attempts: ${lastError?.message}`
  );
}
""")
commit("feat: add retry utility with exponential backoff for RPC calls")

# ── Commit 7: Add gas estimation utility ──
write("src/gas.ts", """\
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
""")
commit("feat: add gas estimation utilities for transaction cost prediction")

# ── Commit 8: Add caching utility ──
write("src/cache.ts", """\
/** Simple in-memory TTL cache for RPC responses */
export class Cache<T> {
  private store = new Map<string, { value: T; expiry: number }>();
  private readonly ttl: number;

  constructor(ttlMs: number = 30_000) {
    this.ttl = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiry: Date.now() + this.ttl });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    this.cleanup();
    return this.store.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiry) this.store.delete(key);
    }
  }
}
""")
commit("feat: add TTL cache for reducing redundant RPC calls")

# ── Commit 9: Add logging utility ──
write("src/logger.ts", """\
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

let currentLevel = LogLevel.WARN;

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

function formatMessage(level: string, msg: string): string {
  return `[celo-minimarket:${level}] ${msg}`;
}

export const logger = {
  debug(msg: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(formatMessage("debug", msg), ...args);
    }
  },
  info(msg: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.INFO) {
      console.info(formatMessage("info", msg), ...args);
    }
  },
  warn(msg: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(formatMessage("warn", msg), ...args);
    }
  },
  error(msg: string, ...args: unknown[]): void {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(formatMessage("error", msg), ...args);
    }
  },
};
""")
commit("feat: add configurable logger with log levels for debugging")

# ── Commit 10: Update exports.ts to include new modules ──
with open("src/exports.ts", "a") as f:
    f.write("\nexport * from './validation';\n")
    f.write("export * from './retry';\n")
    f.write("export * from './cache';\n")
    f.write("export * from './logger';\n")
    f.write("export * from './version';\n")
    f.write("export * from './gas';\n")
commit("chore: export new utility modules from barrel file")

# ── Commit 11: Update index.ts to export new modules ──
with open("src/index.ts", "a") as f:
    f.write("""
// Validation
export {
  isValidAddress,
  isValidPrice,
  isValidProductName,
  isValidDescription,
  isValidTokenId,
  validateAddProductParams,
} from "./validation";

// Retry
export { withRetry } from "./retry";
export type { RetryOptions } from "./retry";

// Cache
export { Cache } from "./cache";

// Logger
export { logger, setLogLevel, getLogLevel, LogLevel } from "./logger";

// Version
export { SDK_VERSION, MIN_ETHERS_VERSION, printSDKInfo } from "./version";

// Gas estimation
export { estimateGas, addGasBuffer } from "./gas";
export type { GasEstimate } from "./gas";
""")
commit("feat: export all new utilities from main index")

# ── Commit 12: Add TypeScript strict checks to base tsconfig ──
import json
with open("tsconfig.json") as f:
    tsconfig = json.load(f)
tsconfig["compilerOptions"]["strict"] = True
tsconfig["compilerOptions"]["forceConsistentCasingInFileNames"] = True
tsconfig["compilerOptions"]["skipLibCheck"] = True
with open("tsconfig.json", "w") as f:
    json.dump(tsconfig, f, indent=2)
    f.write("\n")
commit("chore: enable strict mode and additional checks in tsconfig")

# ── Commit 13: Add CHANGELOG.md ──
write("CHANGELOG.md", """\
# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-04-20

### Added
- Core `CeloMiniMarket` client for contract interaction
- MiniPay detection and auto-connect utilities
- Stablecoin balance queries (cUSD, USDC, USDT)
- Product listing, purchasing, and management
- Event listeners for marketplace events
- React hooks: `useCeloMiniMarket`, `useMiniPay`, `useMiniPayAutoConnect`
- Input validation helpers
- Retry utility with exponential backoff
- In-memory TTL cache for RPC responses
- Gas estimation utilities
- Configurable logger with log levels
- Pagination and filtering helpers
- Formatting utilities for addresses, amounts, and explorer URLs
- TypeScript type definitions for all SDK interfaces
- Dual CJS/ESM build output
- MIT License
""")
commit("docs: add CHANGELOG.md for version tracking")

# ── Commit 14: Add .editorconfig ──
write(".editorconfig", """\
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
""")
commit("chore: add .editorconfig for consistent formatting")

# ── Commit 15: Improve error parsing with more patterns ──
with open("src/errors.ts", "r") as f:
    content = f.read()
content = content.replace(
    "export function parseError(error: unknown): CeloMiniMarketError {\n  const msg = (error as Error)?.message || String(error);\n  if (msg.includes('insufficient funds')) return new InsufficientFundsError('unknown', 'unknown');\n  if (msg.includes('not found')) return new ProductNotFoundError(0);\n  if (msg.includes('already sold')) return new ProductSoldError(0);\n  return new CeloMiniMarketError(msg, 'UNKNOWN');\n}",
    """\
export class ApprovalError extends CeloMiniMarketError {
  constructor(spender: string, amount: string) {
    super(`Approval failed for ${spender} with amount ${amount}`, 'APPROVAL_ERROR', { spender, amount });
    this.name = 'ApprovalError';
  }
}
export class ContractNotDeployedError extends CeloMiniMarketError {
  constructor(address: string) {
    super(`No contract deployed at ${address}`, 'CONTRACT_NOT_DEPLOYED', { address });
    this.name = 'ContractNotDeployedError';
  }
}
export function parseError(error: unknown): CeloMiniMarketError {
  const msg = (error as Error)?.message || String(error);
  if (msg.includes('insufficient funds') || msg.includes('INSUFFICIENT_FUNDS'))
    return new InsufficientFundsError('unknown', 'unknown');
  if (msg.includes('not found') || msg.includes('nonexistent token'))
    return new ProductNotFoundError(0);
  if (msg.includes('already sold') || msg.includes('product is sold'))
    return new ProductSoldError(0);
  if (msg.includes('execution reverted'))
    return new TransactionError(msg);
  if (msg.includes('network') || msg.includes('timeout') || msg.includes('ETIMEDOUT'))
    return new NetworkError(msg);
  return new CeloMiniMarketError(msg, 'UNKNOWN');
}
export function isUserRejection(error: unknown): boolean {
  const msg = (error as Error)?.message || String(error);
  return msg.includes('user rejected') || msg.includes('User denied') || msg.includes('ACTION_REJECTED');
}"""
)
with open("src/errors.ts", "w") as f:
    f.write(content)
commit("feat: add ApprovalError, ContractNotDeployedError, and improved error parsing")

# ── Commit 16: Add network switching helper ──
write("src/network.ts", """\
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
""")
commit("feat: add network switching helper for Celo mainnet and Alfajores")

# ── Commit 17: Add ERC20 approval helper ──
write("src/approval.ts", """\
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
""")
commit("feat: add ERC20 token approval helpers for cUSD spending")

# ── Commit 18: Add useNetworkStatus React hook ──
write("src/react/useNetworkStatus.ts", """\
import { useState, useEffect } from "react";
import { verifyCeloNetwork } from "../minipay";

interface NetworkStatus {
  isCelo: boolean;
  isMainnet: boolean;
  isTestnet: boolean;
  chainId: number | null;
  isChecking: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isCelo: false,
    isMainnet: false,
    isTestnet: false,
    chainId: null,
    isChecking: true,
  });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        if (!cancelled) setStatus((s) => ({ ...s, isChecking: false }));
        return;
      }

      try {
        const { ethers } = await import("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const result = await verifyCeloNetwork(provider);
        if (!cancelled) {
          setStatus({
            isCelo: result.isCelo,
            isMainnet: result.isMainnet,
            isTestnet: result.isTestnet,
            chainId: result.chainId,
            isChecking: false,
          });
        }
      } catch {
        if (!cancelled) setStatus((s) => ({ ...s, isChecking: false }));
      }
    };

    check();

    const handleChainChanged = () => { check(); };
    window.ethereum?.on?.("chainChanged", handleChainChanged);

    return () => {
      cancelled = true;
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  return status;
}
""")
# Update react barrel
with open("src/react/index.ts", "a") as f:
    f.write('export { useNetworkStatus } from "./useNetworkStatus";\n')
commit("feat: add useNetworkStatus React hook for chain detection")

# ── Commit 19: Add useStablecoinBalances React hook ──
write("src/react/useStablecoinBalances.ts", """\
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getStablecoinBalances } from "../tokens";
import type { StablecoinBalances } from "../types";

interface UseStablecoinBalancesResult {
  balances: StablecoinBalances | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStablecoinBalances(
  address: string | null | undefined,
  provider?: ethers.providers.Provider
): UseStablecoinBalancesResult {
  const [balances, setBalances] = useState<StablecoinBalances | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const rpcProvider =
        provider ||
        new ethers.providers.JsonRpcProvider("https://forno.celo.org", 42220);
      const result = await getStablecoinBalances(address, rpcProvider);
      setBalances(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setIsLoading(false);
    }
  }, [address, provider]);

  useEffect(() => {
    if (address) refetch();
  }, [address, refetch]);

  return { balances, isLoading, error, refetch };
}
""")
with open("src/react/index.ts", "a") as f:
    f.write('export { useStablecoinBalances } from "./useStablecoinBalances";\n')
commit("feat: add useStablecoinBalances React hook for wallet balance display")

# ── Commit 20: Add npm build script for CI ──
with open("package.json") as f:
    pkg = json.load(f)
pkg["scripts"]["lint"] = "tsc --noEmit"
pkg["scripts"]["prebuild"] = "npm run lint"
pkg["engines"] = {"node": ">=16.0.0"}
with open("package.json", "w") as f:
    json.dump(pkg, f, indent=2)
    f.write("\n")
commit("chore: add lint script, prebuild check, and engines field")

# ── Commit 21: Add GitHub Actions CI workflow ──
os.makedirs(".github/workflows", exist_ok=True)
write(".github/workflows/ci.yml", """\
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
      - run: npm ci
      - run: npm run build
""")
commit("ci: add GitHub Actions workflow for build validation")

# ── Commit 22: Improve README with badges and more examples ──
with open("README.md", "r") as f:
    readme = f.read()
badge_section = """\
# celo-minimarket

[![npm version](https://img.shields.io/npm/v/celo-minimarket.svg)](https://www.npmjs.com/package/celo-minimarket)
[![CI](https://github.com/phessophissy/celo-minimarket-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/phessophissy/celo-minimarket-sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

"""
if readme.startswith("# "):
    first_newline = readme.index("\n")
    readme = badge_section + readme[first_newline+1:]
else:
    readme = badge_section + readme
with open("README.md", "w") as f:
    f.write(readme)
commit("docs: add npm, CI, and license badges to README")

print("Done! All commits created.")
run("git log --oneline")
