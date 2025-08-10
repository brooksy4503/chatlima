#!/bin/bash

# Anonymous User Cleanup Wrapper Script
# 
# This script provides an easy-to-use wrapper around the TypeScript cleanup script
# with common usage patterns and safety checks.
#
# Usage:
#   ./scripts/run-cleanup.sh preview           # Safe preview mode
#   ./scripts/run-cleanup.sh interactive       # Interactive execution
#   ./scripts/run-cleanup.sh execute [options] # Direct execution
#   ./scripts/run-cleanup.sh help              # Show help

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Default values
DEFAULT_DAYS=45
DEFAULT_BATCH_SIZE=50

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
        log_error "Must be run from the project root directory"
        exit 1
    fi
    
    # Check if pnpm is available
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is required but not installed"
        exit 1
    fi
    
    # Check if the cleanup script exists
    if [[ ! -f "$SCRIPT_DIR/cleanup-anonymous-users.ts" ]]; then
        log_error "cleanup-anonymous-users.ts script not found"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Show help
show_help() {
    cat << EOF
Anonymous User Cleanup Wrapper Script

DESCRIPTION:
    Easy-to-use wrapper for the anonymous user cleanup functionality.
    Provides common usage patterns with built-in safety checks.

USAGE:
    $0 <command> [options]

COMMANDS:
    preview              Run in safe preview mode (no data changes)
    interactive          Run with interactive confirmation prompts
    execute [options]    Execute cleanup with specified options
    help                 Show this help message

PREVIEW MODE:
    $0 preview [--days=N] [--verbose]
    
    Examples:
        $0 preview                    # Preview with default settings (45 days)
        $0 preview --days=30          # Preview with 30-day threshold
        $0 preview --verbose          # Preview with detailed logging

INTERACTIVE MODE:
    $0 interactive [--days=N] [--batch-size=N] [--verbose]
    
    Examples:
        $0 interactive                # Interactive with default settings
        $0 interactive --days=60      # Interactive with 60-day threshold
        
EXECUTE MODE (requires explicit confirmation):
    $0 execute --confirm [--days=N] [--batch-size=N] [--verbose]
    
    Examples:
        $0 execute --confirm                           # Execute with defaults
        $0 execute --confirm --days=30 --batch-size=25 # Custom settings
        
OPTIONS:
    --days=N             Inactivity threshold in days (7-365, default: $DEFAULT_DAYS)
    --batch-size=N       Users to process per batch (1-100, default: $DEFAULT_BATCH_SIZE)
    --verbose            Enable detailed logging
    --confirm            Required for execute mode (safety measure)

SAFETY FEATURES:
    - Preview mode never modifies data
    - Interactive mode requires multiple confirmations
    - Execute mode requires explicit --confirm flag
    - All operations respect minimum age protection (7 days)
    - Comprehensive logging and error handling

EXAMPLES:
    # Safe operations
    $0 preview                                    # See what would be deleted
    $0 preview --days=30 --verbose               # Detailed preview with 30-day threshold
    
    # Interactive execution
    $0 interactive                                # Run with prompts
    $0 interactive --days=60                      # Custom threshold with prompts
    
    # Automated execution (use with caution)
    $0 execute --confirm                          # Execute with defaults
    $0 execute --confirm --days=45 --batch-size=25 # Custom execution

For more information, see: docs/anonymous-user-cleanup-plan.md
EOF
}

# Parse options for a given command
parse_options() {
    local cmd="$1"
    shift
    
    local days=""
    local batch_size=""
    local verbose=""
    local confirm=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --days=*)
                days="${1#*=}"
                if ! [[ "$days" =~ ^[0-9]+$ ]] || [ "$days" -lt 7 ] || [ "$days" -gt 365 ]; then
                    log_error "Invalid --days value: $days (must be 7-365)"
                    exit 1
                fi
                ;;
            --batch-size=*)
                batch_size="${1#*=}"
                if ! [[ "$batch_size" =~ ^[0-9]+$ ]] || [ "$batch_size" -lt 1 ] || [ "$batch_size" -gt 100 ]; then
                    log_error "Invalid --batch-size value: $batch_size (must be 1-100)"
                    exit 1
                fi
                ;;
            --verbose)
                verbose="--verbose"
                ;;
            --confirm)
                confirm="--confirm"
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
        shift
    done
    
    # Set defaults
    days="${days:-$DEFAULT_DAYS}"
    batch_size="${batch_size:-$DEFAULT_BATCH_SIZE}"
    
    # Build command arguments
    local args="--days=$days --batch-size=$batch_size $verbose"
    
    case "$cmd" in
        preview)
            args="--preview $args"
            ;;
        interactive)
            args="--interactive $args"
            ;;
        execute)
            if [[ -z "$confirm" ]]; then
                log_error "Execute mode requires --confirm flag for safety"
                log_warning "Use: $0 execute --confirm [other options]"
                exit 1
            fi
            args="$args $confirm"
            ;;
    esac
    
    echo "$args"
}

# Execute the cleanup script
run_cleanup() {
    local args="$1"
    
    log_info "Executing cleanup script with arguments: $args"
    log_info "Working directory: $PROJECT_DIR"
    
    cd "$PROJECT_DIR"
    
    # Execute the TypeScript script
    pnpm exec tsx scripts/cleanup-anonymous-users.ts $args
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Cleanup script completed successfully"
    else
        log_error "Cleanup script failed with exit code: $exit_code"
        exit $exit_code
    fi
}

# Main execution
main() {
    if [[ $# -eq 0 ]]; then
        log_error "No command specified"
        echo ""
        show_help
        exit 1
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        preview)
            check_prerequisites
            log_info "Running cleanup preview..."
            args=$(parse_options "preview" "$@")
            run_cleanup "$args"
            ;;
            
        interactive)
            check_prerequisites
            log_warning "Running interactive cleanup (will prompt for confirmation)"
            args=$(parse_options "interactive" "$@")
            run_cleanup "$args"
            ;;
            
        execute)
            check_prerequisites
            log_warning "Running automated cleanup execution"
            args=$(parse_options "execute" "$@")
            run_cleanup "$args"
            ;;
            
        help|--help|-h)
            show_help
            ;;
            
        *)
            log_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}[WARNING]${NC} Script interrupted by user. Exiting safely..."; exit 130' INT

# Run main function
main "$@"
