const {
  CONTRACTS,
  CeloMiniMarket,
} = require('celo-minimarket');

console.log('Celo MiniMarket Growth Bot running...');
console.log('SDK Contract Address:', CONTRACTS.CeloMiniMarket);

if (typeof CeloMiniMarket !== 'function') {
  console.error('Smoke check failed: CeloMiniMarket is not available.');
  process.exit(1);
}

const sdk = new CeloMiniMarket();
console.log('Smoke check passed: CeloMiniMarket instantiated successfully.');
console.log('Contract address:', sdk.address);
