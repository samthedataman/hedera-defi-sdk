/**
 * Integration test script to validate the HederaDeFi SDK
 * This tests the actual API integration without mocking
 */

const { HederaDeFi } = require('./dist/index.js');

async function runIntegrationTests() {
  console.log('🚀 Starting Hedera DeFi SDK Integration Tests\n');
  
  const client = new HederaDeFi({
    cacheTtl: 60,
    timeout: 30000
  });

  try {
    // Test 1: Network Supply
    console.log('📊 Testing getNetworkSupply()...');
    const supply = await client.getNetworkSupply();
    console.log(`✅ Total Supply: ${supply.totalSupply.toLocaleString()} HBAR`);
    console.log(`✅ Circulating Supply: ${supply.circulatingSupply.toLocaleString()} HBAR\n`);

    // Test 2: Network Nodes
    console.log('🔗 Testing getNetworkNodes()...');
    const nodes = await client.getNetworkNodes();
    console.log(`✅ Found ${nodes.length} network nodes\n`);

    // Test 3: Account Info
    console.log('👤 Testing getAccountInfo()...');
    const accountInfo = await client.getAccountInfo('0.0.2');
    if (accountInfo) {
      const balanceHbar = accountInfo.balance.balance / 100_000_000;
      console.log(`✅ Account 0.0.2 Balance: ${balanceHbar.toFixed(8)} HBAR\n`);
    }

    // Test 4: Top Tokens
    console.log('🪙 Testing getTopTokens()...');
    const tokens = await client.getTopTokens(5);
    console.log(`✅ Found ${tokens.length} tokens:`);
    tokens.forEach((token, i) => {
      console.log(`   ${i+1}. ${token.symbol} (${token.tokenId}) - Price: $${token.price.toFixed(6)}`);
    });
    console.log();

    // Test 5: SaucerSwap Stats
    console.log('🌐 Testing getSaucerSwapStats()...');
    const saucerStats = await client.getSaucerSwapStats();
    console.log(`✅ SaucerSwap TVL: $${saucerStats.tvlUsd.toLocaleString()}`);
    console.log(`✅ Total Volume: $${saucerStats.volumeTotalUsd.toLocaleString()}`);
    console.log(`✅ Total Swaps: ${saucerStats.swapTotal.toLocaleString()}\n`);

    // Test 6: SaucerSwap Pools
    console.log('🏊 Testing getSaucerSwapPools()...');
    const pools = await client.getSaucerSwapPools();
    console.log(`✅ Found ${pools.length} SaucerSwap pools\n`);

    // Test 7: SaucerSwap Tokens
    console.log('💰 Testing getSaucerSwapTokens()...');
    const saucerTokens = await client.getSaucerSwapTokens();
    console.log(`✅ Found ${saucerTokens.length} SaucerSwap tokens\n`);

    // Test 8: Bonzo Markets
    console.log('🏦 Testing getBonzoMarkets()...');
    const bonzoMarkets = await client.getBonzoMarkets();
    if (bonzoMarkets) {
      console.log(`✅ Bonzo Network: ${bonzoMarkets.networkName}`);
      console.log(`✅ Total Reserves: ${bonzoMarkets.reserves.length}`);
      console.log(`✅ Total Market Supplied: ${bonzoMarkets.totalMarketSupplied.usdDisplay}\n`);
    } else {
      console.log('⚠️ Bonzo markets data unavailable (API may be down)\n');
    }

    // Test 9: Cross-Protocol Summary
    console.log('🔄 Testing getCrossProtocolLiquiditySummary()...');
    const summary = await client.getCrossProtocolLiquiditySummary();
    console.log(`✅ Total DeFi Liquidity: $${summary.totalLiquidityUsd.toLocaleString()}`);
    console.log(`✅ SaucerSwap: $${summary.saucerswap.tvlUsd.toLocaleString()} (${summary.saucerswap.poolCount} pools)`);
    console.log(`✅ Bonzo Finance: $${summary.bonzoFinance.tvlUsd.toLocaleString()} (${summary.bonzoFinance.reserveCount} reserves)\n`);

    // Test 10: Token Images
    console.log('🖼️ Testing getAllTokenImages()...');
    const images = await client.getAllTokenImages();
    console.log(`✅ Found ${images.stats.tokensWithImages} tokens with images`);
    console.log(`✅ PNG Images: ${images.stats.pngImagesCount}\n`);

    // Test 11: Performance Statistics
    console.log('📈 API Call Statistics:');
    const stats = client.showCallStatistics();
    console.log(`✅ Total API Calls: ${stats.totalCalls}`);
    console.log(`✅ Unique Methods: ${stats.uniqueMethods}`);
    if (stats.excessiveMethods.length > 0) {
      console.log(`⚠️ Excessive Methods: ${stats.excessiveMethods.join(', ')}`);
    }

    console.log('\n🎉 All integration tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Mirror Node API: ✅ Working`);
    console.log(`   • SaucerSwap API: ✅ Working`);
    console.log(`   • Bonzo Finance API: ${bonzoMarkets ? '✅ Working' : '⚠️ Unavailable'}`);
    console.log(`   • Cross-protocol analytics: ✅ Working`);
    console.log(`   • Performance monitoring: ✅ Working`);

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runIntegrationTests().catch(console.error);