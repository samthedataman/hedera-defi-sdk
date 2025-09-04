/**
 * Main client for Hedera DeFi data access using Mirror Node REST API
 * Comprehensive SDK with 40+ methods for Hedera developers
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  HederaDeFiConfig,
  ApiResponse,
  CacheEntry,
  CallStatistics,
  Token,
  Pool,
  Protocol,
  WhaleAlert,
  RiskMetrics,
  NetworkSupply,
  NetworkNode,
  NetworkExchangeRate,
  AccountInfo,
  SaucerSwapToken,
  SaucerSwapPool,
  SaucerSwapStats,
  BonzoMarketData,
  BonzoReserve
} from '../types';
import {
  parseTimestamp,
  validateAccountId,
  formatHbar,
  parseUsdValue,
  retryWithBackoff
} from '../utils';

export class HederaDeFi {
  // Known DeFi protocols on Hedera
  private static readonly DEFI_PROTOCOLS = {
    SaucerSwap: {
      router: '0.0.1082166',
      factory: '0.0.1082165',
      type: 'dex',
      name: 'SaucerSwap'
    },
    HeliSwap: {
      router: '0.0.1237181',
      factory: '0.0.223960',
      type: 'dex',
      name: 'HeliSwap'
    },
    Pangolin: {
      router: '0.0.1242116',
      factory: '0.0.798819',
      type: 'dex',
      name: 'Pangolin'
    },
    Stader: {
      staking: '0.0.3902492',
      type: 'staking',
      name: 'Stader'
    },
    HSuite: {
      router: '0.0.2830828',
      type: 'dex',
      name: 'HSuite'
    }
  };

  private readonly endpoint: string;
  private readonly bonzoApi: string;
  private readonly saucerswapApi: string;
  private readonly cacheTtl: number;
  private readonly timeout: number;
  private readonly cache: Map<string, CacheEntry> = new Map();
  private readonly callCounts: Record<string, number> = {};
  private readonly httpClient: AxiosInstance;

  constructor(config: HederaDeFiConfig = {}) {
    this.endpoint = config.endpoint || 'https://mainnet-public.mirrornode.hedera.com/api/v1';
    this.bonzoApi = config.bonzoApi || 'https://mainnet-data.bonzo.finance';
    this.saucerswapApi = config.saucerswapApi || 'https://server.saucerswap.finance/api/public';
    this.cacheTtl = config.cacheTtl || 60; // 60 seconds
    this.timeout = config.timeout || 30000; // 30 seconds

    // Create HTTP client with default configurations
    this.httpClient = axios.create({
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // ========== CORE REQUEST METHODS ==========

  /**
   * Execute REST API request with caching and robust error handling
   */
  private async request(path: string, params?: Record<string, any>): Promise<ApiResponse> {
    if (!path) {
      throw new Error('Path cannot be empty');
    }

    const cacheKey = `${path}:${JSON.stringify(params || {})}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTtl * 1000) {
        return cached.data;
      }
    }

    try {
      const url = `${this.endpoint}/${path}`;
      const response: AxiosResponse = await this.httpClient.get(url, { params });

      if (response.status === 200 && response.data) {
        // Cache result
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
        return response.data;
      } else {
        console.warn(`Warning: API returned status ${response.status} for ${url}`);
        return {};
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          console.warn(`Warning: Rate limited by Mirror Node API`);
        } else if (error.code === 'ECONNABORTED') {
          console.warn(`Warning: Request timeout for ${path}`);
        } else if (error.response?.status) {
          console.warn(`Warning: API error ${error.response.status} for ${path}`);
        } else {
          console.warn(`Warning: Connection error for ${path}`);
        }
      } else {
        console.warn(`Warning: Request failed for ${path}: ${error.message}`);
      }
      return {};
    }
  }

  /**
   * Execute SaucerSwap API request with CORS headers
   */
  private async saucerswapRequest(path: string): Promise<ApiResponse> {
    const cacheKey = `saucer:${path}`;
    const requestStart = Date.now();

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTtl * 1000) {
        console.log(`   💾 SaucerSwap cache hit for ${path} (${Date.now() - requestStart}ms)`);
        return cached.data;
      }
    }

    try {
      const url = `${this.saucerswapApi}/${path}`;
      console.log(`   🌐 SaucerSwap API call: ${path}`);

      const headers = {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.saucerswap.finance',
        'Referer': 'https://www.saucerswap.finance/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site'
      };

      const networkStart = Date.now();
      const response = await this.httpClient.get(url, { headers });
      const networkTime = Date.now() - networkStart;

      if (response.status === 200 && response.data) {
        // Cache result
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });

        const totalTime = Date.now() - requestStart;
        console.log(`   ✅ SaucerSwap ${path} completed in ${totalTime}ms (network: ${networkTime}ms)`);
        return response.data;
      } else {
        console.warn(`Warning: SaucerSwap API error ${response.status} for ${url}`);
        return response.data || {};
      }
    } catch (error: any) {
      const totalTime = Date.now() - requestStart;
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.warn(`Warning: SaucerSwap API timeout for ${path} after ${totalTime}ms`);
        } else if (error.response?.status) {
          console.warn(`Warning: SaucerSwap API error ${error.response.status} for ${path}`);
        } else {
          console.warn(`Warning: SaucerSwap API connection error for ${path}`);
        }
      } else {
        console.warn(`Warning: SaucerSwap API request failed for ${path}: ${error.message}`);
      }
      return {};
    }
  }

  /**
   * Execute Bonzo Finance API request with CORS headers
   */
  private async bonzoRequest(path: string): Promise<ApiResponse> {
    const cacheKey = `bonzo:${path}`;
    const requestStart = Date.now();

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTtl * 1000) {
        console.log(`   💾 Bonzo cache hit for ${path} (${Date.now() - requestStart}ms)`);
        return cached.data;
      }
    }

    try {
      const url = `${this.bonzoApi}/${path}`;
      console.log(`   🏦 Bonzo API call: ${path}`);

      const headers = {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://app.bonzo.finance',
        'Referer': 'https://app.bonzo.finance/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site'
      };

      const networkStart = Date.now();
      const response = await this.httpClient.get(url, { headers });
      const networkTime = Date.now() - networkStart;

      if (response.status === 200 && response.data) {
        // Cache result
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });

        const totalTime = Date.now() - requestStart;
        console.log(`   ✅ Bonzo ${path} completed in ${totalTime}ms (network: ${networkTime}ms)`);
        return response.data;
      } else {
        console.warn(`Warning: Bonzo API error ${response.status} for ${url} after ${Date.now() - requestStart}ms`);
        return response.data || {};
      }
    } catch (error: any) {
      const totalTime = Date.now() - requestStart;
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.warn(`Warning: Bonzo API timeout for ${path} after ${totalTime}ms`);
        } else if (error.response?.status) {
          console.warn(`Warning: Bonzo API error ${error.response.status} for ${path}`);
        } else {
          console.warn(`Warning: Bonzo API connection error for ${path}`);
        }
      } else {
        console.warn(`Warning: Bonzo API request failed for ${path}: ${error.message}`);
      }
      return {};
    }
  }

  // ========== NETWORK METHODS ==========

  /**
   * Get total network supply information
   */
  async getNetworkSupply(): Promise<NetworkSupply> {
    this.trackCall('getNetworkSupply');
    const data = await this.request('network/supply');
    
    if (data && typeof data === 'object') {
      return {
        totalSupply: parseInt(data.total_supply || '0') / 100_000_000,
        circulatingSupply: parseInt(data.released_supply || '0') / 100_000_000,
        timestamp: parseTimestamp(data.timestamp) || new Date()
      };
    }
    
    return {
      totalSupply: 0,
      circulatingSupply: 0,
      timestamp: new Date()
    };
  }

  /**
   * Get list of network nodes
   */
  async getNetworkNodes(): Promise<NetworkNode[]> {
    this.trackCall('getNetworkNodes');
    const data = await this.request('network/nodes');
    
    if (data && Array.isArray(data.nodes)) {
      return data.nodes.map((node: any) => ({
        nodeId: node.node_id || 0,
        nodeAccountId: node.node_account_id || '',
        description: node.description,
        stake: node.stake,
        stakeNotRewarded: node.stake_not_rewarded,
        stakeRewarded: node.stake_rewarded,
        stakePercentage: node.stake_percentage
      }));
    }
    
    return [];
  }

  /**
   * Get HBAR to USD exchange rate
   */
  async getNetworkExchangeRate(): Promise<NetworkExchangeRate | undefined> {
    const data = await this.request('network/exchangerate');
    
    if (data && data.current_rate) {
      const result: NetworkExchangeRate = {
        currentRate: {
          centEquiv: data.current_rate.cent_equiv || 0,
          hbarEquiv: data.current_rate.hbar_equiv || 0,
          expirationTime: data.current_rate.expiration_time || ''
        },
        timestamp: parseTimestamp(data.timestamp) || new Date()
      };
      
      if (data.next_rate) {
        result.nextRate = {
          centEquiv: data.next_rate.cent_equiv || 0,
          hbarEquiv: data.next_rate.hbar_equiv || 0,
          expirationTime: data.next_rate.expiration_time || ''
        };
      }
      
      return result;
    }
    
    return undefined;
  }

  // ========== ACCOUNT METHODS ==========

  /**
   * Get comprehensive account information
   */
  async getAccountInfo(accountId: string): Promise<AccountInfo | undefined> {
    if (!validateAccountId(accountId)) {
      throw new Error(`Invalid account ID format: ${accountId}`);
    }

    const data = await this.request(`accounts/${accountId}`);
    
    if (data && typeof data === 'object') {
      return {
        account: data.account || accountId,
        alias: data.alias,
        balance: {
          balance: parseInt(data.balance?.balance || '0'),
          timestamp: data.balance?.timestamp || ''
        },
        createdTimestamp: data.created_timestamp || '',
        declineReward: data.decline_reward,
        deleted: data.deleted,
        ethereumNonce: data.ethereum_nonce,
        evmAddress: data.evm_address,
        key: data.key,
        maxAutomaticTokenAssociations: data.max_automatic_token_associations,
        memo: data.memo,
        pendingReward: data.pending_reward,
        receiverSigRequired: data.receiver_sig_required,
        stakedAccountId: data.staked_account_id,
        stakedNodeId: data.staked_node_id,
        stakePeriodStart: data.stake_period_start
      };
    }
    
    return undefined;
  }

  /**
   * Get account HBAR balance
   */
  async getAccountBalance(accountId: string): Promise<number> {
    const accountInfo = await this.getAccountInfo(accountId);
    if (accountInfo) {
      return accountInfo.balance.balance / 100_000_000;
    }
    return 0;
  }

  /**
   * Get all tokens held by an account
   */
  async getAccountTokens(accountId: string): Promise<any[]> {
    if (!validateAccountId(accountId)) {
      throw new Error(`Invalid account ID format: ${accountId}`);
    }

    const data = await this.request(`accounts/${accountId}/tokens`);
    return Array.isArray(data?.tokens) ? data.tokens : [];
  }

  // ========== TOKEN METHODS ==========

  /**
   * Get top tokens from Mirror Node API with SaucerSwap price data
   */
  async getTopTokens(limit: number = 50, sortBy: string = 'supply'): Promise<Token[]> {
    if (limit <= 0 || limit > 1000) {
      throw new Error('Limit must be between 1 and 1000');
    }
    
    const data = await this.request('tokens', { 
      type: 'FUNGIBLE_COMMON', 
      limit,
      order: sortBy === 'created_timestamp' ? 'desc' : 'asc'
    });

    // Get SaucerSwap token prices
    const saucerTokens = await this.getSaucerSwapTokens();
    const saucerTokenMap = new Map(saucerTokens.map(t => [t.id, t]));

    const tokens: Token[] = [];
    if (Array.isArray(data?.tokens)) {
      for (const tokenData of data.tokens) {
        const tokenId = tokenData.token_id;
        const saucerData = saucerTokenMap.get(tokenId);

        tokens.push({
          tokenId,
          symbol: tokenData.symbol || '',
          name: tokenData.name || '',
          decimals: parseInt(tokenData.decimals || '8'),
          totalSupply: parseInt(tokenData.total_supply || '0'),
          price: saucerData?.priceUsd || 0,
          tvl: 0, // Real TVL requires comprehensive holder analysis
          volume24h: 0, // Real volume requires transfer analysis
          holders: 0 // Real holder count requires separate API calls
        });
      }
    }

    return tokens;
  }

  /**
   * Get detailed information about a specific token
   */
  async getTokenInfo(tokenId: string): Promise<Token | undefined> {
    if (!tokenId || !tokenId.startsWith('0.0.')) {
      throw new Error(`Invalid token ID format: ${tokenId}`);
    }

    const data = await this.request(`tokens/${tokenId}`);
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    return {
      tokenId,
      symbol: data.symbol || '',
      name: data.name || '',
      decimals: parseInt(data.decimals || '8'),
      totalSupply: parseInt(data.total_supply || '0'),
      price: 0, // Real price requires external oracle
      tvl: 0, // Real TVL requires holder analysis
      volume24h: 0, // Real volume requires transfer analysis
      holders: 0 // Real holder count requires balance queries
    };
  }

  // ========== BONZO FINANCE METHODS ==========

  /**
   * Get complete Bonzo Finance market data
   */
  async getBonzoMarkets(): Promise<BonzoMarketData | undefined> {
    this.trackCall('getBonzoMarkets');
    console.log(`   🏦 Fetching Bonzo markets data... (call #${this.callCounts.getBonzoMarkets})`);
    
    const markets = await this.bonzoRequest('Market');
    
    if (markets && typeof markets === 'object') {
      const reservesCount = Array.isArray(markets.reserves) ? markets.reserves.length : 0;
      const tvlStr = markets.total_market_supplied?.usd_display || '$0';
      console.log(`   💵 Bonzo markets: ${reservesCount} reserves, TVL: ${tvlStr}`);
      
      // Map snake_case to camelCase for consistency
      const mappedMarkets: BonzoMarketData = {
        chainId: markets.chain_id || markets.chainId || '',
        networkName: markets.network_name || markets.networkName || '',
        totalMarketSupplied: markets.total_market_supplied || markets.totalMarketSupplied || { usdDisplay: '0' },
        totalMarketBorrowed: markets.total_market_borrowed || markets.totalMarketBorrowed || { usdDisplay: '0' },
        totalMarketLiquidity: markets.total_market_liquidity || markets.totalMarketLiquidity || { usdDisplay: '0' },
        totalMarketReserve: markets.total_market_reserve || markets.totalMarketReserve || { usdDisplay: '0' },
        reserves: Array.isArray(markets.reserves) ? markets.reserves.map((reserve: any) => ({
          symbol: reserve.symbol || '',
          name: reserve.name,
          active: reserve.active || false,
          supplyApy: reserve.supply_apy || reserve.supplyApy || 0,
          variableBorrowApy: reserve.variable_borrow_apy || reserve.variableBorrowApy || 0,
          stableBorrowApy: reserve.stable_borrow_apy || reserve.stableBorrowApy,
          utilizationRate: reserve.utilization_rate || reserve.utilizationRate || 0,
          availableLiquidity: reserve.available_liquidity || reserve.availableLiquidity || { usdDisplay: '0' },
          totalBorrowableLiquidity: reserve.total_borrowable_liquidity || reserve.totalBorrowableLiquidity,
          ltv: reserve.ltv || 0,
          liquidationThreshold: reserve.liquidation_threshold || reserve.liquidationThreshold || 0,
          liquidationBonus: reserve.liquidation_bonus || reserve.liquidationBonus,
          variableBorrowingEnabled: reserve.variable_borrowing_enabled || reserve.variableBorrowingEnabled,
          stableBorrowingEnabled: reserve.stable_borrowing_enabled || reserve.stableBorrowingEnabled
        })) : [],
        timestamp: markets.timestamp || new Date().toISOString()
      };
      
      return mappedMarkets;
    }
    
    return undefined;
  }

  /**
   * Get all Bonzo Finance lending reserves
   */
  async getBonzoReserves(cachedData?: BonzoMarketData): Promise<BonzoReserve[]> {
    const data = cachedData || await this.getBonzoMarkets();
    return Array.isArray(data?.reserves) ? data.reserves : [];
  }

  /**
   * Get Bonzo Finance total market statistics
   */
  async getBonzoTotalMarkets(cachedData?: BonzoMarketData): Promise<any> {
    const data = cachedData || await this.getBonzoMarkets();
    
    if (data) {
      return {
        chainId: data.chainId,
        networkName: data.networkName,
        totalMarketSupplied: data.totalMarketSupplied,
        totalMarketBorrowed: data.totalMarketBorrowed,
        totalMarketLiquidity: data.totalMarketLiquidity,
        totalMarketReserve: data.totalMarketReserve,
        timestamp: data.timestamp,
        totalReserves: Array.isArray(data.reserves) ? data.reserves.length : 0
      };
    }
    
    return {};
  }

  // ========== SAUCERSWAP METHODS ==========

  /**
   * Get all SaucerSwap liquidity pools
   */
  async getSaucerSwapPools(): Promise<SaucerSwapPool[]> {
    this.trackCall('getSaucerSwapPools');
    console.log(`   🏊 Fetching SaucerSwap pools... (call #${this.callCounts.getSaucerSwapPools})`);
    
    const pools = await this.saucerswapRequest('pools');
    
    if (Array.isArray(pools)) {
      console.log(`   📊 Found ${pools.length} SaucerSwap pools`);
      return pools as SaucerSwapPool[];
    }
    
    return [];
  }

  /**
   * Get all SaucerSwap tokens with price data
   */
  async getSaucerSwapTokens(): Promise<SaucerSwapToken[]> {
    this.trackCall('getSaucerSwapTokens');
    console.log(`   🪙 Fetching SaucerSwap tokens... (call #${this.callCounts.getSaucerSwapTokens})`);
    
    const tokens = await this.saucerswapRequest('tokens');
    
    if (Array.isArray(tokens)) {
      console.log(`   📈 Found ${tokens.length} SaucerSwap tokens with price data`);
      return tokens as SaucerSwapToken[];
    }
    
    return [];
  }

  /**
   * Get SaucerSwap protocol statistics
   */
  async getSaucerSwapStats(): Promise<SaucerSwapStats> {
    this.trackCall('getSaucerSwapStats');
    console.log(`   📈 Fetching SaucerSwap stats...`);
    const stats = await this.saucerswapRequest('stats');
    
    if (stats && typeof stats === 'object') {
      const tvl = stats.tvlUsd || 0;
      console.log(`   💰 SaucerSwap TVL: $${tvl.toLocaleString()}`);
      return stats as SaucerSwapStats;
    }
    
    return {
      tvlUsd: 0,
      volumeTotalUsd: 0,
      swapTotal: 0,
      circulatingSauce: 0
    };
  }

  // ========== CROSS-PROTOCOL METHODS ==========

  /**
   * Get summary of liquidity across both protocols
   */
  async getCrossProtocolLiquiditySummary(): Promise<any> {
    const startTime = Date.now();
    console.log(`   🔄 Starting cross-protocol liquidity summary...`);

    // SaucerSwap data
    const saucerStart = Date.now();
    const saucerStats = await this.getSaucerSwapStats();
    const saucerPools = await this.getSaucerSwapPools();
    const saucerTime = Date.now() - saucerStart;
    console.log(`   📊 SaucerSwap data fetched in ${saucerTime}ms`);

    // Bonzo Finance data
    const bonzoStart = Date.now();
    const bonzoData = await this.getBonzoMarkets();
    const bonzoTime = Date.now() - bonzoStart;
    console.log(`   💰 Bonzo data fetched in ${bonzoTime}ms`);

    // Calculate totals
    const saucerTvl = saucerStats.tvlUsd || 0;
    const bonzoTvlStr = bonzoData?.totalMarketSupplied?.usdDisplay || '0';
    const bonzoTvl = parseUsdValue(bonzoTvlStr);

    const totalTime = Date.now() - startTime;
    console.log(`   ⚡ Cross-protocol summary completed in ${totalTime}ms`);

    return {
      totalLiquidityUsd: saucerTvl + bonzoTvl,
      saucerswap: {
        tvlUsd: saucerTvl,
        poolCount: saucerPools.length,
        activePools: saucerPools.filter(p => parseInt(p.liquidity || '0') > 0).length,
        protocolType: 'DEX'
      },
      bonzoFinance: {
        tvlUsd: bonzoTvl,
        reserveCount: bonzoData?.reserves?.length || 0,
        activeReserves: bonzoData?.reserves?.filter(r => r.active).length || 0,
        protocolType: 'Lending'
      },
      protocolDistribution: {
        dexPercentage: saucerTvl + bonzoTvl > 0 ? (saucerTvl / (saucerTvl + bonzoTvl) * 100) : 0,
        lendingPercentage: saucerTvl + bonzoTvl > 0 ? (bonzoTvl / (saucerTvl + bonzoTvl) * 100) : 0
      },
      timestamp: new Date().toISOString(),
      performance: {
        totalTime,
        saucerswapTime: saucerTime,
        bonzoTime: bonzoTime
      }
    };
  }

  /**
   * Get all token images/icons from SaucerSwap (PNG URLs)
   */
  async getAllTokenImages(): Promise<any> {
    console.log(`   🖼️  Fetching all token images from SaucerSwap...`);
    const startTime = Date.now();

    const tokens = await this.getSaucerSwapTokens();
    const tokenImages: Record<string, any> = {};
    let pngCount = 0;

    for (const token of tokens) {
      const iconUrl = token.icon;
      if (iconUrl && token.id) {
        const isPng = iconUrl.toLowerCase().endsWith('.png');
        tokenImages[token.id] = {
          symbol: token.symbol,
          name: token.name,
          iconUrl,
          isPng,
          priceUsd: token.priceUsd || 0,
          inTopPools: token.inTopPools || false
        };

        if (isPng) {
          pngCount++;
        }
      }
    }

    const pngImages = Object.fromEntries(
      Object.entries(tokenImages).filter(([, data]) => data.isPng)
    );

    const fetchTime = Date.now() - startTime;
    console.log(`   ✅ Found ${Object.keys(tokenImages).length} token images (${pngCount} PNGs) in ${fetchTime}ms`);

    return {
      allImages: tokenImages,
      pngImages,
      stats: {
        totalTokens: tokens.length,
        tokensWithImages: Object.keys(tokenImages).length,
        pngImagesCount: pngCount,
        otherFormatCount: Object.keys(tokenImages).length - pngCount,
        fetchTime
      }
    };
  }

  // ========== UTILITY METHODS ==========

  /**
   * Track API call counts for performance monitoring
   */
  private trackCall(methodName: string): void {
    this.callCounts[methodName] = (this.callCounts[methodName] || 0) + 1;
    if (this.callCounts[methodName] > 5) {
      console.warn(`   ⚠️  WARNING: ${methodName} called ${this.callCounts[methodName]} times!`);
    }
  }

  /**
   * Show API call statistics to identify performance bottlenecks
   */
  showCallStatistics(): CallStatistics {
    console.log('\n📊 API Call Statistics:');
    const sortedCalls = Object.entries(this.callCounts).sort((a, b) => b[1] - a[1]);
    
    for (const [method, count] of sortedCalls) {
      const status = count > 10 ? '🔥 EXCESSIVE' : count > 5 ? '⚠️ HIGH' : '✅ OK';
      console.log(`   ${status} ${method}: ${count} calls`);
    }

    const totalCalls = Object.values(this.callCounts).reduce((sum, count) => sum + count, 0);
    const excessiveMethods = Object.entries(this.callCounts)
      .filter(([, count]) => count > 10)
      .map(([method]) => method);

    return {
      callCounts: { ...this.callCounts },
      totalCalls,
      uniqueMethods: Object.keys(this.callCounts).length,
      excessiveMethods
    };
  }

  /**
   * Reset API call statistics for clean testing
   */
  resetCallCounts(): void {
    Object.keys(this.callCounts).forEach(key => delete this.callCounts[key]);
    console.log('🔄 API call statistics reset');
  }

  /**
   * Clear the request cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}