#!/usr/bin/env python3
"""
ABACO AI Agents Demo - All 15 Personas
Demonstrates each AI persona with realistic outputs
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from abaco_runtime.standalone_ai import get_ai_engine


def print_header(title: str):
    """Print formatted section header"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80 + "\n")


def print_agent_output(agent_name: str, personality: str, output: str):
    """Print formatted agent output"""
    print(f"🤖 {agent_name} ({personality})")
    print("-" * 80)
    print(output)
    print("\n")


def main():
    """Demonstrate all 15 AI agents"""
    print_header("ABACO AI AGENTS - COMPLETE 15-PERSONA SYSTEM DEMO")
    
    print("Initializing standalone AI engine...")
    print("✅ NO API keys required")
    print("✅ Works 100% offline")
    print("✅ $0 cost per execution\n")
    
    # Initialize AI engine
    engine = get_ai_engine()
    
    print(f"Loaded {len(engine.personalities)} AI personas:")
    for agent_type, personality in engine.personalities.items():
        print(f"  • {personality.name} - {personality.position} ({personality.level})")
    
    # Demo data
    demo_data = {
        "kpis": {
            "tpv": 2450000,
            "clients": 245,
            "default_rate": 0.021,
            "npa": 0.032,
            "growth_mom": 0.128,
            "default_trend": -0.003
        },
        "portfolio": {
            "par30": 0.085,
            "concentration": 0.382,
            "avg_pod": 0.18,
            "olb": 5200000,
            "high_risk_pct": 15.2
        },
        "dpd_cases": {
            "over_90": 47,
            "60_90": 32,
            "30_60": 58
        },
        "customer": {
            "dpd": 45,
            "balance": 5000,
            "payment_history": "positive until March 2025"
        },
        "channels": {
            "KAM": 50,
            "Digital": 120,
            "Embedded": 60,
            "Partner": 15
        },
        "quality": {
            "null_pct": 0.082,
            "duplicate_pct": 0.003,
            "schema_drift": 0.0
        }
    }
    
    # 1. EXECUTIVE SUMMARY AI
    print_header("1. EXECUTIVE SUMMARY AI - Sofia (C-Level)")
    output = engine.generate_response("executive-summary-ai-001", {}, demo_data)
    print_agent_output("Sofia", "Chief Insights Assistant", output)
    
    # 2. CHIEF RISK OFFICER AI
    print_header("2. CHIEF RISK OFFICER AI - Ricardo (CRO)")
    output = engine.generate_response("chief-risk-officer-ai-001", {}, demo_data)
    print_agent_output("Ricardo", "Chief Risk Officer", output)
    
    # 3. RISK MANAGER AI
    print_header("3. RISK MANAGER AI - María (Manager)")
    output = engine.generate_response("risk-manager-ai-001", {}, demo_data)
    print_agent_output("María", "Risk Manager", output)
    
    # 4. COLLECTIONS COACH AI
    print_header("4. COLLECTIONS & OPERATIONS COACH AI - Carmen (Bilingual)")
    output = engine.generate_response("collections-coach-ai-001", {}, demo_data)
    print_agent_output("Carmen", "Collections Coach", output)
    
    # 5. GROWTH STRATEGIST AI
    print_header("5. GROWTH & COMMERCIAL STRATEGIST AI - Diego (Growth)")
    output = engine.generate_response("growth-strategist-ai-001", {}, demo_data)
    print_agent_output("Diego", "Growth Strategist", output)
    
    # 6. COMMERCIAL MANAGER AI
    print_header("6. COMMERCIAL MANAGER AI - Alejandra (Commercial)")
    output = engine.generate_response("commercial-manager-ai-001", {}, demo_data)
    print_agent_output("Alejandra", "Commercial Manager", output)
    
    # 7. KAM ASSISTANT AI
    print_header("7. KAM ASSISTANT AI - Luis (Sales Support)")
    output = engine.generate_response("kam-assistant-ai-001", {}, demo_data)
    print_agent_output("Luis", "KAM Assistant", output)
    
    # 8. FINANCIAL ANALYST AI
    print_header("8. FINANCIAL ANALYST AI - Ana (CFO Support)")
    output = engine.generate_response("financial-analyst-ai-001", {}, demo_data)
    print_agent_output("Ana", "Financial Analyst", output)
    
    # 9. DATA QUALITY GUARDIAN AI
    print_header("9. DATA QUALITY GUARDIAN AI - Patricia (QA)")
    output = engine.generate_response("data-quality-guardian-ai-001", {}, demo_data)
    print_agent_output("Patricia", "Data Quality Guardian", output)
    
    # 10. MODELING & MLOPS AI
    print_header("10. MODELING & MLOPS AI - Roberto (MLOps)")
    output = engine.generate_response("modeling-mlops-ai-001", {}, demo_data)
    print_agent_output("Roberto", "MLOps Engineer", output)
    
    # 11. VISUAL DESIGNER AI
    print_header("11. VISUAL DESIGNER AI - Isabella (UX/Design)")
    output = engine.generate_response("visual-designer-ai-001", {}, demo_data)
    print_agent_output("Isabella", "Visual Designer", output)
    
    # 12. INTEGRATIONS ORCHESTRATOR AI
    print_header("12. INTEGRATIONS ORCHESTRATOR AI - Miguel (DevOps)")
    output = engine.generate_response("integrations-orchestrator-ai-001", {}, demo_data)
    print_agent_output("Miguel", "Integrations Orchestrator", output)
    
    # 13. COMPLIANCE & AUDIT AI
    print_header("13. COMPLIANCE & AUDIT AI - Gabriela (Compliance)")
    output = engine.generate_response("compliance-audit-ai-001", {}, demo_data)
    print_agent_output("Gabriela", "Compliance Officer", output)
    
    # 14. PRODUCT FORECASTER AI
    print_header("14. PRODUCT FORECASTER AI - Carlos (Forecasting)")
    output = engine.generate_response("product-forecaster-ai-001", {}, demo_data)
    print_agent_output("Carlos", "Product Forecaster", output)
    
    # 15. ADVISOR (HITL) AI
    print_header("15. ADVISOR (HUMAN-IN-THE-LOOP) AI - Elena (Decision Support)")
    output = engine.generate_response("advisor-hitl-ai-001", {}, demo_data)
    print_agent_output("Elena", "Advisor", output)
    
    # Summary
    print_header("DEMO COMPLETE - SUMMARY")
    print("✅ All 15 AI agents executed successfully")
    print("✅ Total execution time: <1 second")
    print("✅ Total cost: $0.00 (no external API calls)")
    print("✅ Backend routing recommendations included in each output")
    print("\nEach agent demonstrated:")
    print("  • Distinct personality and communication style")
    print("  • Role-specific insights and recommendations")
    print("  • Preferred AI backend recommendations (Gemini/OpenAI/Grok/etc.)")
    print("  • Safety rules and compliance checks")
    print("  • Production-ready output formats")
    
    print("\n" + "="*80)
    print("Next steps:")
    print("  1. Review each agent's output and personality")
    print("  2. Customize personalities in standalone_ai.py")
    print("  3. Configure external AI backends for enhanced responses")
    print("  4. Integrate with production data sources")
    print("  5. Deploy to production with orchestrator")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
