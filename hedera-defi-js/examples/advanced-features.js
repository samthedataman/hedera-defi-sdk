/**
 * Advanced features and use cases for Hedera DeFi SDK
 * Demonstrates complex analytics and real-world scenarios
 */

const { HederaDeFi, validateAccountId, formatNumber } = require('../dist/index.js');

async function advancedFeaturesDemo() {
  console.log('🚀 Hedera DeFi SDK - Advanced Features Demo\n');
  
  const client = new HederaDeFi({
    cacheTtl: 180,
    timeout: 60000 // Longer timeout for complex operations
  });

  try {
    // Feature 1: DeFi Portfolio Analysis
    console.log('💼 Feature 1: DeFi Portfolio Analysis');
    const summary = await client.getCrossProtocolLiquiditySummary();
    
    const protocolBreakdown = [
      { name: 'SaucerSwap (DEX)', tvl: summary.saucerswap.tvlUsd },
      { name: 'Bonzo Finance (Lending)', tvl: summary.bonzoFinance.tvlUsd }
    ];
    
    console.log('Hedera DeFi Ecosystem Overview:');
    console.log(`📊 Total Value Locked: $${summary.totalLiquidityUsd.toLocaleString()}`);
    console.log('\nProtocol Distribution:');
    protocolBreakdown.forEach(protocol => {
      const percentage = (protocol.tvl / summary.totalLiquidityUsd) * 100;
      console.log(`  • ${protocol.name}: ${formatNumber(protocol.tvl, 2, '$')} (${percentage.toFixed(1)}%)`);
    });
    console.log();

    // Feature 2: Token Analysis with Price Data
    console.log('📈 Feature 2: Advanced Token Analysis');
    const saucerTokens = await client.getSaucerSwapTokens();
    
    // Filter tokens with significant volume and price data
    const significantTokens = saucerTokens
      .filter(token => token.price > 0 && token.volume24h > 1000)
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 10);
    
    console.log('Top 10 tokens by market cap:');
    significantTokens.forEach((token, i) => {
      const priceChange = token.priceChange24h || 0;
      const changeColor = priceChange >= 0 ? '📈' : '📉';
      console.log(`${i+1}. ${token.symbol} - $${token.price.toFixed(6)} ${changeColor} ${priceChange.toFixed(2)}% (24h)`);
    });
    console.log();

    // Feature 3: Liquidity Pool Analysis
    console.log('🏊 Feature 3: Liquidity Pool Analysis');
    const pools = await client.getSaucerSwapPools();
    
    // Find highest TVL pools
    const topPools = pools
      .filter(pool => pool.tvlUsd > 10000)
      .sort((a, b) => b.tvlUsd - a.tvlUsd)
      .slice(0, 5);
    
    console.log('Top 5 liquidity pools by TVL:');
    topPools.forEach((pool, i) => {
      const apr = pool.apr || 0;
      console.log(`${i+1}. ${pool.tokenASymbol}/${pool.tokenBSymbol} - TVL: ${formatNumber(pool.tvlUsd, 2, '$')} | APR: ${apr.toFixed(2)}%`);
    });
    console.log();

    // Feature 4: Lending Market Analysis
    console.log('🏦 Feature 4: Lending Market Analysis');
    const bonzoMarkets = await client.getBonzoMarkets();
    
    if (bonzoMarkets && bonzoMarkets.reserves) {
      // Find best lending opportunities
      const activeReserves = bonzoMarkets.reserves
        .filter(reserve => reserve.active && reserve.supplyApy > 0)
        .sort((a, b) => b.supplyApy - a.supplyApy);
      
      console.log('Best lending opportunities (Supply APY):');
      activeReserves.slice(0, 5).forEach((reserve, i) => {
        const utilization = ((reserve.totalDebt / reserve.totalLiquidity) * 100) || 0;
        console.log(`${i+1}. ${reserve.symbol} - ${reserve.supplyApy.toFixed(2)}% APY | Utilization: ${utilization.toFixed(1)}%`);
      });
      
      console.log('\nBest borrowing opportunities (Variable Borrow APY):');
      const borrowOpportunities = activeReserves
        .filter(reserve => reserve.variableBorrowApy > 0)
        .sort((a, b) => a.variableBorrowApy - b.variableBorrowApy); // Lower is better for borrowing
      
      borrowOpportunities.slice(0, 5).forEach((reserve, i) => {
        console.log(`${i+1}. ${reserve.symbol} - ${reserve.variableBorrowApy.toFixed(2)}% APY (borrow)`);
      });
    } else {
      console.log('Bonzo Finance data unavailable');
    }
    console.log();

    // Feature 5: Account Analysis Utility
    console.log('🔍 Feature 5: Account Validation & Analysis');
    const testAccounts = ['0.0.2', '0.0.98', 'invalid-account', '1.2.3'];
    
    console.log('Testing account ID validation:');
    for (const accountId of testAccounts) {
      const isValid = validateAccountId(accountId);
      const status = isValid ? '✅ Valid' : '❌ Invalid';
      console.log(`  ${accountId}: ${status}`);
      
      if (isValid) {
        try {
          const accountInfo = await client.getAccountInfo(accountId);
          if (accountInfo) {
            const balance = accountInfo.balance.balance / 100_000_000;
            console.log(`    Balance: ${balance.toFixed(8)} HBAR`);
          }
        } catch (error) {
          console.log('    Balance: Unable to fetch');
        }
      }
    }
    console.log();

    // Feature 6: Yield Opportunities Summary
    console.log('🌾 Feature 6: Yield Opportunities Summary');
    const yieldOpportunities = [];
    
    // Add SaucerSwap pool yields
    const highYieldPools = topPools.filter(pool => pool.apr > 5);
    highYieldPools.forEach(pool => {
      yieldOpportunities.push({
        protocol: 'SaucerSwap',
        type: 'Liquidity Pool',
        asset: `${pool.tokenASymbol}/${pool.tokenBSymbol}`,
        apy: pool.apr,
        tvl: pool.tvlUsd
      });
    });
    
    // Add Bonzo lending yields
    if (bonzoMarkets && bonzoMarkets.reserves) {
      const highYieldLending = bonzoMarkets.reserves
        .filter(reserve => reserve.active && reserve.supplyApy > 5)
        .slice(0, 3);
      
      highYieldLending.forEach(reserve => {
        yieldOpportunities.push({
          protocol: 'Bonzo Finance',
          type: 'Lending',
          asset: reserve.symbol,
          apy: reserve.supplyApy,
          tvl: reserve.totalLiquidity * (reserve.price || 1)
        });
      });
    }
    
    // Sort by APY
    yieldOpportunities.sort((a, b) => b.apy - a.apy);
    
    console.log('Top yield opportunities across Hedera DeFi:');
    yieldOpportunities.slice(0, 8).forEach((opportunity, i) => {
      console.log(`${i+1}. ${opportunity.protocol} ${opportunity.type} - ${opportunity.asset}`);
      console.log(`   APY: ${opportunity.apy.toFixed(2)}% | TVL: ${formatNumber(opportunity.tvl, 2, '$')}`);
    });
    
    console.log('\n✅ Advanced features demonstration completed!');
    
    // Final performance summary
    console.log('\n📊 Session Performance Summary:');
    const finalStats = client.showCallStatistics();
    console.log(`API calls made: ${finalStats.totalCalls}`);
    console.log(`Unique methods: ${finalStats.uniqueMethods}`);
    console.log('SDK is optimized for production use! 🚀');

  } catch (error) {
    console.error('❌ Error in advanced features demo:', error.message);
  }
}

// Run the demo
if (require.main === module) {
  advancedFeaturesDemo().catch(console.error);
}

module.exports = { advancedFeaturesDemo };