#!/usr/bin/env python3

"""
OpenRouter Data Analysis Script

This script analyzes the OpenRouter activity CSV to determine realistic token estimates
for the pricing analysis tool.

Usage: python scripts/analyze-openrouter-data.py /path/to/openrouter_activity.csv
"""

import csv
import statistics
import sys
from collections import defaultdict

def analyze_openrouter_data(csv_file_path):
    """Analyze OpenRouter CSV data to extract token usage statistics."""
    
    data = []
    app_stats = defaultdict(list)
    model_stats = defaultdict(list)
    
    print("🔍 Analyzing OpenRouter activity data...")
    print("=" * 50)
    
    # Read and parse CSV data
    with open(csv_file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Filter for actual completion data (exclude cancelled/failed)
            if (row['tokens_prompt'] and row['tokens_completion'] and 
                row['cancelled'] == 'false' and 
                int(row['tokens_prompt']) > 0 and 
                int(row['tokens_completion']) > 0):
                
                prompt_tokens = int(row['tokens_prompt'])
                completion_tokens = int(row['tokens_completion'])
                app_name = row['app_name']
                model = row['model_permaslug']
                cost = float(row['cost_total']) if row['cost_total'] else 0
                
                data.append({
                    'prompt_tokens': prompt_tokens,
                    'completion_tokens': completion_tokens,
                    'total_tokens': prompt_tokens + completion_tokens,
                    'app_name': app_name,
                    'model': model,
                    'cost': cost
                })
                
                app_stats[app_name].append({
                    'prompt': prompt_tokens,
                    'completion': completion_tokens,
                    'total': prompt_tokens + completion_tokens
                })
                
                model_stats[model].append({
                    'prompt': prompt_tokens,
                    'completion': completion_tokens,
                    'total': prompt_tokens + completion_tokens,
                    'cost': cost
                })
    
    if not data:
        print("❌ No valid data found in CSV file!")
        return
    
    print(f"📊 Analyzed {len(data)} valid API requests")
    print()
    
    # Overall statistics
    prompt_tokens = [d['prompt_tokens'] for d in data]
    completion_tokens = [d['completion_tokens'] for d in data]
    total_tokens = [d['total_tokens'] for d in data]
    costs = [d['cost'] for d in data if d['cost'] > 0]
    
    print("📈 OVERALL TOKEN STATISTICS")
    print("-" * 30)
    print(f"Prompt Tokens:")
    print(f"  • Average: {statistics.mean(prompt_tokens):,.0f}")
    print(f"  • Median:  {statistics.median(prompt_tokens):,.0f}")
    print(f"  • Min:     {min(prompt_tokens):,.0f}")
    print(f"  • Max:     {max(prompt_tokens):,.0f}")
    print()
    
    print(f"Completion Tokens:")
    print(f"  • Average: {statistics.mean(completion_tokens):,.0f}")
    print(f"  • Median:  {statistics.median(completion_tokens):,.0f}")
    print(f"  • Min:     {min(completion_tokens):,.0f}")
    print(f"  • Max:     {max(completion_tokens):,.0f}")
    print()
    
    print(f"Total Tokens:")
    print(f"  • Average: {statistics.mean(total_tokens):,.0f}")
    print(f"  • Median:  {statistics.median(total_tokens):,.0f}")
    print()
    
    if costs:
        print(f"Cost per Request:")
        print(f"  • Average: ${statistics.mean(costs):.6f}")
        print(f"  • Median:  ${statistics.median(costs):.6f}")
        print(f"  • Total:   ${sum(costs):.4f}")
        print()
    
    # App-specific statistics (ChatLima focus)
    print("🎯 APP-SPECIFIC STATISTICS")
    print("-" * 30)
    for app_name, requests in app_stats.items():
        if len(requests) >= 5:  # Only show apps with significant usage
            prompts = [r['prompt'] for r in requests]
            completions = [r['completion'] for r in requests]
            
            print(f"{app_name} ({len(requests)} requests):")
            print(f"  • Avg Prompt: {statistics.mean(prompts):,.0f} tokens")
            print(f"  • Avg Completion: {statistics.mean(completions):,.0f} tokens")
            print(f"  • Median Prompt: {statistics.median(prompts):,.0f} tokens")
            print(f"  • Median Completion: {statistics.median(completions):,.0f} tokens")
            print()
    
    # Model-specific statistics for high-usage models
    print("🤖 TOP MODELS BY USAGE")
    print("-" * 30)
    model_usage = [(model, len(requests)) for model, requests in model_stats.items()]
    model_usage.sort(key=lambda x: x[1], reverse=True)
    
    for model, count in model_usage[:10]:  # Top 10 models
        requests = model_stats[model]
        prompts = [r['prompt'] for r in requests]
        completions = [r['completion'] for r in requests]
        model_costs = [r['cost'] for r in requests if r['cost'] > 0]
        
        print(f"{model} ({count} requests):")
        print(f"  • Avg Prompt: {statistics.mean(prompts):,.0f} tokens")
        print(f"  • Avg Completion: {statistics.mean(completions):,.0f} tokens")
        if model_costs:
            print(f"  • Avg Cost: ${statistics.mean(model_costs):.6f}")
        print()
    
    # ChatLima-specific recommendations
    chatlima_data = [d for d in data if d['app_name'] == 'ChatLima']
    if chatlima_data:
        print("🎯 CHATLIMA-SPECIFIC RECOMMENDATIONS")
        print("-" * 40)
        
        chatlima_prompts = [d['prompt_tokens'] for d in chatlima_data]
        chatlima_completions = [d['completion_tokens'] for d in chatlima_data]
        
        avg_prompt = statistics.mean(chatlima_prompts)
        avg_completion = statistics.mean(chatlima_completions)
        median_prompt = statistics.median(chatlima_prompts)
        median_completion = statistics.median(chatlima_completions)
        
        print(f"Based on {len(chatlima_data)} ChatLima requests:")
        print()
        print(f"📊 Current estimates in script: 5000 input, 3000 output")
        print(f"📈 Actual averages: {avg_prompt:.0f} input, {avg_completion:.0f} output")
        print(f"📉 Actual medians: {median_prompt:.0f} input, {median_completion:.0f} output")
        print()
        
        # Recommendations
        recommended_input = max(int(avg_prompt * 1.2), int(median_prompt * 1.5))  # 20% buffer on average or 50% on median
        recommended_output = max(int(avg_completion * 1.2), int(median_completion * 1.5))
        
        print("💡 RECOMMENDED ESTIMATES:")
        print(f"   ESTIMATED_INPUT_TOKENS = {recommended_input}")
        print(f"   ESTIMATED_OUTPUT_TOKENS = {recommended_output}")
        print()
        print("🔍 These estimates include a buffer for realistic usage scenarios")
        
        # Cost impact analysis
        chatlima_costs = [d['cost'] for d in chatlima_data if d['cost'] > 0]
        if chatlima_costs:
            avg_cost_per_request = statistics.mean(chatlima_costs)
            daily_cost_anon = avg_cost_per_request * 10
            daily_cost_google = avg_cost_per_request * 20
            monthly_cost_anon = daily_cost_anon * 30
            monthly_cost_google = daily_cost_google * 30
            
            print()
            print("💰 ACTUAL COST ANALYSIS (ChatLima):")
            print(f"   Average cost per request: ${avg_cost_per_request:.6f}")
            print(f"   Anonymous users (10/day): ${daily_cost_anon:.6f}/day, ${monthly_cost_anon:.4f}/month")
            print(f"   Google users (20/day): ${daily_cost_google:.6f}/day, ${monthly_cost_google:.4f}/month")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/analyze-openrouter-data.py /path/to/openrouter_activity.csv")
        sys.exit(1)
    
    csv_file_path = sys.argv[1]
    try:
        analyze_openrouter_data(csv_file_path)
    except FileNotFoundError:
        print(f"❌ Error: Could not find file {csv_file_path}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1) 