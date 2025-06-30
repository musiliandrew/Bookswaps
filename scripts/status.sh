#!/bin/bash

# BookSwaps Status Dashboard
# Comprehensive status check for all services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/bookswaps"
COMPOSE_FILE="docker-compose.prod.yml"

# Functions
print_header() {
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    📚 BookSwaps Status Dashboard             ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo -e "${CYAN}▶ $1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

check_service_status() {
    local service=$1
    local status=$(docker-compose -f $COMPOSE_FILE ps $service 2>/dev/null | grep "Up" | wc -l)
    
    if [ $status -eq 1 ]; then
        echo -e "  ${GREEN}✓${NC} $service: ${GREEN}Running${NC}"
        return 0
    else
        echo -e "  ${RED}✗${NC} $service: ${RED}Stopped${NC}"
        return 1
    fi
}

check_service_health() {
    local service=$1
    local health=$(docker-compose -f $COMPOSE_FILE ps $service 2>/dev/null | grep "healthy" | wc -l)
    
    if [ $health -eq 1 ]; then
        echo -e "  ${GREEN}♥${NC} $service: ${GREEN}Healthy${NC}"
        return 0
    else
        local unhealthy=$(docker-compose -f $COMPOSE_FILE ps $service 2>/dev/null | grep "unhealthy" | wc -l)
        if [ $unhealthy -eq 1 ]; then
            echo -e "  ${RED}♥${NC} $service: ${RED}Unhealthy${NC}"
        else
            echo -e "  ${YELLOW}♥${NC} $service: ${YELLOW}No health check${NC}"
        fi
        return 1
    fi
}

check_url() {
    local url=$1
    local name=$2
    
    if curl -f -s -o /dev/null --max-time 10 "$url"; then
        echo -e "  ${GREEN}✓${NC} $name: ${GREEN}Accessible${NC}"
        return 0
    else
        echo -e "  ${RED}✗${NC} $name: ${RED}Not accessible${NC}"
        return 1
    fi
}

get_container_stats() {
    local service=$1
    local container_id=$(docker-compose -f $COMPOSE_FILE ps -q $service 2>/dev/null)
    
    if [ -n "$container_id" ]; then
        local stats=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}" $container_id 2>/dev/null | tail -n 1)
        echo -e "  ${BLUE}📊${NC} $service: $stats"
    else
        echo -e "  ${RED}📊${NC} $service: Container not found"
    fi
}

check_disk_space() {
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    local available=$(df -h / | awk 'NR==2 {print $4}')
    
    if [ $usage -lt 80 ]; then
        echo -e "  ${GREEN}✓${NC} Disk Usage: ${GREEN}${usage}%${NC} (${available} available)"
    elif [ $usage -lt 90 ]; then
        echo -e "  ${YELLOW}⚠${NC} Disk Usage: ${YELLOW}${usage}%${NC} (${available} available)"
    else
        echo -e "  ${RED}✗${NC} Disk Usage: ${RED}${usage}%${NC} (${available} available)"
    fi
}

check_memory() {
    local total=$(free -h | awk 'NR==2{print $2}')
    local used=$(free -h | awk 'NR==2{print $3}')
    local available=$(free -h | awk 'NR==2{print $7}')
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ $usage -lt 80 ]; then
        echo -e "  ${GREEN}✓${NC} Memory: ${GREEN}${used}/${total}${NC} (${available} available)"
    elif [ $usage -lt 90 ]; then
        echo -e "  ${YELLOW}⚠${NC} Memory: ${YELLOW}${used}/${total}${NC} (${available} available)"
    else
        echo -e "  ${RED}✗${NC} Memory: ${RED}${used}/${total}${NC} (${available} available)"
    fi
}

check_load_average() {
    local load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cores=$(nproc)
    local load_percent=$(echo "$load * 100 / $cores" | bc -l | cut -d. -f1)
    
    if [ $load_percent -lt 70 ]; then
        echo -e "  ${GREEN}✓${NC} Load Average: ${GREEN}${load}${NC} (${cores} cores)"
    elif [ $load_percent -lt 90 ]; then
        echo -e "  ${YELLOW}⚠${NC} Load Average: ${YELLOW}${load}${NC} (${cores} cores)"
    else
        echo -e "  ${RED}✗${NC} Load Average: ${RED}${load}${NC} (${cores} cores)"
    fi
}

check_ssl_certificate() {
    local domain=$1
    
    if [ -n "$domain" ]; then
        local expiry=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry" +%s)
        local current_epoch=$(date +%s)
        local days_left=$(( (expiry_epoch - current_epoch) / 86400 ))
        
        if [ $days_left -gt 30 ]; then
            echo -e "  ${GREEN}✓${NC} SSL Certificate: ${GREEN}Valid${NC} (${days_left} days left)"
        elif [ $days_left -gt 7 ]; then
            echo -e "  ${YELLOW}⚠${NC} SSL Certificate: ${YELLOW}Expires soon${NC} (${days_left} days left)"
        else
            echo -e "  ${RED}✗${NC} SSL Certificate: ${RED}Expires very soon${NC} (${days_left} days left)"
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} SSL Certificate: ${YELLOW}Domain not configured${NC}"
    fi
}

