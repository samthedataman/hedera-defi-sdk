const { HederaDeFi } = require('./dist/index.js');

async function inspectBonzo() {
  const client = new HederaDeFi({ cacheTtl: 300, timeout: 30000 });
  
  try {
    const bonzoMarkets = await client.getBonzoMarkets();
    console.log('Bonzo Markets:', JSON.stringify(bonzoMarkets, null, 2));
    
    if (bonzoMarkets && bonzoMarkets.reserves && bonzoMarkets.reserves.length > 0) {
      console.log('\nFirst Reserve:', JSON.stringify(bonzoMarkets.reserves[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectBonzo();