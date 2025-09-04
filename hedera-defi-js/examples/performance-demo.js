/**
 * Performance demonstration examples for Hedera DeFi SDK
 * Shows caching benefits and optimal usage patterns
 */

const { HederaDeFi } = require('../dist/index.js');

async function performanceDemo() {
  console.log('🚀 Hedera DeFi SDK - Performance Demonstration\n');
  
  const client = new HederaDeFi({
    cacheTtl: 300, // 5 minute cache
    timeout: 30000
  });

  try {
    // Demo 1: Cache Performance
    console.log('⚡ Demo 1: Caching Performance Benefits');
    console.log('Making first API call (no cache)...');
    
    const start1 = Date.now();
    const tokens1 = await client.getSaucerSwapTokens();
    const time1 = Date.now() - start1;
    
    console.log(`✅ First call: ${time1}ms - Found ${tokens1.length} tokens`);
    
    console.log('Making second API call (cached)...');
    const start2 = Date.now();
    const tokens2 = await client.getSaucerSwapTokens();
    const time2 = Date.now() - start2;
    
    console.log(`✅ Second call: ${time2}ms - Found ${tokens2.length} tokens`);
    console.log(`📈 Speed improvement: ${Math.round((time1 / time2) * 100)}x faster with cache\n`);

    // Demo 2: Bulk Operations Optimization
    console.log('🔄 Demo 2: Bulk Operations Performance');
    console.log('Sequential vs. parallel API calls...');
    
    client.clearCache(); // Clear cache for fair comparison
    
    // Sequential calls
    const sequentialStart = Date.now();
    await client.getSaucerSwapStats();
    await client.getSaucerSwapPools();
    await client.getBonzoMarkets();
    const sequentialTime = Date.now() - sequentialStart;
    
    client.clearCache(); // Clear cache again
    
    // Parallel calls
    const parallelStart = Date.now();
    await Promise.all([
      client.getSaucerSwapStats(),
      client.getSaucerSwapPools(),
      client.getBonzoMarkets()
    ]);
    const parallelTime = Date.now() - parallelStart;
    
    console.log(`Sequential calls: ${sequentialTime}ms`);
    console.log(`Parallel calls: ${parallelTime}ms`);
    console.log(`⚡ Parallel is ${Math.round((sequentialTime / parallelTime) * 100)}% faster\n`);

    // Demo 3: Cross-Protocol Summary Optimization
    console.log('🔀 Demo 3: Cross-Protocol Analytics Optimization');
    
    // First call (all APIs hit)
    client.clearCache();
    const summaryStart1 = Date.now();
    const summary1 = await client.getCrossProtocolLiquiditySummary();
    const summaryTime1 = Date.now() - summaryStart1;
    
    // Second call (all cached)
    const summaryStart2 = Date.now();
    const summary2 = await client.getCrossProtocolLiquiditySummary();
    const summaryTime2 = Date.now() - summaryStart2;
    
    console.log(`First summary call: ${summaryTime1}ms`);
    console.log(`Cached summary call: ${summaryTime2}ms`);
    console.log(`Total DeFi TVL: $${summary1.totalLiquidityUsd.toLocaleString()}`);
    console.log(`🚀 ${Math.round((summaryTime1 / summaryTime2) * 100)}x faster with intelligent caching\n`);

    // Demo 4: API Call Tracking and Analysis
    console.log('📊 Demo 4: API Call Analysis');
    const stats = client.showCallStatistics();
    
    console.log(`Total unique methods: ${stats.uniqueMethods}`);
    console.log(`Total API calls: ${stats.totalCalls}`);
    
    if (stats.excessiveMethods.length > 0) {
      console.log(`⚠️ Methods with excessive calls: ${stats.excessiveMethods.join(', ')}`);
    } else {
      console.log('✅ No excessive API calls detected - good performance!');
    }
    
    // Demo 5: Cache Statistics
    console.log('\n💾 Demo 5: Cache Statistics');
    const cacheStats = client.getCacheStats();
    console.log(`Cache entries: ${cacheStats.size}`);
    console.log(`Cached endpoints: ${cacheStats.entries.join(', ')}`);

    console.log('\n✅ Performance demonstration completed!');
    console.log('\n💡 Key Performance Tips:');
    console.log('1. Use caching (enabled by default) for repeated calls');
    console.log('2. Make parallel requests when fetching independent data');
    console.log('3. Use cross-protocol methods for optimized multi-API calls');
    console.log('4. Monitor call statistics to identify bottlenecks');
    console.log('5. Adjust cache TTL based on your use case (60-300 seconds recommended)');

  } catch (error) {
    console.error('❌ Error in performance demo:', error.message);
  }
}

// Run the demo
if (require.main === module) {
  performanceDemo().catch(console.error);
}

module.exports = { performanceDemo };