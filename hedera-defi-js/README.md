# Hedera DeFi SDK - JavaScript/TypeScript

A comprehensive TypeScript/JavaScript SDK for accessing Hedera DeFi protocols, including SaucerSwap, Bonzo Finance, and Mirror Node APIs. This package provides 40+ methods for developers to integrate with the Hedera DeFi ecosystem.

## Features

- **Multi-Protocol Integration**: SaucerSwap (DEX), Bonzo Finance (Lending), Mirror Node (Network Data)
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **Request Caching**: Built-in TTL caching to optimize API performance
- **Performance Monitoring**: Call counting and performance tracking
- **Error Handling**: Robust error handling with retry logic and timeouts
- **Browser & Node.js**: Works in both browser and Node.js environments
- **CORS Support**: Proper CORS headers for browser usage

## Installation

```bash
npm install hedera-defi-js
```

## Quick Start

```typescript
import { HederaDeFi } from 'hedera-defi-js';

// Initialize the client
const client = new HederaDeFi({
  cacheTtl: 60, // Cache TTL in seconds
  timeout: 30000 // Request timeout in milliseconds
});

// Get network information
const supply = await client.getNetworkSupply();
console.log(`Total HBAR Supply: ${supply.totalSupply}`);

// Get token information
const tokens = await client.getTopTokens(10);
console.log(`Found ${tokens.length} tokens`);

// Get SaucerSwap data
const saucerStats = await client.getSaucerSwapStats();
console.log(`SaucerSwap TVL: $${saucerStats.tvlUsd.toLocaleString()}`);

// Get Bonzo Finance data
const bonzoMarkets = await client.getBonzoMarkets();
console.log(`Bonzo Reserves: ${bonzoMarkets?.reserves.length || 0}`);

// Get cross-protocol analytics
const liquiditySummary = await client.getCrossProtocolLiquiditySummary();
console.log(`Total DeFi Liquidity: $${liquiditySummary.totalLiquidityUsd.toLocaleString()}`);
```

## Configuration Options

```typescript
interface HederaDeFiConfig {
  apiKey?: string;                    // Optional API key
  endpoint?: string;                  // Mirror Node endpoint (default: mainnet)
  cacheTtl?: number;                  // Cache TTL in seconds (default: 60)
  bonzoApi?: string;                  // Bonzo Finance API endpoint
  saucerswapApi?: string;             // SaucerSwap API endpoint
  timeout?: number;                   // Request timeout in ms (default: 30000)
}

const client = new HederaDeFi({
  cacheTtl: 120,
  timeout: 60000,
  endpoint: 'https://mainnet-public.mirrornode.hedera.com/api/v1'
});
```

## Core Methods

### Network Methods
- `getNetworkSupply()` - Get total HBAR supply information
- `getNetworkNodes()` - Get network consensus nodes
- `getNetworkExchangeRate()` - Get HBAR to USD exchange rate

### Account Methods
- `getAccountInfo(accountId)` - Get comprehensive account information
- `getAccountBalance(accountId)` - Get account HBAR balance
- `getAccountTokens(accountId)` - Get all tokens held by account

### Token Methods
- `getTopTokens(limit, sortBy)` - Get top tokens with price data
- `getTokenInfo(tokenId)` - Get detailed token information

### SaucerSwap Integration
- `getSaucerSwapPools()` - Get all SaucerSwap liquidity pools
- `getSaucerSwapTokens()` - Get all tokens with price data
- `getSaucerSwapStats()` - Get protocol statistics

### Bonzo Finance Integration
- `getBonzoMarkets()` - Get complete market data
- `getBonzoReserves()` - Get all lending reserves
- `getBonzoTotalMarkets()` - Get market totals and statistics

### Cross-Protocol Analytics
- `getCrossProtocolLiquiditySummary()` - Liquidity across all protocols
- `getAllTokenImages()` - Token images and metadata

