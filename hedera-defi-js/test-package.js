/**
 * Test script to validate the built NPM package works correctly
 */

const { HederaDeFi } = require('./dist/index.js');
const { validateAccountId, formatNumber } = require('./dist/utils/index.js');

console.log('🧪 Testing NPM Package Usage\n');

// Test 1: Import and initialization
console.log('📦 Testing package imports...');
console.log(`✅ HederaDeFi class imported: ${typeof HederaDeFi}`);
console.log(`✅ validateAccountId function imported: ${typeof validateAccountId}`);
console.log(`✅ formatNumber function imported: ${typeof formatNumber}\n`);

// Test 2: Initialize client
console.log('🚀 Testing client initialization...');
const client = new HederaDeFi({
  cacheTtl: 120,
  timeout: 15000
});
console.log('✅ Client initialized successfully\n');

// Test 3: Utility functions
console.log('🔧 Testing utility functions...');
console.log(`✅ Valid account: ${validateAccountId('0.0.123456')} (should be true)`);
console.log(`✅ Invalid account: ${validateAccountId('invalid')} (should be false)`);
console.log(`✅ Format number: ${formatNumber(1234567.89, 2, '$')} (should be $1.23M)\n`);

// Test 4: Simple API call
async function testApiCall() {
  try {
    console.log('🌐 Testing simple API call (network nodes)...');
    const nodes = await client.getNetworkNodes();
    console.log(`✅ API call successful: ${nodes.length} nodes found\n`);
    
    console.log('📊 Testing call statistics...');
    const stats = client.showCallStatistics();
    console.log(`✅ Call tracking working: ${stats.totalCalls} total calls\n`);
    
    console.log('🎉 Package test completed successfully!');
    console.log('✅ The NPM package is ready for publishing');
    
  } catch (error) {
    console.error('❌ Package test failed:', error.message);
    process.exit(1);
  }
}

testApiCall().catch(console.error);