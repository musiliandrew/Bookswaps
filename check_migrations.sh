#!/bin/bash

echo "🔍 Checking for missing Django migrations..."

# Check if we're in a Docker environment
if command -v docker-compose &> /dev/null; then
    echo "📦 Using Docker environment"
    
    # Check if backend container is running
    if docker-compose ps backend | grep -q "Up"; then
        echo "✅ Backend container is running"
        
        # Check for missing migrations
        echo "🔍 Checking for missing migrations..."
        docker-compose exec backend python manage.py makemigrations --dry-run --verbosity=1
        
        if [ $? -eq 0 ]; then
            echo "📝 Creating any missing migrations..."
            docker-compose exec backend python manage.py makemigrations
            
            echo "🚀 Applying migrations..."
            docker-compose exec backend python manage.py migrate
            
            echo "✅ Migration check complete!"
        else
            echo "❌ Error checking migrations"
        fi
    else
        echo "⚠️  Backend container is not running. Starting it..."
        docker-compose up -d backend
        sleep 10
        
        echo "🔍 Checking for missing migrations..."
        docker-compose exec backend python manage.py makemigrations --dry-run --verbosity=1
        docker-compose exec backend python manage.py makemigrations
        docker-compose exec backend python manage.py migrate
    fi
else
    echo "🐍 Using local Python environment"
    
    # Check if we're in the backend directory
    if [ -f "manage.py" ]; then
        echo "✅ Found manage.py"
        
        echo "🔍 Checking for missing migrations..."
        python manage.py makemigrations --dry-run --verbosity=1
        
        echo "📝 Creating any missing migrations..."
        python manage.py makemigrations
        
        echo "🚀 Applying migrations..."
        python manage.py migrate
        
        echo "✅ Migration check complete!"
    elif [ -f "backend/manage.py" ]; then
        echo "✅ Found backend/manage.py"
        cd backend
        
        echo "🔍 Checking for missing migrations..."
        python manage.py makemigrations --dry-run --verbosity=1
        
        echo "📝 Creating any missing migrations..."
        python manage.py makemigrations
        
        echo "🚀 Applying migrations..."
        python manage.py migrate
        
        echo "✅ Migration check complete!"
    else
        echo "❌ Could not find manage.py. Please run this script from the project root or backend directory."
        exit 1
    fi
fi

echo ""
echo "🎉 Migration check completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Test your application: http://localhost:5173"
echo "   2. Check MinIO: ./restart_services.sh"
echo "   3. View logs: docker-compose logs -f backend"
