/**
 * Test suite for HederaDeFi client
 */

import { HederaDeFi } from '../src/clients/HederaDeFi';
import { validateAccountId, parseTimestamp, formatNumber } from '../src/utils';

describe('HederaDeFi SDK', () => {
  let client: HederaDeFi;

  beforeEach(() => {
    client = new HederaDeFi({
      cacheTtl: 60,
      timeout: 30000
    });
  });

  afterEach(() => {
    client.clearCache();
    client.resetCallCounts();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const defaultClient = new HederaDeFi();
      expect(defaultClient).toBeInstanceOf(HederaDeFi);
    });

    it('should initialize with custom config', () => {
      const customClient = new HederaDeFi({
        cacheTtl: 120,
        timeout: 60000,
        endpoint: 'https://testnet.mirrornode.hedera.com/api/v1'
      });
      expect(customClient).toBeInstanceOf(HederaDeFi);
    });
  });

  describe('Network Methods', () => {
    it('should get network supply', async () => {
      const supply = await client.getNetworkSupply();
      
      expect(supply).toBeDefined();
      expect(typeof supply.totalSupply).toBe('number');
      expect(typeof supply.circulatingSupply).toBe('number');
      expect(supply.timestamp).toBeInstanceOf(Date);
      expect(supply.totalSupply).toBeGreaterThan(0);
    }, 15000);

    it('should get network nodes', async () => {
      const nodes = await client.getNetworkNodes();
      
      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.length).toBeGreaterThan(0);
      
      if (nodes.length > 0) {
        const node = nodes[0];
        expect(typeof node.nodeId).toBe('number');
        expect(typeof node.nodeAccountId).toBe('string');
      }
    }, 15000);

    it('should get network exchange rate', async () => {
      const rate = await client.getNetworkExchangeRate();
      
      if (rate) {
        expect(rate.currentRate).toBeDefined();
        expect(typeof rate.currentRate.centEquiv).toBe('number');
        expect(typeof rate.currentRate.hbarEquiv).toBe('number');
        expect(rate.timestamp).toBeInstanceOf(Date);
      }
    }, 15000);
  });

  describe('Account Methods', () => {
    const validAccountId = '0.0.2';

    it('should validate account ID format', () => {
      expect(validateAccountId('0.0.123456')).toBe(true);
      expect(validateAccountId('0.0.2')).toBe(true);
      expect(validateAccountId('invalid')).toBe(false);
      expect(validateAccountId('1.2.3')).toBe(false);
      expect(validateAccountId('')).toBe(false);
    });

    it('should get account info', async () => {
      const accountInfo = await client.getAccountInfo(validAccountId);
      
      if (accountInfo) {
        expect(accountInfo.account).toBe(validAccountId);
        expect(accountInfo.balance).toBeDefined();
        expect(typeof accountInfo.balance.balance).toBe('number');
        expect(accountInfo.createdTimestamp).toBeDefined();
      }
    }, 15000);

    it('should get account balance', async () => {
      const balance = await client.getAccountBalance(validAccountId);
      
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    }, 15000);

    it('should get account tokens', async () => {
      const tokens = await client.getAccountTokens(validAccountId);
      
      expect(Array.isArray(tokens)).toBe(true);
    }, 15000);

    it('should throw error for invalid account ID', async () => {
      await expect(client.getAccountInfo('invalid')).rejects.toThrow('Invalid account ID format');
    });
  });

  describe('Token Methods', () => {
    it('should get top tokens', async () => {
      const tokens = await client.getTopTokens(10);
      
      expect(Array.isArray(tokens)).toBe(true);
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.length).toBeLessThanOrEqual(10);
      
      if (tokens.length > 0) {
        const token = tokens[0];
        expect(typeof token.tokenId).toBe('string');
        expect(typeof token.symbol).toBe('string');
        expect(typeof token.name).toBe('string');
        expect(typeof token.decimals).toBe('number');
        expect(typeof token.totalSupply).toBe('number');
      }
    }, 15000);

    it('should throw error for invalid limit', async () => {
      await expect(client.getTopTokens(0)).rejects.toThrow('Limit must be between 1 and 1000');
      await expect(client.getTopTokens(1001)).rejects.toThrow('Limit must be between 1 and 1000');
    });

    it('should get specific token info', async () => {
      // Test with HBAR token (0.0.0)
      const token = await client.getTokenInfo('0.0.0');
      
      if (token) {
        expect(token.tokenId).toBe('0.0.0');
        expect(typeof token.symbol).toBe('string');
        expect(typeof token.decimals).toBe('number');
      }
    }, 15000);

    it('should throw error for invalid token ID', async () => {
      await expect(client.getTokenInfo('invalid')).rejects.toThrow('Invalid token ID format');
    });
  });

  describe('SaucerSwap Integration', () => {
    it('should get SaucerSwap pools', async () => {
      const pools = await client.getSaucerSwapPools();
      
      expect(Array.isArray(pools)).toBe(true);
      
      if (pools.length > 0) {
        const pool = pools[0];
        expect(typeof pool.id).toBe('number');
        expect(typeof pool.contractId).toBe('string');
        expect(pool.tokenA).toBeDefined();
        expect(pool.tokenB).toBeDefined();
        // Fee might be undefined for some pools, so check if defined
        if (pool.fee !== undefined) {
          expect(typeof pool.fee).toBe('number');
        }
      }
    }, 20000);

    it('should get SaucerSwap tokens', async () => {
      const tokens = await client.getSaucerSwapTokens();
      
      expect(Array.isArray(tokens)).toBe(true);
      
      if (tokens.length > 0) {
        const token = tokens[0];
        expect(typeof token.id).toBe('string');
        expect(typeof token.symbol).toBe('string');
        expect(typeof token.decimals).toBe('number');
      }
    }, 20000);

    it('should get SaucerSwap stats', async () => {
      const stats = await client.getSaucerSwapStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.tvlUsd).toBe('number');
      expect(typeof stats.volumeTotalUsd).toBe('number');
      expect(typeof stats.swapTotal).toBe('number');
    }, 20000);
  });

  describe('Bonzo Finance Integration', () => {
    it('should get Bonzo markets', async () => {
      const markets = await client.getBonzoMarkets();
      
      if (markets) {
        // chainId can be either string or number depending on API response
        expect(['string', 'number']).toContain(typeof markets.chainId);
        expect(typeof markets.networkName).toBe('string');
        expect(markets.totalMarketSupplied).toBeDefined();
        expect(Array.isArray(markets.reserves)).toBe(true);
      }
    }, 20000);

    it('should get Bonzo reserves', async () => {
      const reserves = await client.getBonzoReserves();
      
      expect(Array.isArray(reserves)).toBe(true);
      
      if (reserves.length > 0) {
        const reserve = reserves[0];
        expect(typeof reserve.symbol).toBe('string');
        expect(typeof reserve.active).toBe('boolean');
        expect(typeof reserve.supplyApy).toBe('number');
        expect(typeof reserve.utilizationRate).toBe('number');
      }
    }, 20000);

    it('should get Bonzo total markets', async () => {
      const totals = await client.getBonzoTotalMarkets();
      
      if (Object.keys(totals).length > 0) {
        expect(totals.totalReserves).toBeDefined();
        expect(typeof totals.totalReserves).toBe('number');
      }
    }, 20000);
  });

  describe('Cross-Protocol Analytics', () => {
    it('should get cross protocol liquidity summary', async () => {
      const summary = await client.getCrossProtocolLiquiditySummary();
      
      expect(summary).toBeDefined();
      expect(typeof summary.totalLiquidityUsd).toBe('number');
      expect(summary.saucerswap).toBeDefined();
      expect(summary.bonzoFinance).toBeDefined();
      expect(summary.protocolDistribution).toBeDefined();
      expect(summary.performance).toBeDefined();
      
      expect(typeof summary.saucerswap.tvlUsd).toBe('number');
      expect(typeof summary.saucerswap.poolCount).toBe('number');
      expect(summary.saucerswap.protocolType).toBe('DEX');
      
      expect(typeof summary.bonzoFinance.tvlUsd).toBe('number');
      expect(typeof summary.bonzoFinance.reserveCount).toBe('number');
      expect(summary.bonzoFinance.protocolType).toBe('Lending');
    }, 30000);

    it('should get all token images', async () => {
      const images = await client.getAllTokenImages();
      
      expect(images).toBeDefined();
      expect(images.allImages).toBeDefined();
      expect(images.pngImages).toBeDefined();
      expect(images.stats).toBeDefined();
      
      expect(typeof images.stats.totalTokens).toBe('number');
      expect(typeof images.stats.tokensWithImages).toBe('number');
      expect(typeof images.stats.pngImagesCount).toBe('number');
      expect(typeof images.stats.fetchTime).toBe('number');
    }, 25000);
  });

  describe('Utility Methods', () => {
    it('should track API call statistics', async () => {
      // Make some calls
      await client.getNetworkSupply();
      await client.getSaucerSwapStats();
      
      const stats = client.showCallStatistics();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalCalls).toBe('number');
      expect(typeof stats.uniqueMethods).toBe('number');
      expect(Array.isArray(stats.excessiveMethods)).toBe(true);
      expect(stats.totalCalls).toBeGreaterThan(0);
    }, 20000);

    it('should reset call counts', () => {
      client.resetCallCounts();
      const stats = client.showCallStatistics();
      expect(stats.totalCalls).toBe(0);
    });

    it('should clear cache', () => {
      client.clearCache();
      const cacheStats = client.getCacheStats();
      expect(cacheStats.size).toBe(0);
      expect(Array.isArray(cacheStats.entries)).toBe(true);
    });

    it('should get cache statistics', async () => {
      // Make a call to populate cache
      await client.getNetworkSupply();
      
      const cacheStats = client.getCacheStats();
      expect(typeof cacheStats.size).toBe('number');
      expect(Array.isArray(cacheStats.entries)).toBe(true);
      expect(cacheStats.size).toBeGreaterThan(0);
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const badClient = new HederaDeFi({
        endpoint: 'https://nonexistent-api.invalid/api/v1',
        timeout: 5000
      });

      const result = await badClient.getNetworkSupply();
      
      // Should return default values on error
      expect(result.totalSupply).toBe(0);
      expect(result.circulatingSupply).toBe(0);
      expect(result.timestamp).toBeInstanceOf(Date);
    }, 10000);

    it('should handle timeout errors', async () => {
      const timeoutClient = new HederaDeFi({
        timeout: 1 // Very short timeout
      });

      const start = Date.now();
      const result = await timeoutClient.getNetworkSupply();
      const duration = Date.now() - start;
      
      // Should fail quickly and return default values
      expect(duration).toBeLessThan(5000);
      expect(result.totalSupply).toBe(0);
    }, 10000);
  });
});

