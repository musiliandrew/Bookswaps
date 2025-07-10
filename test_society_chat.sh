#!/bin/bash

# Society Chat Testing Script
# Automates testing of society chat functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker containers are running
check_containers() {
    print_status "Checking if Docker containers are running..."
    
    if ! docker ps | grep -q "book_swap-backend"; then
        print_error "Backend container is not running!"
        print_status "Starting development environment..."
        ./dev-local.sh start
        sleep 10
    else
        print_success "Backend container is running"
    fi
}

# Function to run the Django management command
run_test() {
    local society_name="${1:-Test Book Society 181743}"
    local cleanup_flag="$2"
    
    print_status "Running society chat test..."
    print_status "Society: $society_name"
    
    # Build the command
    local cmd="python manage.py test_society_chat --society-name=\"$society_name\""
    
    if [ "$cleanup_flag" = "--cleanup" ]; then
        cmd="$cmd --cleanup"
        print_status "Cleanup mode enabled"
    fi
    
    # Execute the command in the backend container
    if docker ps | grep -q "book_swap-backend"; then
        print_status "Executing test in Docker container..."
        docker exec book_swap-backend-1 bash -c "cd /app && $cmd"
    else
        print_status "Executing test locally..."
        eval "$cmd"
    fi
}

# Function to show usage
show_usage() {
    echo "Society Chat Testing Script"
    echo ""
    echo "Usage: $0 [OPTIONS] [SOCIETY_NAME]"
    echo ""
    echo "Options:"
    echo "  --cleanup     Clean up test data after testing"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Test default society"
    echo "  $0 \"My Book Club\"                    # Test specific society"
    echo "  $0 --cleanup                         # Test and cleanup"
    echo "  $0 --cleanup \"Test Book Society\"     # Test specific society and cleanup"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "manage.py" ]; then
        print_error "manage.py not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to show test results
show_results() {
    print_success "✅ Society Chat Test Completed!"
    echo ""
    print_status "What to check now:"
    echo "  1. Open your browser and go to http://localhost:5173"
    echo "  2. Navigate to Chat → Groups"
    echo "  3. Look for the test society"
    echo "  4. Open the society chat"
    echo "  5. You should see new messages from the test user"
    echo ""
    print_status "Expected messages:"
    echo "  • Introduction message with emojis"
    echo "  • Reply with @mention (if existing messages found)"
    echo "  • Discussion starter or farewell message"
    echo ""
    print_warning "Note: If you used --cleanup, the test user will be deleted but messages remain"
}

# Main script logic
main() {
    echo "🧪 Society Chat Automation Test"
    echo "================================"
    
    # Parse arguments
    society_name=""
    cleanup_flag=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --cleanup)
                cleanup_flag="--cleanup"
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                society_name="$1"
                shift
                ;;
        esac
    done
    
    # Set default society name if not provided
    if [ -z "$society_name" ]; then
        society_name="Test Book Society 181743"
    fi
    
    # Run the test
    check_prerequisites
    check_containers
    run_test "$society_name" "$cleanup_flag"
    show_results
}

# Run main function with all arguments
main "$@"
