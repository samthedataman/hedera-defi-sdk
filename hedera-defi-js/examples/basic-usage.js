/**
 * Basic usage examples for Hedera DeFi SDK
 */

const { HederaDeFi } = require('../dist/index.js');

async function basicUsageExamples() {
  console.log('🚀 Hedera DeFi SDK - Basic Usage Examples\n');
  
  // Initialize the client
  const client = new HederaDeFi({
    cacheTtl: 60, // Cache for 60 seconds
    timeout: 30000 // 30 second timeout
  });

  try {
    // Example 1: Get network overview
    console.log('📊 Example 1: Network Overview');
    const supply = await client.getNetworkSupply();
    const nodes = await client.getNetworkNodes();
    const exchangeRate = await client.getNetworkExchangeRate();
    
    console.log(`Total HBAR Supply: ${supply.totalSupply.toLocaleString()}`);
    console.log(`Circulating Supply: ${supply.circulatingSupply.toLocaleString()}`);
    console.log(`Network Nodes: ${nodes.length}`);
    if (exchangeRate) {
      console.log(`Exchange Rate: ${exchangeRate.currentRate.centEquiv} cents per HBAR`);
    }
    console.log();

    // Example 2: Account information
    console.log('👤 Example 2: Account Information');
    const accountId = '0.0.2'; // Treasury account
    const accountInfo = await client.getAccountInfo(accountId);
    const accountTokens = await client.getAccountTokens(accountId);
    
    if (accountInfo) {
      const balance = accountInfo.balance.balance / 100_000_000;
      console.log(`Account ${accountId} Balance: ${balance.toFixed(8)} HBAR`);
      console.log(`Token Holdings: ${accountTokens.length} different tokens`);
    }
    console.log();

    // Example 3: Top tokens with prices
    console.log('🪙 Example 3: Top Tokens');
    const topTokens = await client.getTopTokens(5);
    console.log('Top 5 tokens:');
    topTokens.forEach((token, i) => {
      const price = token.price > 0 ? `$${token.price.toFixed(6)}` : 'No price data';
      console.log(`${i+1}. ${token.symbol} (${token.tokenId}) - ${price}`);
    });
    console.log();

    // Example 4: SaucerSwap DEX data
    console.log('🌐 Example 4: SaucerSwap DEX');
    const saucerStats = await client.getSaucerSwapStats();
    const saucerPools = await client.getSaucerSwapPools();
    const saucerTokens = await client.getSaucerSwapTokens();
    
    console.log(`TVL: $${saucerStats.tvlUsd.toLocaleString()}`);
    console.log(`Total Volume: $${saucerStats.volumeTotalUsd.toLocaleString()}`);
    console.log(`Pools: ${saucerPools.length}`);
    console.log(`Tokens: ${saucerTokens.length}`);
    console.log();

    // Example 5: Bonzo Finance lending
    console.log('🏦 Example 5: Bonzo Finance Lending');
    const bonzoMarkets = await client.getBonzoMarkets();
    
    if (bonzoMarkets) {
      console.log(`Network: ${bonzoMarkets.networkName || 'Hedera Mainnet'}`);
      console.log(`Reserves: ${bonzoMarkets.reserves.length}`);
      console.log(`Total Supplied: ${bonzoMarkets.totalMarketSupplied.usdDisplay || 'N/A'}`);
      
      // Show top 3 reserves by supply APY
      const topReserves = bonzoMarkets.reserves
        .filter(r => r.active)
        .sort((a, b) => b.supplyApy - a.supplyApy)
        .slice(0, 3);
        
      console.log('Top lending opportunities:');
      topReserves.forEach((reserve, i) => {
        console.log(`${i+1}. ${reserve.symbol} - ${reserve.supplyApy.toFixed(2)}% APY`);
      });
    } else {
      console.log('Bonzo Finance data unavailable');
    }
    console.log();

    // Example 6: Cross-protocol analytics
    console.log('🔄 Example 6: Cross-Protocol Summary');
    const summary = await client.getCrossProtocolLiquiditySummary();
    
    console.log(`Total DeFi Liquidity: $${summary.totalLiquidityUsd.toLocaleString()}`);
    console.log('Protocol breakdown:');
    console.log(`- SaucerSwap (DEX): $${summary.saucerswap.tvlUsd.toLocaleString()} (${summary.protocolDistribution.dexPercentage.toFixed(1)}%)`);
    console.log(`- Bonzo Finance (Lending): $${summary.bonzoFinance.tvlUsd.toLocaleString()} (${summary.protocolDistribution.lendingPercentage.toFixed(1)}%)`);
    console.log();

    // Example 7: Token images/metadata
    console.log('🖼️ Example 7: Token Images');
    const tokenImages = await client.getAllTokenImages();
    console.log(`Tokens with images: ${tokenImages.stats.tokensWithImages}`);
    console.log(`PNG format: ${tokenImages.stats.pngImagesCount}`);
    console.log();

    // Example 8: Performance monitoring
    console.log('📊 Example 8: Performance Statistics');
    const stats = client.showCallStatistics();
    console.log(`Total API calls made: ${stats.totalCalls}`);
    console.log(`Unique methods called: ${stats.uniqueMethods}`);
    console.log();

    console.log('✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error in examples:', error.message);
  }
}

// Run the examples
if (require.main === module) {
  basicUsageExamples().catch(console.error);
}

module.exports = { basicUsageExamples };