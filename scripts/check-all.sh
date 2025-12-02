#!/bin/bash

# Script to check linting and run tests for both backend and frontend
# Usage: ./scripts/check-all.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Track if any step fails
FAILED=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TaskPlex - Full Check Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print section header
print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
    FAILED=1
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ============================================
# BACKEND LINTING
# ============================================
print_section "Backend Linting (Ruff)"

cd "$PROJECT_ROOT/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_error "Virtual environment not found. Please create it first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if ruff is installed
if ! command -v ruff &> /dev/null; then
    print_error "Ruff is not installed. Please install it: pip install ruff"
    exit 1
fi

echo "Running ruff format..."
if ruff format .; then
    print_success "Ruff format completed"
else
    print_error "Ruff format failed"
fi

echo "Running ruff check --fix..."
if ruff check --fix .; then
    print_success "Ruff check --fix completed"
else
    print_error "Ruff check --fix failed"
fi

# ============================================
# FRONTEND TYPE CHECKING
# ============================================
print_section "Frontend Type Checking (TypeScript)"

cd "$PROJECT_ROOT/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Check if tsc is available
if ! npx tsc --version &> /dev/null; then
    print_warning "TypeScript compiler not found, skipping type check"
else
    echo "Running TypeScript type check (tsc --noEmit)..."
    TYPE_CHECK_OUTPUT=$(npx tsc --noEmit 2>&1)
    TYPE_CHECK_EXIT_CODE=$?
    
    if [ $TYPE_CHECK_EXIT_CODE -ne 0 ]; then
        print_error "TypeScript type check failed"
        echo "$TYPE_CHECK_OUTPUT" | grep -E "error TS|error:" | head -20
    else
        print_success "TypeScript type check passed"
    fi
fi

# ============================================
# FRONTEND LINTING
# ============================================
print_section "Frontend Linting (ESLint)"

cd "$PROJECT_ROOT/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

echo "Running eslint..."
if npm run lint; then
    print_success "ESLint check completed"
else
    print_error "ESLint check failed"
fi

# ============================================
# BACKEND TESTS
# ============================================
print_section "Backend Tests (Pytest)"

cd "$PROJECT_ROOT/backend"

# Ensure virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    source venv/bin/activate
fi

# Check if pytest is installed
if ! python -m pytest --version &> /dev/null; then
    print_error "Pytest is not installed. Please install it: pip install pytest"
    exit 1
fi

echo "Running pytest..."
if python -m pytest tests/ -v; then
    print_success "Backend tests passed"
else
    print_error "Backend tests failed"
fi

# ============================================
# FRONTEND TESTS
# ============================================
print_section "Frontend Tests (Vitest)"

cd "$PROJECT_ROOT/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

echo "Running vitest..."
if npm test; then
    print_success "Frontend tests passed"
else
    print_error "Frontend tests failed"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo -e "${BLUE}========================================${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo -e "${BLUE}========================================${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed${NC}"
    echo -e "${BLUE}========================================${NC}"
    exit 1
fi

