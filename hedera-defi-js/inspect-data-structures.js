/**
 * Inspect actual data structures returned by the API
 */

const { HederaDeFi } = require('./dist/index.js');

async function inspectDataStructures() {
  console.log('🔍 Inspecting actual data structures...\n');
  
  const client = new HederaDeFi({
    cacheTtl: 300,
    timeout: 30000
  });

  try {
    // Network Nodes structure
    console.log('🔗 Network Nodes structure:');
    const nodes = await client.getNetworkNodes();
    console.log('Sample node:', JSON.stringify(nodes[0], null, 2));
    console.log('\n---\n');

    // Top Tokens structure  
    console.log('🪙 Top Tokens structure:');
    const tokens = await client.getTopTokens(1);
    console.log('Sample token:', JSON.stringify(tokens[0], null, 2));
    console.log('\n---\n');

    // SaucerSwap Stats structure
    console.log('🌐 SaucerSwap Stats structure:');
    const saucerStats = await client.getSaucerSwapStats();
    console.log('SaucerSwap stats:', JSON.stringify(saucerStats, null, 2));
    console.log('\n---\n');

    // SaucerSwap Pools structure
    console.log('🏊 SaucerSwap Pools structure:');
    const pools = await client.getSaucerSwapPools();
    console.log('Sample pool:', JSON.stringify(pools[0], null, 2));
    console.log('\n---\n');

    // SaucerSwap Tokens structure
    console.log('💰 SaucerSwap Tokens structure:');
    const saucerTokens = await client.getSaucerSwapTokens();
    console.log('Sample saucer token:', JSON.stringify(saucerTokens[0], null, 2));
    console.log('\n---\n');

    // Cross-protocol summary structure
    console.log('🔄 Cross-protocol summary structure:');
    const summary = await client.getCrossProtocolLiquiditySummary();
    console.log('Summary:', JSON.stringify(summary, null, 2));
    console.log('\n---\n');

    // Token Images structure
    console.log('🖼️ Token Images structure:');
    const images = await client.getAllTokenImages();
    console.log('Images object:', JSON.stringify({
      stats: images.stats,
      sampleTokenWithImage: images.tokensWithImages && images.tokensWithImages.length > 0 ? images.tokensWithImages[0] : 'No tokens with images'
    }, null, 2));
    console.log('\n---\n');

    // API Statistics structure
    console.log('📈 API Statistics structure:');
    const stats = client.showCallStatistics();
    console.log('API stats:', JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('❌ Error inspecting data structures:', error.message);
  }
}

inspectDataStructures().catch(console.error);