#!/bin/bash

# Setup Git to commit as CodeRabbit
# This script configures your local git to make commits as @coderabbit

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         CODERABBIT GIT IDENTITY SETUP                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check current git config
echo "📋 Current Git Configuration:"
echo "   Name:  $(git config user.name)"
echo "   Email: $(git config user.email)"
echo ""

# Prompt for confirmation
read -p "Do you want to configure this repository to commit as CodeRabbit? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "🔧 Configuring git identity for this repository..."

# Set CodeRabbit as the author (repository-level config)
git config user.name "CodeRabbit"
git config user.email "coderabbit@users.noreply.github.com"

echo "✅ Git configured successfully!"
echo ""
echo "📋 New Configuration:"
echo "   Name:  $(git config user.name)"
echo "   Email: $(git config user.email)"
echo ""
echo "🔑 IMPORTANT: To push as @coderabbit, you need:"
echo ""
echo "   1. Create a GitHub Personal Access Token (PAT) for CodeRabbit account:"
echo "      → Go to: https://github.com/settings/tokens/new"
echo "      → Token name: 'ABT Repository Access'"
echo "      → Expiration: No expiration (or your preference)"
echo "      → Scopes: Select 'repo' (Full control of private repositories)"
echo "      → Click 'Generate token'"
echo "      → COPY THE TOKEN IMMEDIATELY!"
echo ""
echo "   2. Add token to GitHub Secrets:"
echo "      → Go to: https://github.com/JenineferDeras/ABT/settings/secrets/actions"
echo "      → Click 'New repository secret'"
echo "      → Name: CODERABBIT_PAT"
echo "      → Value: [paste your CodeRabbit PAT]"
echo ""
echo "   3. Update GitHub Actions workflows to use the PAT:"
echo "      → Modify .github/workflows/*.yml files"
echo "      → Replace push commands with:"
echo "         git push https://x-access-token:\${{ secrets.CODERABBIT_PAT }}@github.com/\${{ github.repository }}"
echo ""
echo "📝 NOTE: This only affects LOCAL commits from this repository."
echo "   To commit as yourself again, run:"
echo "      git config user.name \"Your Name\""
echo "      git config user.email \"your-email@example.com\""
echo ""
echo "   Or to use global config:"
echo "      git config --unset user.name"
echo "      git config --unset user.email"
echo ""
