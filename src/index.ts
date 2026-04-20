// Core client
export { CeloMiniMarket } from "./client";

// ABI
export { CELO_MINIMARKET_ABI, ERC20_ABI } from "./abi";

// Constants
export {
  CONTRACTS,
  CHAIN_IDS,
  RPC_URLS,
  SUPPORTED_STABLECOINS,
} from "./constants";

// MiniPay utilities
export {
  detectMiniPay,
  getMiniPayProvider,
  requestMiniPayAccounts,
  getMiniPayAddress,
  buildMiniPayTransaction,
  verifyCeloNetwork,
} from "./minipay";

// Token utilities
export {
  getStablecoinBalances,
  formatStablecoin,
  parseStablecoin,
} from "./tokens";

// Types
export type {
  Product,
  StablecoinBalance,
  StablecoinBalances,
  NetworkInfo,
  MiniPayInfo,
  MiniMarketConfig,
  AddProductParams,
  TransactionResult,
} from "./types";
export type { StablecoinSymbol, ChainId } from "./constants";
