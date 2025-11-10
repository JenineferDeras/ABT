#!/usr/bin/env python3
"""
Test Hugging Face Integration
Usage: python3 scripts/test-huggingface.py
"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Color output helpers
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    RED = '\033[31m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'

def log(color, message):
    print(f"{color}{message}{Colors.RESET}")

def test_huggingface_env():
    """Check if Hugging Face token is configured"""
    log(Colors.CYAN, "\n" + "━" * 60)
    log(Colors.CYAN, "🤗 Testing Hugging Face Environment")
    log(Colors.CYAN, "━" * 60)
    
    token = os.getenv('HUGGINGFACE_TOKEN') or os.getenv('HF_TOKEN')
    
    if not token or '...' in token or '${' in token:
        log(Colors.RED, "❌ HUGGINGFACE_TOKEN not set or is placeholder")
        log(Colors.YELLOW, "\n💡 To fix:")
        log(Colors.YELLOW, "   1. Get token from: https://huggingface.co/settings/tokens")
        log(Colors.YELLOW, "   2. Add to .env.local: HUGGINGFACE_TOKEN=hf_xxxxx")
        log(Colors.YELLOW, "   3. Or run: ./scripts/sync-secrets.sh")
        return False
    
    log(Colors.GREEN, f"✅ HUGGINGFACE_TOKEN is set ({token[:10]}...)")
    return True

def test_huggingface_transformers():
    """Test Hugging Face transformers library"""
    log(Colors.CYAN, "\n" + "━" * 60)
    log(Colors.CYAN, "🤖 Testing Hugging Face Transformers")
    log(Colors.CYAN, "━" * 60)
    
    try:
        from transformers import pipeline
        
        log(Colors.BLUE, "Loading sentiment analysis pipeline...")
        classifier = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
        
        test_text = "I love testing AI integrations!"
        log(Colors.BLUE, f"Test input: '{test_text}'")
        
        result = classifier(test_text)[0]
        
        log(Colors.GREEN, "✅ Transformers test successful!")
        log(Colors.BLUE, f"Result: {result['label']} (confidence: {result['score']:.2%})")
        return True
        
    except ImportError:
        log(Colors.RED, "❌ transformers library not installed")
        log(Colors.YELLOW, "\n💡 Install with:")
        log(Colors.YELLOW, "   .venv/bin/pip install transformers torch")
        return False
    except Exception as e:
        log(Colors.RED, f"❌ Transformers test failed: {str(e)}")
        return False

def test_huggingface_api():
    """Test Hugging Face Inference API"""
    log(Colors.CYAN, "\n" + "━" * 60)
    log(Colors.CYAN, "🌐 Testing Hugging Face Inference API")
    log(Colors.CYAN, "━" * 60)
    
    token = os.getenv('HUGGINGFACE_TOKEN') or os.getenv('HF_TOKEN')
    
    if not token or '...' in token or '${' in token:
        log(Colors.YELLOW, "⚠️  Skipping API test (no token)")
        return False
    
    try:
        import requests
        
        API_URL = "https://api-inference.huggingface.co/models/gpt2"
        headers = {"Authorization": f"Bearer {token}"}
        
        payload = {
            "inputs": "The future of AI is",
            "parameters": {"max_length": 30}
        }
        
        log(Colors.BLUE, f"Calling Hugging Face API: {API_URL}")
        response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            log(Colors.GREEN, "✅ Hugging Face API call successful!")
            log(Colors.BLUE, f"Generated text: {result[0]['generated_text']}")
            return True
        else:
            log(Colors.RED, f"❌ API returned status {response.status_code}")
            log(Colors.RED, f"Response: {response.text}")
            return False
            
    except ImportError:
        log(Colors.YELLOW, "⚠️  requests library not installed (skipping API test)")
        return False
    except Exception as e:
        log(Colors.RED, f"❌ API test failed: {str(e)}")
        return False

def main():
    log(Colors.CYAN, "\n╔══════════════════════════════════════════════════════╗")
    log(Colors.CYAN, "║     Hugging Face Integration Test Suite             ║")
    log(Colors.CYAN, "╚══════════════════════════════════════════════════════╝")
    
    results = {
        'environment': test_huggingface_env(),
        'transformers': test_huggingface_transformers(),
        'api': test_huggingface_api(),
    }
    
    # Summary
    log(Colors.CYAN, "\n" + "━" * 60)
    log(Colors.CYAN, "📊 Test Summary")
    log(Colors.CYAN, "━" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        color = Colors.GREEN if passed else Colors.RED
        log(color, f"{status} - {test_name.upper()}")
    
    passed_count = sum(results.values())
    total_count = len(results)
    
    log(Colors.CYAN, "\n" + "━" * 60)
    if passed_count == total_count:
        log(Colors.GREEN, f"✅ All {passed_count}/{total_count} tests passed!")
    else:
        log(Colors.YELLOW, f"⚠️  {passed_count}/{total_count} tests passed")
    log(Colors.CYAN, "━" * 60 + "\n")
    
    sys.exit(0 if passed_count == total_count else 1)

if __name__ == "__main__":
    main()
