import { ethers } from "ethers";
import { CELO_MINIMARKET_ABI } from "./abi";
import { CONTRACTS, RPC_URLS, CHAIN_IDS } from "./constants";
import { detectMiniPay, buildMiniPayTransaction } from "./minipay";
import type {
  Product,
  MiniMarketConfig,
  AddProductParams,
  TransactionResult,
} from "./types";

function parseProduct(raw: {
  tokenId: ethers.BigNumber;
  vendor: string;
  name: string;
  priceWei: ethers.BigNumber;
  description: string;
  imageData: string;
  active: boolean;
  sold: boolean;
}): Product {
  return {
    tokenId: raw.tokenId.toNumber(),
    vendor: raw.vendor,
    name: raw.name,
    priceWei: raw.priceWei.toString(),
    priceCUSD: ethers.utils.formatUnits(raw.priceWei, 18),
    description: raw.description,
    imageData: raw.imageData,
    active: raw.active,
    sold: raw.sold,
  };
}

function parseTupleProduct(tuple: [
  ethers.BigNumber, string, string, ethers.BigNumber, string, string, boolean, boolean,
]): Product {
  return {
    tokenId: tuple[0].toNumber(),
    vendor: tuple[1],
    name: tuple[2],
    priceWei: tuple[3].toString(),
    priceCUSD: ethers.utils.formatUnits(tuple[3], 18),
    description: tuple[4],
    imageData: tuple[5],
    active: tuple[6],
    sold: tuple[7],
  };
}

export class CeloMiniMarket {
  public readonly contract: ethers.Contract;
  public readonly provider: ethers.providers.Provider;
  public readonly address: string;
  /** @internal */
  public signer: ethers.Signer | null = null;

  constructor(config: MiniMarketConfig = {}) {
    this.address = config.contractAddress || CONTRACTS.CeloMiniMarket;
    const rpcUrl = config.rpcUrl || RPC_URLS.MAINNET;

    this.provider = new ethers.providers.JsonRpcProvider(
      rpcUrl,
      config.chainId || CHAIN_IDS.MAINNET
    );

    this.contract = new ethers.Contract(
      this.address,
      CELO_MINIMARKET_ABI,
      this.provider
    );
  }

  connect(signerOrProvider: ethers.Signer | ethers.providers.Provider): CeloMiniMarket {
    const instance = Object.create(CeloMiniMarket.prototype) as CeloMiniMarket;
    Object.assign(instance, this);

    if (ethers.Signer.isSigner(signerOrProvider)) {
      (instance as { signer: ethers.Signer }).signer = signerOrProvider;
      (instance as { contract: ethers.Contract }).contract = this.contract.connect(signerOrProvider);
    } else {
      (instance as { contract: ethers.Contract }).contract = this.contract.connect(signerOrProvider);
    }

    return instance;
  }

  static fromProvider(
    provider: ethers.providers.Web3Provider,
    config: Omit<MiniMarketConfig, "rpcUrl" | "chainId"> = {}
  ): CeloMiniMarket {
    const address = config.contractAddress || CONTRACTS.CeloMiniMarket;
    const instance = Object.create(CeloMiniMarket.prototype) as CeloMiniMarket;

    (instance as { address: string }).address = address;
    (instance as { provider: ethers.providers.Provider }).provider = provider;
    (instance as { signer: ethers.Signer }).signer = provider.getSigner();
    (instance as { contract: ethers.Contract }).contract = new ethers.Contract(
      address,
      CELO_MINIMARKET_ABI,
      provider.getSigner()
    );

    return instance;
  }

  static forMiniPay(
    config: Omit<MiniMarketConfig, "rpcUrl" | "chainId"> = {}
  ): CeloMiniMarket | null {
    if (!detectMiniPay()) return null;

    const provider = new ethers.providers.Web3Provider(window.ethereum!);
    return CeloMiniMarket.fromProvider(provider, config);
  }

  // ── Read Methods ──

  async getActiveProducts(): Promise<Product[]> {
    const raw = await this.contract.getActiveProducts();
    return raw.map(parseProduct);
  }

  async getProduct(tokenId: number): Promise<Product> {
    const tuple = await this.contract.getProduct(tokenId);
    return parseTupleProduct(tuple);
  }

  async getProductsCount(): Promise<number> {
    const count: ethers.BigNumber = await this.contract.productsCount();
    return count.toNumber();
  }

  async getTokenURI(tokenId: number): Promise<string> {
    return this.contract.tokenURI(tokenId);
  }

  async getOwner(tokenId: number): Promise<string> {
    return this.contract.ownerOf(tokenId);
  }

  async getBalance(address: string): Promise<number> {
    const balance: ethers.BigNumber = await this.contract.balanceOf(address);
    return balance.toNumber();
  }

  // ── Write Methods ──

  private requireSigner(): ethers.Signer {
    if (!this.signer) {
      throw new Error(
        "CeloMiniMarket: No signer connected. Use .connect(signer) or CeloMiniMarket.fromProvider()."
      );
    }
    return this.signer;
  }

  async addProduct(params: AddProductParams): Promise<TransactionResult> {
    this.requireSigner();
    const priceWei = ethers.utils.parseUnits(params.priceInCUSD, 18);
    const tx = await this.contract.addProduct(
      params.name,
      priceWei,
      params.description,
      params.imageData
    );
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async purchaseProduct(tokenId: number, priceWei: string): Promise<TransactionResult> {
    this.requireSigner();
    let txOverrides: Record<string, unknown> = {
      value: ethers.BigNumber.from(priceWei),
    };
    txOverrides = buildMiniPayTransaction(txOverrides);
    const tx = await this.contract.purchaseProduct(tokenId, txOverrides);
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  async toggleProduct(tokenId: number, active: boolean): Promise<TransactionResult> {
    this.requireSigner();
    const tx = await this.contract.toggleProduct(tokenId, active);
    return { hash: tx.hash, wait: () => tx.wait() };
  }

  // ── Event Listeners ──

  onProductAdded(
    callback: (tokenId: number, vendor: string, name: string, priceWei: string) => void
  ): () => void {
    const handler = (
      tokenId: ethers.BigNumber,
      vendor: string,
      name: string,
      priceWei: ethers.BigNumber
    ) => {
      callback(tokenId.toNumber(), vendor, name, priceWei.toString());
    };
    this.contract.on("ProductAdded", handler);
    return () => this.contract.off("ProductAdded", handler);
  }

  onProductPurchased(
    callback: (tokenId: number, buyer: string, vendor: string, price: string) => void
  ): () => void {
    const handler = (
      tokenId: ethers.BigNumber,
      buyer: string,
      vendor: string,
      price: ethers.BigNumber
    ) => {
      callback(tokenId.toNumber(), buyer, vendor, price.toString());
    };
    this.contract.on("ProductPurchased", handler);
    return () => this.contract.off("ProductPurchased", handler);
  }

  onProductStatusToggled(
    callback: (tokenId: number, active: boolean) => void
  ): () => void {
    const handler = (tokenId: ethers.BigNumber, active: boolean) => {
      callback(tokenId.toNumber(), active);
    };
    this.contract.on("ProductStatusToggled", handler);
    return () => this.contract.off("ProductStatusToggled", handler);
  }

  removeAllListeners(): void {
    this.contract.removeAllListeners();
  }
}