check_database_connection() {
    local db_status=$(docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U bookswaps 2>/dev/null)
    
    if echo "$db_status" | grep -q "accepting connections"; then
        echo -e "  ${GREEN}✓${NC} Database Connection: ${GREEN}OK${NC}"
        
        # Check database size
        local db_size=$(docker-compose -f $COMPOSE_FILE exec -T postgres psql -U bookswaps -d bookswaps -t -c "SELECT pg_size_pretty(pg_database_size('bookswaps'));" 2>/dev/null | xargs)
        echo -e "  ${BLUE}📊${NC} Database Size: $db_size"
        
        # Check table counts
        local user_count=$(docker-compose -f $COMPOSE_FILE exec -T postgres psql -U bookswaps -d bookswaps -t -c "SELECT COUNT(*) FROM users_customuser;" 2>/dev/null | xargs)
        local book_count=$(docker-compose -f $COMPOSE_FILE exec -T postgres psql -U bookswaps -d bookswaps -t -c "SELECT COUNT(*) FROM library_book;" 2>/dev/null | xargs)
        echo -e "  ${BLUE}👥${NC} Users: $user_count"
        echo -e "  ${BLUE}📚${NC} Books: $book_count"
    else
        echo -e "  ${RED}✗${NC} Database Connection: ${RED}Failed${NC}"
    fi
}

check_redis_connection() {
    local redis_status=$(docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping 2>/dev/null)
    
    if [ "$redis_status" = "PONG" ]; then
        echo -e "  ${GREEN}✓${NC} Redis Connection: ${GREEN}OK${NC}"
        
        # Check Redis memory usage
        local redis_memory=$(docker-compose -f $COMPOSE_FILE exec -T redis redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
        echo -e "  ${BLUE}📊${NC} Redis Memory: $redis_memory"
    else
        echo -e "  ${RED}✗${NC} Redis Connection: ${RED}Failed${NC}"
    fi
}

check_recent_logs() {
    echo -e "  ${BLUE}📝${NC} Recent Error Logs (last 10 minutes):"
    
    local error_count=$(docker-compose -f $COMPOSE_FILE logs --since=10m 2>/dev/null | grep -i error | wc -l)
    local warning_count=$(docker-compose -f $COMPOSE_FILE logs --since=10m 2>/dev/null | grep -i warning | wc -l)
    
    if [ $error_count -eq 0 ] && [ $warning_count -eq 0 ]; then
        echo -e "    ${GREEN}✓${NC} No errors or warnings found"
    else
        echo -e "    ${RED}✗${NC} Errors: $error_count, Warnings: $warning_count"
        if [ $error_count -gt 0 ]; then
            echo -e "    ${RED}Recent errors:${NC}"
            docker-compose -f $COMPOSE_FILE logs --since=10m 2>/dev/null | grep -i error | tail -3 | sed 's/^/      /'
        fi
    fi
}

# Main status check
main() {
    cd $APP_DIR
    
    print_header
    
    # System Resources
    print_section "System Resources"
    check_disk_space
    check_memory
    check_load_average
    echo ""
    
    # Service Status
    print_section "Service Status"
    services=("postgres" "redis" "minio" "backend" "frontend" "nginx" "celery" "celery-beat")
    for service in "${services[@]}"; do
        check_service_status $service
    done
    echo ""
    
    # Health Checks
    print_section "Health Checks"
    for service in "${services[@]}"; do
        check_service_health $service
    done
    echo ""
    
    # Container Statistics
    print_section "Container Statistics"
    for service in "${services[@]}"; do
        get_container_stats $service
    done
    echo ""
    
    # Network Connectivity
    print_section "Network Connectivity"
    check_url "http://localhost/" "Frontend (HTTP)"
    check_url "http://localhost/api/health/" "Backend API"
    
    # Check external domain if configured
    domain=$(grep DOMAIN_NAME .env.production 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "")
    if [ -n "$domain" ] && [ "$domain" != "your-domain.com" ]; then
        check_url "https://$domain" "External Domain (HTTPS)"
        check_ssl_certificate "$domain"
    fi
    echo ""
    
    # Database & Cache
    print_section "Database & Cache"
    check_database_connection
    check_redis_connection
    echo ""
    
    # Recent Logs
    print_section "Recent Activity"
    check_recent_logs
    echo ""
    
    # Summary
    print_section "Summary"
    echo -e "  ${GREEN}✓${NC} Status check completed at $(date)"
    echo -e "  ${BLUE}📊${NC} Uptime: $(uptime -p)"
    echo -e "  ${BLUE}🔄${NC} Last deployment: $(docker-compose -f $COMPOSE_FILE ps --format 'table {{.CreatedAt}}' | tail -n 1 | head -n 1)"
    echo ""
}

# Run status check
main "$@"
