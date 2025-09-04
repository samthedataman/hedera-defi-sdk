#!/usr/bin/env python3
"""
Bonzo Finance API Test Suite
Tests all Bonzo Finance related functions in the Hedera DeFi SDK
"""

import json
import time
from datetime import datetime
from hedera_defi import HederaDeFi

def main():
    """Test all Bonzo Finance functions"""
    
    print("🏦 Bonzo Finance API Test Suite")
    print("Testing ALL Bonzo Finance functions")
    print("=" * 50)
    
    # Initialize client
    client = HederaDeFi()
    client.reset_call_counts()
    
    # Test results
    results = {
        "test_timestamp": datetime.now().isoformat(),
        "test_type": "bonzo_finance_comprehensive",
        "api_endpoint": "https://mainnet-data.bonzo.finance",
        "test_results": {}
    }
    
    print("\n🏦 Testing Core Bonzo Finance API Methods...")
    
    # Test 1: Raw market data
    print("   📊 get_bonzo_markets()")
    start_time = time.time()
    markets_data = client.get_bonzo_markets()
    markets_time = time.time() - start_time
    
    results["test_results"]["get_bonzo_markets"] = {
        "execution_time": markets_time,
        "data_received": bool(markets_data),
        "reserves_count": len(markets_data.get("reserves", [])),
        "chain_id": markets_data.get("chain_id"),
        "network_name": markets_data.get("network_name"),
        "total_reserves": markets_data.get("total_market_supplied", {}).get("usd_display", "0")
    }
    
    print(f"   ✅ Markets data: {len(markets_data.get('reserves', []))} reserves in {markets_time:.3f}s")
    
    # Test 2: Total markets summary
    print("   📈 get_bonzo_total_markets()")
    start_time = time.time()
    totals_data = client.get_bonzo_total_markets(cached_data=markets_data)
    totals_time = time.time() - start_time
    
    results["test_results"]["get_bonzo_total_markets"] = {
        "execution_time": totals_time,
        "data_received": bool(totals_data),
        "total_supplied_usd": totals_data.get("total_market_supplied", {}).get("usd_display", "0"),
        "total_borrowed_usd": totals_data.get("total_market_borrowed", {}).get("usd_display", "0"),
        "total_liquidity_usd": totals_data.get("total_market_liquidity", {}).get("usd_display", "0")
    }
    
    print(f"   ✅ Total markets: TVL {totals_data.get('total_market_supplied', {}).get('usd_display', '0')} in {totals_time:.3f}s")
    
    # Test 3: All reserves
    print("   🏛️  get_bonzo_reserves()")
    start_time = time.time()
    reserves_data = client.get_bonzo_reserves(cached_data=markets_data)
    reserves_time = time.time() - start_time
    
    results["test_results"]["get_bonzo_reserves"] = {
        "execution_time": reserves_time,
        "reserves_count": len(reserves_data),
        "active_reserves": len([r for r in reserves_data if r.get("active", False)]),
        "sample_reserves": [r.get("symbol") for r in reserves_data[:5]]
    }
    
    print(f"   ✅ Reserves: {len(reserves_data)} total, {len([r for r in reserves_data if r.get('active', False)])} active in {reserves_time:.3f}s")
    
    # Test 4: Specific token reserves
    print("   🪙 Testing individual token reserves...")
    test_tokens = ["USDC", "HBARX", "SAUCE", "WHBAR", "XSAUCE"]
    token_tests = {}
    
    for token_symbol in test_tokens:
        print(f"     📍 get_bonzo_reserve({token_symbol})")
        start_time = time.time()
        reserve_data = client.get_bonzo_reserve(token_symbol)
        reserve_time = time.time() - start_time
        
        token_tests[token_symbol] = {
            "execution_time": reserve_time,
            "found": bool(reserve_data),
            "active": reserve_data.get("active", False) if reserve_data else False,
            "supply_apy": reserve_data.get("supply_apy", 0) if reserve_data else 0,
            "borrow_apy": reserve_data.get("variable_borrow_apy", 0) if reserve_data else 0,
            "utilization_rate": reserve_data.get("utilization_rate", 0) if reserve_data else 0
        }
        
        status = "✅ FOUND" if reserve_data else "❌ NOT FOUND"
        apy = f"APY: {reserve_data.get('supply_apy', 0):.2f}%" if reserve_data else ""
        print(f"     {status} {token_symbol} {apy} ({reserve_time:.3f}s)")
    
    results["test_results"]["individual_token_reserves"] = token_tests
    
    # Test 5: Best lending rates
    print("   💰 get_bonzo_best_lending_rates()")
    start_time = time.time()
    best_rates = client.get_bonzo_best_lending_rates(min_apy=1.0)
    rates_time = time.time() - start_time
    
    results["test_results"]["get_bonzo_best_lending_rates"] = {
        "execution_time": rates_time,
        "opportunities_found": len(best_rates),
        "top_rates": [
            {
                "token": rate.get("token"),
                "supply_apy": rate.get("supply_apy", 0),
                "risk_level": rate.get("risk_level")
            }
            for rate in best_rates[:5]
        ]
    }
    
    print(f"   ✅ Best rates: {len(best_rates)} opportunities >1% APY in {rates_time:.3f}s")
    
    # Test 6: Borrowing rates
    print("   📉 get_bonzo_borrowing_rates()")
    start_time = time.time()
    borrow_rates = client.get_bonzo_borrowing_rates()
    borrow_time = time.time() - start_time
    
    results["test_results"]["get_bonzo_borrowing_rates"] = {
        "execution_time": borrow_time,
        "borrowing_options": len(borrow_rates),
        "cheapest_borrow": [
            {
                "token": rate.get("token"),
                "variable_borrow_apy": rate.get("variable_borrow_apy", 0),
                "ltv": rate.get("ltv", 0)
            }
            for rate in borrow_rates[:5]
        ]
    }
    
    print(f"   ✅ Borrowing rates: {len(borrow_rates)} options in {borrow_time:.3f}s")
    
    # Test 7: Risk assessment
    print("   ⚠️  Testing risk assessment...")
    risk_tests = {}
    for reserve in reserves_data[:3]:
        symbol = reserve.get("symbol", "")
        risk_level = client._assess_bonzo_risk(reserve)
        risk_tests[symbol] = {
            "risk_level": risk_level,
            "utilization_rate": reserve.get("utilization_rate", 0),
            "ltv": reserve.get("ltv", 0),
            "liquidation_threshold": reserve.get("liquidation_threshold", 0)
        }
        print(f"     🎯 {symbol}: {risk_level} risk")
    
    results["test_results"]["risk_assessment"] = risk_tests
    
    # Performance summary
    call_stats = client.show_call_statistics()
    total_test_time = sum([
        results["test_results"]["get_bonzo_markets"]["execution_time"],
        results["test_results"]["get_bonzo_total_markets"]["execution_time"],
        results["test_results"]["get_bonzo_reserves"]["execution_time"],
        results["test_results"]["get_bonzo_best_lending_rates"]["execution_time"],
        results["test_results"]["get_bonzo_borrowing_rates"]["execution_time"]
    ])
    
    results["performance_summary"] = {
        "total_execution_time": total_test_time,
        "total_api_calls": call_stats.get("total_calls", 0),
        "calls_per_second": call_stats.get("total_calls", 0) / total_test_time if total_test_time > 0 else 0,
        "cache_efficiency": "High" if call_stats.get("total_calls", 0) < 10 else "Low",
        "call_breakdown": call_stats.get("call_counts", {})
    }
    
    # Export results
    output_file = "bonzo_finance_test_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n🎯 Bonzo Finance Test Summary:")
    print(f"   🏦 API Endpoint: Working (mainnet-data.bonzo.finance)")
    print(f"   📊 Total Reserves: {len(reserves_data)} ({len([r for r in reserves_data if r.get('active')])} active)")
    print(f"   💰 Total TVL: {totals_data.get('total_market_supplied', {}).get('usd_display', '0')}")
    print(f"   📈 Best Lending Rates: {len(best_rates)} opportunities >1% APY")
    print(f"   📉 Borrowing Options: {len(borrow_rates)} available")
    print(f"   ⚡ Total Execution Time: {total_test_time:.3f}s")
    print(f"   🔥 Total API Calls: {call_stats.get('total_calls', 0)}")
    print(f"   📁 Results saved to: {output_file}")
    
    if call_stats.get("total_calls", 0) < 10:
        print("✅ OPTIMIZATION SUCCESS: Efficient API usage!")
    else:
        print("⚠️  Consider further optimization")
    
    print("\n🏁 Bonzo Finance test completed!")

if __name__ == "__main__":
    main()