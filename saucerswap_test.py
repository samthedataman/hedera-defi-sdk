#!/usr/bin/env python3
"""
SaucerSwap API Test Suite
Tests all SaucerSwap DEX related functions in the Hedera DeFi SDK
"""

import json
import time
from datetime import datetime
from hedera_defi import HederaDeFi

def main():
    """Test all SaucerSwap functions"""
    
    print("🥞 SaucerSwap DEX API Test Suite")
    print("Testing ALL SaucerSwap functions")
    print("=" * 50)
    
    # Initialize client
    client = HederaDeFi()
    
    print("   🔄 Resetting call counters for clean measurement...")
    client.reset_call_counts()
    
    # Test results
    results = {
        "test_timestamp": datetime.now().isoformat(),
        "test_type": "saucerswap_comprehensive", 
        "api_endpoint": "https://server.saucerswap.finance/api/public",
        "test_results": {}
    }
    
    print("\n🥞 Testing Core SaucerSwap API Methods...")
    
    # Test 1: Protocol stats
    print("   📊 get_saucerswap_stats()")
    start_time = time.time()
    stats_data = client.get_saucerswap_stats()
    stats_time = time.time() - start_time
    
    results["test_results"]["get_saucerswap_stats"] = {
        "execution_time": stats_time,
        "data_received": bool(stats_data),
        "tvl_usd": stats_data.get("tvlUsd", 0),
        "volume_total_usd": stats_data.get("volumeTotalUsd", 0),
        "swap_total": stats_data.get("swapTotal", 0),
        "circulating_sauce": stats_data.get("circulatingSauce", 0)
    }
    
    print(f"   ✅ Stats: TVL ${stats_data.get('tvlUsd', 0):,.2f} in {stats_time:.3f}s")
    
    # Test 2: All pools
    print("   🏊 get_saucerswap_pools()")
    start_time = time.time()
    pools_data = client.get_saucerswap_pools()
    pools_time = time.time() - start_time
    
    active_pools = [p for p in pools_data if int(p.get("liquidity", 0)) > 0]
    
    results["test_results"]["get_saucerswap_pools"] = {
        "execution_time": pools_time,
        "total_pools": len(pools_data),
        "active_pools": len(active_pools),
        "sample_pool_ids": [p.get("id") for p in pools_data[:5]],
        "data_size_estimate": len(str(pools_data))
    }
    
    print(f"   ✅ Pools: {len(pools_data)} total ({len(active_pools)} active) in {pools_time:.3f}s")
    
    # Test 3: All tokens
    print("   🪙 get_saucerswap_tokens()")
    start_time = time.time()
    tokens_data = client.get_saucerswap_tokens()
    tokens_time = time.time() - start_time
    
    tokens_with_prices = [t for t in tokens_data if t.get("priceUsd", 0) > 0]
    top_tokens = sorted(tokens_with_prices, key=lambda t: t.get("priceUsd", 0), reverse=True)[:10]
    
    results["test_results"]["get_saucerswap_tokens"] = {
        "execution_time": tokens_time,
        "total_tokens": len(tokens_data),
        "tokens_with_prices": len(tokens_with_prices),
        "top_priced_tokens": [
            {
                "symbol": t.get("symbol"),
                "price_usd": t.get("priceUsd", 0),
                "in_top_pools": t.get("inTopPools", False)
            }
            for t in top_tokens
        ]
    }
    
    print(f"   ✅ Tokens: {len(tokens_data)} total ({len(tokens_with_prices)} with prices) in {tokens_time:.3f}s")
    
    # Test 4: Top pools by TVL
    print("   🏆 get_saucerswap_top_pools(10)")
    start_time = time.time()
    top_pools = client.get_saucerswap_top_pools(10)
    top_pools_time = time.time() - start_time
    
    results["test_results"]["get_saucerswap_top_pools"] = {
        "execution_time": top_pools_time,
        "pools_analyzed": len(pools_data),
        "top_pools_returned": len(top_pools),
        "highest_tvl": top_pools[0].get("tvl_usd", 0) if top_pools else 0,
        "total_top_tvl": sum(p.get("tvl_usd", 0) for p in top_pools),
        "top_pool_pairs": [
            f"{p.get('tokenA', {}).get('symbol', '')}-{p.get('tokenB', {}).get('symbol', '')}"
            for p in top_pools
        ]
    }
    
    highest_tvl = top_pools[0].get('tvl_usd', 0) if top_pools else 0
    print(f"   ✅ Top pools: {len(top_pools)} pools, highest TVL ${highest_tvl:,.2f} in {top_pools_time:.3f}s")
    
    # Test 5: Token-specific functions
    print("   🎯 Testing token-specific functions...")
    test_token_id = "0.0.456858"  # USDC
    
    # Get token by ID
    print("     📍 get_saucerswap_token_by_id(USDC)")
    start_time = time.time()
    usdc_token = client.get_saucerswap_token_by_id(test_token_id)
    token_time = time.time() - start_time
    
    # Get token price
    print("     💰 get_saucerswap_token_price(USDC)")
    start_time = time.time()
    usdc_price = client.get_saucerswap_token_price(test_token_id)
    price_time = time.time() - start_time
    
    # Get token pairs
    print("     🔗 get_saucerswap_token_pairs(USDC)")
    start_time = time.time()
    usdc_pairs = client.get_saucerswap_token_pairs(test_token_id, cached_pools=pools_data)
    pairs_time = time.time() - start_time
    
    results["test_results"]["token_specific_functions"] = {
        "test_token_id": test_token_id,
        "get_token_by_id": {
            "execution_time": token_time,
            "found": bool(usdc_token),
            "symbol": usdc_token.get("symbol", "") if usdc_token else "",
            "price_usd": usdc_token.get("priceUsd", 0) if usdc_token else 0
        },
        "get_token_price": {
            "execution_time": price_time,
            "price_usd": usdc_price
        },
        "get_token_pairs": {
            "execution_time": pairs_time,
            "pairs_found": len(usdc_pairs),
            "total_tvl": sum(p.get("tvl_usd", 0) for p in usdc_pairs),
            "top_pair": usdc_pairs[0] if usdc_pairs else None
        }
    }
    
    print(f"   ✅ USDC analysis: ${usdc_price:.3f} price, {len(usdc_pairs)} pairs in {token_time + price_time + pairs_time:.3f}s")
    
    # Test 6: Analytics and aggregation
    print("   📊 get_saucerswap_analytics()")
    start_time = time.time()
    analytics = client.get_saucerswap_analytics()
    analytics_time = time.time() - start_time
    
    results["test_results"]["get_saucerswap_analytics"] = {
        "execution_time": analytics_time,
        "total_pools": analytics.get("total_pools", 0),
        "active_pools": analytics.get("active_pools", 0),
        "total_tokens": analytics.get("total_tokens", 0),
        "tokens_with_prices": analytics.get("tokens_with_prices", 0),
        "total_tvl_calculated": analytics.get("total_tvl_usd", 0)
    }
    
    print(f"   ✅ Analytics: {analytics.get('active_pools', 0)} active pools, TVL ${analytics.get('total_tvl_usd', 0):,.2f} in {analytics_time:.3f}s")
    
    # Test 7: Protocol TVL and volume
    print("   💎 get_saucerswap_protocol_tvl() & get_saucerswap_volume_24h()")
    start_time = time.time()
    protocol_tvl = client.get_saucerswap_protocol_tvl()
    volume_24h = client.get_saucerswap_volume_24h()
    metrics_time = time.time() - start_time
    
    results["test_results"]["protocol_metrics"] = {
        "execution_time": metrics_time,
        "protocol_tvl_usd": protocol_tvl,
        "volume_24h_estimate": volume_24h
    }
    
    print(f"   ✅ Protocol metrics: TVL ${protocol_tvl:,.2f}, Volume ${volume_24h:,.2f} in {metrics_time:.3f}s")
    
    # Test 8: Token images (PNG discovery)
    print("   🖼️  get_all_token_images()")
    start_time = time.time()
    token_images = client.get_all_token_images()
    images_time = time.time() - start_time
    
    results["test_results"]["get_all_token_images"] = {
        "execution_time": images_time,
        "total_images": token_images["stats"]["tokens_with_images"],
        "png_images": token_images["stats"]["png_images_count"],
        "other_formats": token_images["stats"]["other_format_count"],
        "sample_png_urls": [
            token_images["png_images"][token_id]["icon_url"] 
            for token_id in list(token_images["png_images"].keys())[:5]
        ]
    }
    
    print(f"   ✅ Token images: {token_images['stats']['png_images_count']} PNG icons found in {images_time:.3f}s")
    
    # Test 9: Known/verified pools
    print("   ✅ get_saucerswap_known_pools()")
    start_time = time.time()
    known_pools = client.get_saucerswap_known_pools()
    known_time = time.time() - start_time
    
    results["test_results"]["get_saucerswap_known_pools"] = {
        "execution_time": known_time,
        "known_pools_count": len(known_pools),
        "verified_pool_ids": [p.get("id") for p in known_pools[:10]]
    }
    
    print(f"   ✅ Known pools: {len(known_pools)} verified pools in {known_time:.3f}s")
    
    # Performance summary
    call_stats = client.show_call_statistics()
    total_test_time = sum([
        results["test_results"]["get_saucerswap_stats"]["execution_time"],
        results["test_results"]["get_saucerswap_pools"]["execution_time"],
        results["test_results"]["get_saucerswap_tokens"]["execution_time"],
        results["test_results"]["get_saucerswap_top_pools"]["execution_time"],
        results["test_results"]["get_saucerswap_analytics"]["execution_time"],
        results["test_results"]["protocol_metrics"]["execution_time"],
        results["test_results"]["get_all_token_images"]["execution_time"],
        results["test_results"]["get_saucerswap_known_pools"]["execution_time"]
    ])
    
    results["performance_summary"] = {
        "total_execution_time": total_test_time,
        "total_api_calls": call_stats.get("total_calls", 0),
        "calls_per_second": call_stats.get("total_calls", 0) / total_test_time if total_test_time > 0 else 0,
        "cache_efficiency": "High" if call_stats.get("total_calls", 0) < 15 else "Low",
        "call_breakdown": call_stats.get("call_counts", {}),
        "optimization_status": "Optimized" if call_stats.get("total_calls", 0) < 15 else "Needs work"
    }
    
    # Export results
    output_file = "saucerswap_test_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n🎯 SaucerSwap Test Summary:")
    print(f"   🥞 API Endpoint: Working (server.saucerswap.finance)")
    print(f"   🏊 Total Pools: {len(pools_data)} ({len(active_pools)} active)")
    print(f"   🪙 Total Tokens: {len(tokens_data)} ({len(tokens_with_prices)} with prices)")
    print(f"   💰 Protocol TVL: ${protocol_tvl:,.2f}")
    print(f"   📈 Top Pool TVL: ${highest_tvl:,.2f}" if top_pools else "   📈 No pools found")
    print(f"   🖼️  PNG Icons: {token_images['stats']['png_images_count']} available")
    print(f"   ✅ Known Pools: {len(known_pools)} verified")
    print(f"   ⚡ Total Execution Time: {total_test_time:.3f}s")
    print(f"   🔥 Total API Calls: {call_stats.get('total_calls', 0)}")
    print(f"   📁 Results saved to: {output_file}")
    
    if call_stats.get("total_calls", 0) < 15:
        print("✅ OPTIMIZATION SUCCESS: Efficient API usage!")
    else:
        print("⚠️  Consider further optimization")
    
    print("\n🥞 SaucerSwap test completed!")

if __name__ == "__main__":
    main()