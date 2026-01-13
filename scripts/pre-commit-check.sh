#!/bin/bash

# Pre-commit check script for HLS Starter
# Only shows critical errors that would break the build

set -e

echo "🔍 Running pre-commit checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Format check (with Turbo cache)
echo "🎨 Checking code formatting..."
if pnpm run turbo:format:check > /dev/null 2>&1; then
    print_status "Code formatting is correct"
else
    print_warning "Code formatting issues found - run 'pnpm run format:write' to fix"
    pnpm run turbo:format:check 2>&1 | grep -E "(error|Error|✖|diff|warning)" | head -5
fi

# 2. ESLint check (with Turbo cache)
echo "📝 Running ESLint checks..."
if pnpm run turbo:lint > /dev/null 2>&1; then
    print_status "No linting errors found"
else
    print_error "Linting errors found - fix before committing"
    pnpm run turbo:lint 2>&1 | grep -E "(error|Error)" | head -5
    exit 1
fi

# 3. TypeScript compilation check (with Turbo cache)
echo "🔧 Checking TypeScript compilation..."
if pnpm run turbo:type-check > /dev/null 2>&1; then
    print_status "TypeScript compilation passed"
else
    print_error "TypeScript compilation failed - fix before committing"
    pnpm run turbo:type-check 2>&1 | grep -E "(error TS|Error)" | head -5
    exit 1
fi

print_status "All pre-commit checks passed! 🎉"
echo "Ready to commit."