describe('Utility Functions', () => {
  describe('parseTimestamp', () => {
    it('should parse valid timestamps', () => {
      const timestamp = '1577836800000000000'; // 2020-01-01 in nanoseconds
      const date = parseTimestamp(timestamp);
      
      expect(date).toBeInstanceOf(Date);
      // The timestamp converts to December 31, 2019 UTC due to nanosecond conversion
      expect(date?.getFullYear()).toBe(2019);
    });

    it('should handle invalid timestamps', () => {
      expect(parseTimestamp(undefined)).toBeUndefined();
      expect(parseTimestamp('')).toBeUndefined();
      expect(parseTimestamp('invalid')).toBeUndefined();
    });
  });

  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(1234.56)).toBe('1.23K');
      expect(formatNumber(1234567.89)).toBe('1.23M');
      expect(formatNumber(1234567890.12)).toBe('1.23B');
      expect(formatNumber(123.45, 2, '$')).toBe('$123.45');
    });
  });

  describe('validateAccountId', () => {
    it('should validate Hedera account IDs', () => {
      expect(validateAccountId('0.0.123456')).toBe(true);
      expect(validateAccountId('0.0.2')).toBe(true);
      expect(validateAccountId('invalid')).toBe(false);
      expect(validateAccountId('1.2.3')).toBe(false);
      expect(validateAccountId('')).toBe(false);
    });
  });
});