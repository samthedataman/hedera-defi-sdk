/**
 * Comprehensive Data Validation Test
 * Tests all methods to ensure correct data types and return values
 */

const { HederaDeFi } = require('./dist/index.js');
const { validateAccountId, parseTimestamp, formatNumber } = require('./dist/utils/index.js');

async function validateDataTypes() {
  console.log('🔍 Starting Comprehensive Data Validation Tests\n');
  
  const client = new HederaDeFi({
    cacheTtl: 300,
    timeout: 30000
  });

  const testResults = {
    passed: 0,
    failed: 0,
    errors: []
  };

  // Helper function to validate data structure
  function validateData(testName, data, expectedStructure, required = true) {
    try {
      if (!required && !data) {
        console.log(`⚠️  ${testName}: Optional data is null/undefined (acceptable)`);
        return true;
      }

      if (!data) {
        throw new Error('Data is null or undefined');
      }

      for (const [key, expectedType] of Object.entries(expectedStructure)) {
        const actualValue = data[key];
        
        if (expectedType.startsWith('optional:')) {
          const type = expectedType.replace('optional:', '');
          if (actualValue !== undefined && actualValue !== null) {
            if (type === 'array' && !Array.isArray(actualValue)) {
              throw new Error(`Expected ${key} to be array or undefined, got ${typeof actualValue}`);
            } else if (type !== 'array' && typeof actualValue !== type) {
              throw new Error(`Expected ${key} to be ${type} or undefined, got ${typeof actualValue}`);
            }
          }
        } else {
          if (actualValue === undefined || actualValue === null) {
            throw new Error(`Required field ${key} is missing`);
          }
          
          if (expectedType === 'array' && !Array.isArray(actualValue)) {
            throw new Error(`Expected ${key} to be array, got ${typeof actualValue}`);
          } else if (expectedType === 'date' && !(actualValue instanceof Date)) {
            throw new Error(`Expected ${key} to be Date, got ${typeof actualValue}`);
          } else if (expectedType !== 'array' && expectedType !== 'date' && typeof actualValue !== expectedType) {
            throw new Error(`Expected ${key} to be ${expectedType}, got ${typeof actualValue}`);
          }
        }
      }
      
      console.log(`✅ ${testName}: Data structure validation passed`);
      testResults.passed++;
      return true;
    } catch (error) {
      console.log(`❌ ${testName}: ${error.message}`);
      testResults.failed++;
      testResults.errors.push(`${testName}: ${error.message}`);
      return false;
    }
  }

  try {
    // Test 1: Network Supply
    console.log('📊 Testing getNetworkSupply() data structure...');
    const supply = await client.getNetworkSupply();
    validateData('Network Supply', supply, {
      totalSupply: 'number',
      circulatingSupply: 'number',
      timestamp: 'date'
    });

    // Test 2: Network Nodes
    console.log('🔗 Testing getNetworkNodes() data structure...');
    const nodes = await client.getNetworkNodes();
    validateData('Network Nodes Array', nodes, {
      length: 'number'
    });
    
    if (nodes.length > 0) {
      validateData('Network Node Item', nodes[0], {
        nodeId: 'number',
        nodeAccountId: 'string',
        description: 'string',
        stake: 'number',
        stakeNotRewarded: 'optional:number',
        stakeRewarded: 'optional:number'
      });
    }

    // Test 3: Account Info
    console.log('👤 Testing getAccountInfo() data structure...');
    const accountInfo = await client.getAccountInfo('0.0.2');
    validateData('Account Info', accountInfo, {
      account: 'string',
      balance: 'object',
      auto_renew_period: 'optional:number',
      key: 'optional:object',
      receiver_sig_required: 'optional:boolean'
    });

    if (accountInfo && accountInfo.balance) {
      validateData('Account Balance', accountInfo.balance, {
        balance: 'number',
        timestamp: 'string'
      });
    }

    // Test 4: Top Tokens
    console.log('🪙 Testing getTopTokens() data structure...');
    const tokens = await client.getTopTokens(3);
    validateData('Top Tokens Array', tokens, {
      length: 'number'
    });
    
    if (tokens.length > 0) {
      validateData('Token Item', tokens[0], {
        tokenId: 'string',
        symbol: 'string',
        name: 'string',
        price: 'number',
        decimals: 'optional:number',
        totalSupply: 'optional:number',
        tvl: 'optional:number',
        volume24h: 'optional:number',
        holders: 'optional:number'
      });
    }

    // Test 5: SaucerSwap Stats
    console.log('🌐 Testing getSaucerSwapStats() data structure...');
    const saucerStats = await client.getSaucerSwapStats();
    validateData('SaucerSwap Stats', saucerStats, {
      tvlUsd: 'number',
      volumeTotalUsd: 'number',
      swapTotal: 'number',
      tvl: 'optional:string',
      volumeTotal: 'optional:string',
      circulatingSauce: 'optional:string'
    });

    // Test 6: SaucerSwap Pools
    console.log('🏊 Testing getSaucerSwapPools() data structure...');
    const pools = await client.getSaucerSwapPools();
    validateData('SaucerSwap Pools Array', pools, {
      length: 'number'
    });
    
    if (pools.length > 0) {
      validateData('Pool Item', pools[0], {
        id: 'number',
        contractId: 'string',
        tokenA: 'object',
        tokenB: 'object',
        lpToken: 'optional:object',
        lpTokenReserve: 'optional:string',
        tokenReserveA: 'optional:string',
        tokenReserveB: 'optional:string',
        inTopPools: 'optional:boolean'
      });
    }

    // Test 7: SaucerSwap Tokens
    console.log('💰 Testing getSaucerSwapTokens() data structure...');
    const saucerTokens = await client.getSaucerSwapTokens();
    validateData('SaucerSwap Tokens Array', saucerTokens, {
      length: 'number'
    });

    if (saucerTokens.length > 0) {
      validateData('SaucerSwap Token Item', saucerTokens[0], {
        id: 'string',
        symbol: 'string',
        name: 'string',
        price: 'string',
        priceUsd: 'number',
        decimals: 'number',
        icon: 'optional:string',
        dueDiligenceComplete: 'optional:boolean',
        isFeeOnTransferToken: 'optional:boolean',
        createdAt: 'optional:string',
        inTopPools: 'optional:boolean',
        inV2Pools: 'optional:boolean'
      });
    }

    // Test 8: Bonzo Markets
    console.log('🏦 Testing getBonzoMarkets() data structure...');
    const bonzoMarkets = await client.getBonzoMarkets();
    if (bonzoMarkets) {
      validateData('Bonzo Markets', bonzoMarkets, {
        networkName: 'string',
        reserves: 'array',
        totalMarketSupplied: 'object',
        totalMarketBorrowed: 'object'
      });

      if (bonzoMarkets.reserves && bonzoMarkets.reserves.length > 0) {
        validateData('Bonzo Reserve Item', bonzoMarkets.reserves[0], {
          symbol: 'string',
          name: 'string',
          active: 'boolean',
          supplyApy: 'number',
          variableBorrowApy: 'number',
          stableBorrowApy: 'number',
          utilizationRate: 'number',
          availableLiquidity: 'object',
          totalBorrowableLiquidity: 'object',
          ltv: 'number',
          liquidationThreshold: 'number',
          liquidationBonus: 'number',
          variableBorrowingEnabled: 'boolean'
        });
      }
    }

    // Test 9: Cross-Protocol Summary
    console.log('🔄 Testing getCrossProtocolLiquiditySummary() data structure...');
    const summary = await client.getCrossProtocolLiquiditySummary();
    validateData('Cross Protocol Summary', summary, {
      totalLiquidityUsd: 'number',
      saucerswap: 'object',
      bonzoFinance: 'object'
    });

    validateData('SaucerSwap Summary', summary.saucerswap, {
      tvlUsd: 'number',
      poolCount: 'number',
      activePools: 'optional:number',
      protocolType: 'string'
    });

    validateData('Bonzo Summary', summary.bonzoFinance, {
      tvlUsd: 'number',
      reserveCount: 'number'
    });

    // Test 10: Token Images
    console.log('🖼️ Testing getAllTokenImages() data structure...');
    const images = await client.getAllTokenImages();
    validateData('Token Images', images, {
      stats: 'object',
      tokensWithImages: 'optional:array'
    });

    validateData('Token Images Stats', images.stats, {
      totalTokens: 'number',
      tokensWithImages: 'number',
      pngImagesCount: 'number'
    });

    // Test 11: Utility Functions
    console.log('🔧 Testing utility functions...');
    
    // Test validateAccountId
    const validAccount = validateAccountId('0.0.123456');
    const invalidAccount = validateAccountId('invalid-account');
    
    if (typeof validAccount === 'boolean' && validAccount === true) {
      console.log('✅ validateAccountId: Returns boolean true for valid account');
      testResults.passed++;
    } else {
      console.log('❌ validateAccountId: Should return true for valid account');
      testResults.failed++;
    }

    if (typeof invalidAccount === 'boolean' && invalidAccount === false) {
      console.log('✅ validateAccountId: Returns boolean false for invalid account');
      testResults.passed++;
    } else {
      console.log('❌ validateAccountId: Should return false for invalid account');
      testResults.failed++;
    }

    // Test formatNumber
    const formattedNumber = formatNumber(1234567.89, 2, '$');
    if (typeof formattedNumber === 'string' && formattedNumber.includes('$')) {
      console.log('✅ formatNumber: Returns formatted string with currency');
      testResults.passed++;
    } else {
      console.log('❌ formatNumber: Should return formatted string with currency');
      testResults.failed++;
    }

    // Test 12: API Statistics
    console.log('📈 Testing showCallStatistics() data structure...');
    const stats = client.showCallStatistics();
    validateData('API Statistics', stats, {
      totalCalls: 'number',
      uniqueMethods: 'number',
      callCounts: 'object',
      excessiveMethods: 'array'
    });

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
    testResults.failed++;
    testResults.errors.push(`General error: ${error.message}`);
  }

  // Final Results
  console.log('\n📋 Comprehensive Data Validation Results:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n🚨 Error Details:');
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log('\n🎉 All data validation tests passed! The Node package returns correct data types.');
    return true;
  } else {
    console.log('\n⚠️  Some data validation tests failed. Please review the errors above.');
    return false;
  }
}

// Run the comprehensive validation
validateDataTypes().catch(console.error);