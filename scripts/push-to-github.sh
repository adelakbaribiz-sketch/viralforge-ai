#!/bin/bash
# =============================================================================
# ViralForge AI — Push to GitHub
# =============================================================================
# This script creates a private GitHub repository and pushes the local commits.
# Run it after providing a GitHub Personal Access Token (PAT) with `repo` scope.
#
# Usage:
#   export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
#   ./scripts/push-to-github.sh [GITHUB_USERNAME]
#
# If the username is omitted, the script uses the user authenticated with the token.
# =============================================================================

set -e
cd "$(dirname "$0")/.."  # project root

# Validate token
if [ -z "$GH_TOKEN" ] && [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: Set GH_TOKEN (or GITHUB_TOKEN) environment variable to a GitHub PAT with 'repo' scope."
  echo "  export GH_TOKEN=ghp_xxx"
  echo "  ./scripts/push-to-github.sh your-username"
  exit 1
fi
TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"

# Get the GitHub username from the token (if not provided)
USERNAME="${1:-}"
if [ -z "$USERNAME" ]; then
  USERNAME=$(curl -fsSL -H "Authorization: token $TOKEN" https://api.github.com/user | grep -o '"login": *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"/\1/')
  if [ -z "$USERNAME" ]; then
    echo "ERROR: Could not determine GitHub username from token. Provide it as the first arg."
    exit 1
  fi
  echo "Detected GitHub username: $USERNAME"
fi

REPO="viralforge-ai"
DESCRIPTION="Cinematic AI video studio for teams that ship daily. Multi-tenant SaaS for AI-generated short-form viral videos."

echo "==> Creating private repository $USERNAME/$REPO..."

# Create the private repo (409 = already exists; we ignore that)
RESP=$(curl -fsSL -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO\",\"description\":\"$DESCRIPTION\",\"private\":true,\"has_issues\":true,\"has_wiki\":false}" 2>&1 || true)

if echo "$RESP" | grep -q '"already exists"'; then
  echo "Repository already exists, reusing it."
elif echo "$RESP" | grep -q '"message"'; then
  echo "ERROR creating repository:"
  echo "$RESP"
  exit 1
fi

echo "==> Setting remote to https://github.com/$USERNAME/$REPO.git"
git remote remove origin 2>/dev/null || true
git remote add origin "https://$USERNAME:$TOKEN@github.com/$USERNAME/$REPO.git"

echo "==> Pushing main branch..."
git push -u origin main

echo ""
echo "✓ Done. Your repo is at https://github.com/$USERNAME/$REPO"
echo ""
echo "NOTE: This script embedded the token in the remote URL for convenience."
echo "To avoid storing the token in .git/config, reset the remote afterward:"
echo "  git remote set-url origin https://github.com/$USERNAME/$REPO.git"
