"""
Basic usage examples for Hedera DeFi SDK
"""

from hedera_defi import HederaDeFi
import pandas as pd


def main():
    # Initialize client
    client = HederaDeFi(api_key="your_api_key_here")
    
    # Example 1: Get top protocols
    print("=" * 50)
    print("TOP DEFI PROTOCOLS ON HEDERA")
    print("=" * 50)
    
    protocols = client.get_protocols(min_tvl=10000)
    for i, protocol in enumerate(protocols[:10], 1):
        print(f"{i}. {protocol.name}")
        print(f"   Type: {protocol.type}")
        print(f"   TVL: ${protocol.tvl:,.0f}")
        print(f"   24h Volume: ${protocol.volume_24h:,.0f}")
        print(f"   Active Users: {protocol.users_24h}")
        print()
    
    # Example 2: Whale tracking
    print("=" * 50)
    print("RECENT WHALE ACTIVITY")
    print("=" * 50)
    
    whales = client.get_whale_transactions(
        threshold=100000,
        window_minutes=60
    )
    
    for whale in whales[:5]:
        print(f"🐋 ${whale.value_usd:,.0f} {whale.token}")
        print(f"   From: {whale.from_address[:10]}...")
        print(f"   To: {whale.to_address[:10]}...")
        print(f"   Time: {whale.timestamp}")
        print()
    
    # Example 3: Best yields
    print("=" * 50)
    print("BEST YIELD OPPORTUNITIES")
    print("=" * 50)
    
    yields_df = client.get_best_yields(min_apy=5.0, max_risk=50.0)
    print(yields_df.to_string())
    
    # Example 4: Risk analysis
    print("=" * 50)
    print("RISK ANALYSIS")
    print("=" * 50)
    
    for protocol in protocols[:3]:
        risk = client.get_risk_metrics(protocol.contract_id)
        print(f"{protocol.name}:")
        print(f"  Overall Risk: {risk.overall_risk}")
        print(f"  TVL Change 24h: {risk.tvl_change_24h:+.1f}%")
        print(f"  Concentration Risk: {risk.concentration_risk:.1%}")
        print()
    
    # Example 5: Market overview
    print("=" * 50)
    print("HEDERA DEFI MARKET OVERVIEW")
    print("=" * 50)
    
    overview = client.get_defi_overview()
    print(f"Total TVL: ${overview['total_tvl']:,.0f}")
    print(f"24h Volume: ${overview['total_volume_24h']:,.0f}")
    print(f"Active Protocols: {overview['protocol_count']}")
    print(f"Market Health: {overview['market_health']}")
    print()
    print("Top Protocols:")
    for p in overview['top_protocols']:
        print(f"  - {p['name']}: ${p['tvl']:,.0f}")


if __name__ == "__main__":
    main()