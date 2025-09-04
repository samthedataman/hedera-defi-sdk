/**
 * TypeScript interfaces for Hedera DeFi SDK
 */

export interface Token {
  tokenId: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: number;
  price: number;
  tvl: number;
  volume24h: number;
  holders: number;
}

export interface Pool {
  poolId?: string;
  contractId?: string;
  protocol: string;
  name: string;
  type: string; // 'dex', 'lending', 'staking', 'v3'
  tokens: string[];
  tvl: number;
  volume24h: number;
  fee?: number;
  apy: number;
  fees24h?: number;
  ilRisk?: number;
}

export interface Protocol {
  contractId: string;
  name: string;
  type: string; // 'dex', 'lending', 'staking', 'unknown'
  tvl: number;
  volume24h: number;
  users24h: number;
  pools: string[];
  tokens: string[];
  createdAt: Date;
}

export interface Transaction {
  hash: string;
  timestamp: Date;
  type: string;
  fromAddress: string;
  toAddress: string;
  value: number;
  gasUsed: number;
  status: string;
}

export interface WhaleAlert {
  timestamp: Date;
  type: string; // 'transfer', 'swap', 'liquidity'
  token: string;
  amount: number;
  valueUsd: number;
  fromAddress: string;
  toAddress: string;
  transactionHash: string;
}

export interface RiskMetrics {
  protocolId: string;
  tvlChange24h: number;
  volumeChange24h: number;
  concentrationRisk: number; // 0-1
  liquidityRisk: number; // 0-1
  smartContractRisk: number; // 0-1
  overallRisk: string; // 'low', 'medium', 'high', 'critical'
}

// API Response interfaces
export interface ApiResponse<T = any> {
  [key: string]: T;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}

export interface CallStatistics {
  callCounts: Record<string, number>;
  totalCalls: number;
  uniqueMethods: number;
  excessiveMethods: string[];
}

// SaucerSwap specific types
export interface SaucerSwapToken {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  priceUsd: number;
  inTopPools?: boolean;
  inV2Pools?: boolean;
  dueDiligenceComplete?: boolean;
  icon?: string;
  createdAt?: string;
}

export interface SaucerSwapPool {
  id: number;
  contractId: string;
  tokenA: SaucerSwapToken;
  tokenB: SaucerSwapToken;
  fee: number;
  amountA: string;
  amountB: string;
  liquidity: string;
  tvlUsd?: number;
  valueAUsd?: number;
  valueBUsd?: number;
}

export interface SaucerSwapStats {
  tvlUsd: number;
  volumeTotalUsd: number;
  swapTotal: number;
  circulatingSauce: number;
}

// Bonzo Finance specific types
export interface BonzoReserve {
  symbol: string;
  name?: string;
  active: boolean;
  supplyApy: number;
  variableBorrowApy: number;
  stableBorrowApy?: number;
  utilizationRate: number;
  availableLiquidity: {
    usdDisplay: string;
    [key: string]: any;
  };
  totalBorrowableLiquidity?: {
    usdDisplay: string;
    [key: string]: any;
  };
  ltv: number;
  liquidationThreshold: number;
  liquidationBonus?: number;
  variableBorrowingEnabled?: boolean;
  stableBorrowingEnabled?: boolean;
}

export interface BonzoMarketData {
  chainId: string;
  networkName: string;
  totalMarketSupplied: {
    usdDisplay: string;
    [key: string]: any;
  };
  totalMarketBorrowed: {
    usdDisplay: string;
    [key: string]: any;
  };
  totalMarketLiquidity: {
    usdDisplay: string;
    [key: string]: any;
  };
  totalMarketReserve: {
    usdDisplay: string;
    [key: string]: any;
  };
  reserves: BonzoReserve[];
  timestamp: string;
}

// Configuration interfaces
export interface HederaDeFiConfig {
  apiKey?: string;
  endpoint?: string;
  cacheTtl?: number;
  bonzoApi?: string;
  saucerswapApi?: string;
  timeout?: number;
}

// Network and account interfaces
export interface NetworkSupply {
  totalSupply: number;
  circulatingSupply: number;
  timestamp: Date;
}

export interface NetworkNode {
  nodeId: number;
  nodeAccountId: string;
  description?: string;
  stake?: number;
  stakeNotRewarded?: number;
  stakeRewarded?: number;
  stakePercentage?: number;
}

export interface NetworkExchangeRate {
  currentRate: {
    centEquiv: number;
    hbarEquiv: number;
    expirationTime: string;
  };
  nextRate?: {
    centEquiv: number;
    hbarEquiv: number;
    expirationTime: string;
  };
  timestamp: Date;
}

export interface AccountInfo {
  account: string;
  alias?: string;
  balance: {
    balance: number;
    timestamp: string;
  };
  createdTimestamp: string;
  declineReward?: boolean;
  deleted?: boolean;
  ethereumNonce?: number;
  evmAddress?: string;
  key?: any;
  maxAutomaticTokenAssociations?: number;
  memo?: string;
  pendingReward?: number;
  receiverSigRequired?: boolean;
  stakedAccountId?: string;
  stakedNodeId?: number;
  stakePeriodStart?: string;
}

// Utility types
export type DefiProtocolType = 'dex' | 'lending' | 'staking' | 'unknown';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type PoolType = 'v2' | 'v3' | 'stable' | 'weighted';