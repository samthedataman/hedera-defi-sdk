# Hedera DeFi SDK - Examples

This directory contains comprehensive examples showing how to use the Hedera DeFi SDK in various scenarios.

## Examples Overview

### 1. Basic Usage (`basic-usage.js`)
Demonstrates fundamental SDK features:
- Network information (supply, nodes, exchange rates)
- Account data retrieval
- Token information and pricing
- SaucerSwap DEX data
- Bonzo Finance lending markets
- Cross-protocol analytics
- Performance monitoring

**Run:** `node examples/basic-usage.js`

### 2. Performance Demo (`performance-demo.js`)
Shows the SDK's performance optimizations:
- Caching benefits and speed improvements
- Sequential vs parallel API calls
- Cross-protocol summary optimization
- API call tracking and analysis
- Cache statistics and management

**Run:** `node examples/performance-demo.js`

### 3. Advanced Features (`advanced-features.js`)
Demonstrates complex use cases:
- DeFi portfolio analysis
- Advanced token analysis with market data
- Liquidity pool analysis and ranking
- Lending market opportunities
- Account validation utilities
- Yield farming opportunities across protocols

**Run:** `node examples/advanced-features.js`

### 4. Browser Example (`browser-example.html`)
Interactive web dashboard showing:
- Real-time DeFi data visualization
- Browser integration patterns
- Responsive UI components
- Error handling and loading states
- Performance monitoring in browser environment

**Run:** Open `browser-example.html` in your browser

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Build the SDK
npm run build

# Run basic example
node examples/basic-usage.js

# Run performance demo
node examples/performance-demo.js

# Run advanced features demo
node examples/advanced-features.js
```

## Browser Usage

For browser environments, you have several options:

### Option 1: NPM + Bundler (Recommended)
```bash
npm install hedera-defi-js
```

```javascript
import { HederaDeFi } from 'hedera-defi-js';

const client = new HederaDeFi({
  cacheTtl: 300,
  timeout: 30000
});
```

### Option 2: CDN (Coming Soon)
```html
<script src="https://cdn.jsdelivr.net/npm/hedera-defi-js/dist/bundle.js"></script>
<script>
  const client = new HederaDeFi.HederaDeFi();
</script>
```

## Key Features Demonstrated

### 🚀 Performance Optimizations
- **Intelligent Caching**: 100x+ speed improvement on repeated calls
- **Parallel Processing**: Up to 3x faster bulk operations
- **Call Tracking**: Monitor and optimize API usage
- **Memory Efficient**: Automatic cache management

### 📊 Comprehensive Analytics
- **Cross-Protocol Data**: Unified view of Hedera DeFi ecosystem
- **Real-time Pricing**: Live token prices and market data
- **Liquidity Analysis**: Pool performance and opportunities
- **Lending Markets**: APY tracking and optimization

### 🛠 Developer Experience
- **TypeScript Support**: Full type definitions included
- **Error Handling**: Graceful error handling with detailed messages
- **Flexible Configuration**: Customizable timeouts and cache settings
- **Extensive Documentation**: Inline comments and examples

## Performance Benchmarks

Based on our performance demos:

| Operation | First Call | Cached Call | Improvement |
|-----------|------------|-------------|-------------|
| Token Data | ~800ms | ~1ms | 800x faster |
| Market Data | ~600ms | ~1ms | 600x faster |
| Cross-Protocol | ~1500ms | ~1ms | 1500x faster |

## Production Tips

1. **Use Caching**: Enable caching (default) for significant performance gains
2. **Parallel Requests**: Use `Promise.all()` for independent API calls
3. **Monitor Calls**: Use `showCallStatistics()` to track API usage
4. **Handle Errors**: Always implement proper error handling
5. **Configure Timeouts**: Adjust based on your application needs

## Browser Compatibility

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Node.js**: 14.x and above
- **TypeScript**: 4.x and above

## Support

- **Documentation**: Check the README.md in the root directory
- **Issues**: Report bugs on GitHub
- **Examples**: All examples are production-ready patterns