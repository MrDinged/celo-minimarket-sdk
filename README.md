# celo-minimarket

[![npm version](https://img.shields.io/npm/v/celo-minimarket.svg)](https://www.npmjs.com/package/celo-minimarket)
[![CI](https://github.com/phessophissy/celo-minimarket-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/phessophissy/celo-minimarket-sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


SDK for interacting with the **CeloMiniMarket** smart contract on the Celo blockchain — a MiniPay-compatible NFT marketplace for listing, purchasing, and managing products with cUSD stablecoins.

## Installation

```bash
npm install celo-minimarket ethers@5
```

## Quick Start

### Read-only (no wallet needed)

```js
import { CeloMiniMarket } from 'celo-minimarket';

const market = new CeloMiniMarket();

// Fetch all active listings
const products = await market.getActiveProducts();
console.log(products);

// Get a specific product
const product = await market.getProduct(1);
console.log(product.name, product.priceCUSD, 'cUSD');
```

### With a Wallet (browser)

```js
import { CeloMiniMarket } from 'celo-minimarket';
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const market = CeloMiniMarket.fromProvider(provider);

// List a product
const tx = await market.addProduct({
  name: 'Handmade Bracelet',
  priceInCUSD: '5.00',
  description: 'Beautiful handcrafted bracelet',
  imageData: 'https://example.com/bracelet.jpg',
});
await tx.wait();

// Purchase a product
const purchase = await market.purchaseProduct(1, product.priceWei);
await purchase.wait();
```

### MiniPay Integration

```js
import { CeloMiniMarket, detectMiniPay } from 'celo-minimarket';

if (detectMiniPay()) {
  const market = CeloMiniMarket.forMiniPay();
  const products = await market.getActiveProducts();
}
```

## React Hooks

```jsx
import { useMiniPay, useCeloMiniMarket } from 'celo-minimarket/react';

function Marketplace() {
  const { isMiniPay, miniPayAddress, connectMiniPay } = useMiniPay();
  const { products, isLoading, addProduct, purchaseProduct } = useCeloMiniMarket();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {isMiniPay && <span>Connected: {miniPayAddress}</span>}
      {products.map(p => (
        <div key={p.tokenId}>
          <h3>{p.name}</h3>
          <p>{p.priceCUSD} cUSD</p>
          <button onClick={() => purchaseProduct(p.tokenId, p.priceWei)}>
            Buy
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Token Utilities

```js
import { getStablecoinBalances, formatStablecoin, parseStablecoin } from 'celo-minimarket';

// Get cUSD/USDC/USDT balances
const balances = await getStablecoinBalances(address, provider);
console.log(balances.cUSD.formatted); // "12.50"

// Format wei to human-readable
formatStablecoin('5000000000000000000'); // "5.00"

// Parse human-readable to wei
parseStablecoin('5.00'); // BigNumber
```

## MiniPay Helpers

```js
import {
  detectMiniPay,
  getMiniPayProvider,
  getMiniPayAddress,
  buildMiniPayTransaction,
  verifyCeloNetwork,
} from 'celo-minimarket';

// Detect MiniPay wallet
if (detectMiniPay()) {
  const address = await getMiniPayAddress();

  // Build MiniPay-compatible tx (strips EIP-1559 fields)
  const tx = buildMiniPayTransaction({ to: '0x...', value: '1000' });
}

// Verify Celo network
const network = await verifyCeloNetwork(provider);
// { isCelo: true, chainId: 42220, isMainnet: true, isTestnet: false }
```

## Event Listeners

```js
const market = new CeloMiniMarket();

const unsubscribe = market.onProductAdded((tokenId, vendor, name, priceWei) => {
  console.log(`New product #${tokenId}: ${name}`);
});

// Cleanup
unsubscribe();
```

## Constants

```js
import { CONTRACTS, CHAIN_IDS, RPC_URLS, SUPPORTED_STABLECOINS } from 'celo-minimarket';

CONTRACTS.CeloMiniMarket  // "0x7a280e8b5995F72F20a1e90177C20D002aC1C3a4"
CONTRACTS.cUSD             // "0x765DE816845861e75A25fCA122bb6898B8B1282a"
CHAIN_IDS.MAINNET          // 42220
RPC_URLS.MAINNET           // "https://forno.celo.org"
```

## API Reference

### `CeloMiniMarket`

| Method | Returns | Description |
|--------|---------|-------------|
| `getActiveProducts()` | `Product[]` | All active, unsold listings |
| `getProduct(tokenId)` | `Product` | Single product by token ID |
| `getProductsCount()` | `number` | Total products created |
| `addProduct(params)` | `TransactionResult` | List a new product |
| `purchaseProduct(tokenId, priceWei)` | `TransactionResult` | Buy a product |
| `toggleProduct(tokenId, active)` | `TransactionResult` | Toggle listing status |
| `onProductAdded(cb)` | `() => void` | Listen for new listings |
| `onProductPurchased(cb)` | `() => void` | Listen for purchases |

### `Product` Type

```ts
interface Product {
  tokenId: number;
  vendor: string;
  name: string;
  priceWei: string;
  priceCUSD: string;
  description: string;
  imageData: string;
  active: boolean;
  sold: boolean;
}
```

## License

MIT