### Utility Methods
- `showCallStatistics()` - Display API call performance metrics
- `resetCallCounts()` - Reset performance counters
- `clearCache()` - Clear request cache

## Error Handling

The SDK includes comprehensive error handling:

```typescript
try {
  const accountInfo = await client.getAccountInfo('0.0.123456');
  if (accountInfo) {
    console.log(`Account Balance: ${accountInfo.balance.balance / 100_000_000} HBAR`);
  }
} catch (error) {
  if (error.message.includes('Invalid account ID')) {
    console.error('Please provide a valid Hedera account ID');
  } else {
    console.error('API request failed:', error.message);
  }
}
```

## Performance Monitoring

Track API usage and optimize performance:

```typescript
// Perform operations
await client.getNetworkSupply();
await client.getSaucerSwapStats();
await client.getBonzoMarkets();

// Check performance
const stats = client.showCallStatistics();
console.log(`Total API calls: ${stats.totalCalls}`);
console.log(`Excessive methods: ${stats.excessiveMethods.join(', ')}`);

// Reset for clean testing
client.resetCallCounts();
```

## Caching

The SDK automatically caches responses to improve performance:

```typescript
// First call - hits API
const tokens1 = await client.getSaucerSwapTokens(); // ~500ms

// Second call - from cache (within TTL)
const tokens2 = await client.getSaucerSwapTokens(); // ~1ms

// Clear cache if needed
client.clearCache();
```

## TypeScript Support

Full TypeScript support with comprehensive interfaces:

```typescript
import { 
  HederaDeFi, 
  Token, 
  Pool, 
  SaucerSwapStats, 
  BonzoMarketData,
  NetworkSupply 
} from 'hedera-defi-js';

const client = new HederaDeFi();

const supply: NetworkSupply = await client.getNetworkSupply();
const tokens: Token[] = await client.getTopTokens(5);
const stats: SaucerSwapStats = await client.getSaucerSwapStats();
```

## Browser Usage

For browser usage, ensure CORS is properly handled:

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import { HederaDeFi } from './node_modules/hedera-defi-js/dist/index.js';
        
        const client = new HederaDeFi();
        
        async function loadData() {
            try {
                const supply = await client.getNetworkSupply();
                document.getElementById('supply').textContent = 
                    `Total Supply: ${supply.totalSupply.toLocaleString()} HBAR`;
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        }
        
        loadData();
    </script>
</head>
<body>
    <div id="supply">Loading...</div>
</body>
</html>
```

## Examples

### Get DeFi Overview
```typescript
const client = new HederaDeFi();

async function getDeFiOverview() {
  const [supply, saucerStats, bonzoMarkets] = await Promise.all([
    client.getNetworkSupply(),
    client.getSaucerSwapStats(),
    client.getBonzoMarkets()
  ]);

  console.log('=== Hedera DeFi Overview ===');
  console.log(`Total HBAR Supply: ${supply.totalSupply.toLocaleString()}`);
  console.log(`SaucerSwap TVL: $${saucerStats.tvlUsd.toLocaleString()}`);
  console.log(`Bonzo Reserves: ${bonzoMarkets?.reserves.length || 0}`);
}

getDeFiOverview();
```

### Monitor Account Portfolio
```typescript
async function getPortfolio(accountId: string) {
  const [accountInfo, tokens] = await Promise.all([
    client.getAccountInfo(accountId),
    client.getAccountTokens(accountId)
  ]);

  if (accountInfo) {
    const hbarBalance = accountInfo.balance.balance / 100_000_000;
    console.log(`HBAR Balance: ${hbarBalance.toFixed(8)}`);
    console.log(`Token Count: ${tokens.length}`);
    
    // Show top tokens
    tokens.slice(0, 5).forEach(token => {
      console.log(`- ${token.token_id}: ${token.balance}`);
    });
  }
}

getPortfolio('0.0.123456');
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue on our GitHub repository or contact our development team.

---

Built with ❤️ for the Hedera DeFi ecosystem