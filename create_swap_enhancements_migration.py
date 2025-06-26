#!/usr/bin/env python3
"""
Script to create and apply migrations for swap system enhancements
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

# Setup Django
django.setup()

def create_migrations():
    """Create migrations for the enhanced swap models"""
    print("🔄 Creating migrations for swap system enhancements...")
    
    # Create migrations
    execute_from_command_line(['manage.py', 'makemigrations', 'swaps'])
    
    print("✅ Migrations created successfully!")

def apply_migrations():
    """Apply the migrations"""
    print("🔄 Applying migrations...")
    
    # Apply migrations
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("✅ Migrations applied successfully!")

def populate_sample_locations():
    """Populate database with sample public locations"""
    from backend.swaps.models import Location
    
    print("🔄 Adding sample public locations...")
    
    sample_locations = [
        {
            'name': 'Central Public Library',
            'type': 'library',
            'coords': {'latitude': 40.7589, 'longitude': -73.9851},
            'city': 'New York',
            'address': '476 5th Ave, New York, NY 10018',
            'rating': 4.5,
            'safety_score': 5.0,
            'amenities': ['wifi', 'parking', 'security', 'restrooms'],
            'opening_hours': {
                'monday': '9:00-20:00',
                'tuesday': '9:00-20:00',
                'wednesday': '9:00-20:00',
                'thursday': '9:00-20:00',
                'friday': '9:00-18:00',
                'saturday': '10:00-17:00',
                'sunday': '13:00-17:00'
            },
            'verified': True,
            'popularity_score': 95.0
        },
        {
            'name': 'Starbucks Coffee - Times Square',
            'type': 'cafe',
            'coords': {'latitude': 40.7580, 'longitude': -73.9855},
            'city': 'New York',
            'address': '1585 Broadway, New York, NY 10036',
            'rating': 4.2,
            'safety_score': 4.5,
            'amenities': ['wifi', 'seating', 'restrooms'],
            'opening_hours': {
                'monday': '5:00-23:00',
                'tuesday': '5:00-23:00',
                'wednesday': '5:00-23:00',
                'thursday': '5:00-23:00',
                'friday': '5:00-23:00',
                'saturday': '5:30-23:00',
                'sunday': '5:30-23:00'
            },
            'verified': True,
            'popularity_score': 88.0
        },
        {
            'name': 'Barnes & Noble Union Square',
            'type': 'bookstore',
            'coords': {'latitude': 40.7359, 'longitude': -73.9911},
            'city': 'New York',
            'address': '33 E 17th St, New York, NY 10003',
            'rating': 4.3,
            'safety_score': 4.8,
            'amenities': ['wifi', 'cafe', 'seating', 'restrooms', 'parking'],
            'opening_hours': {
                'monday': '9:00-22:00',
                'tuesday': '9:00-22:00',
                'wednesday': '9:00-22:00',
                'thursday': '9:00-22:00',
                'friday': '9:00-22:00',
                'saturday': '9:00-22:00',
                'sunday': '10:00-21:00'
            },
            'verified': True,
            'popularity_score': 92.0
        },
        {
            'name': 'Grand Central Terminal',
            'type': 'train_station',
            'coords': {'latitude': 40.7527, 'longitude': -73.9772},
            'city': 'New York',
            'address': '89 E 42nd St, New York, NY 10017',
            'rating': 4.4,
            'safety_score': 4.2,
            'amenities': ['security', 'restrooms', 'food_court', 'shops'],
            'opening_hours': {
                'monday': '5:30-2:00',
                'tuesday': '5:30-2:00',
                'wednesday': '5:30-2:00',
                'thursday': '5:30-2:00',
                'friday': '5:30-2:00',
                'saturday': '5:30-2:00',
                'sunday': '5:30-2:00'
            },
            'verified': True,
            'popularity_score': 85.0
        },
        {
            'name': 'Columbia University - Butler Library',
            'type': 'school',
            'coords': {'latitude': 40.8075, 'longitude': -73.9626},
            'city': 'New York',
            'address': '535 W 114th St, New York, NY 10027',
            'rating': 4.6,
            'safety_score': 4.9,
            'amenities': ['wifi', 'study_rooms', 'security', 'restrooms'],
            'opening_hours': {
                'monday': '8:00-24:00',
                'tuesday': '8:00-24:00',
                'wednesday': '8:00-24:00',
                'thursday': '8:00-24:00',
                'friday': '8:00-22:00',
                'saturday': '9:00-22:00',
                'sunday': '9:00-24:00'
            },
            'verified': True,
            'popularity_score': 90.0
        }
    ]
    
    created_count = 0
    for location_data in sample_locations:
        location, created = Location.objects.get_or_create(
            name=location_data['name'],
            city=location_data['city'],
            defaults=location_data
        )
        if created:
            created_count += 1
            print(f"  ✅ Created: {location.name}")
        else:
            print(f"  ⏭️  Exists: {location.name}")
    
    print(f"✅ Added {created_count} new locations!")

def install_dependencies():
    """Install required Python packages"""
    print("🔄 Installing required dependencies...")
    
    dependencies = [
        'qrcode[pil]',
        'cryptography',
        'Pillow'
    ]
    
    for dep in dependencies:
        os.system(f"pip install {dep}")
    
    print("✅ Dependencies installed!")

def main():
    """Main function to run all setup steps"""
    print("🚀 Setting up Enhanced Swap System")
    print("=" * 50)
    
    try:
        # Install dependencies
        install_dependencies()
        
        # Create and apply migrations
        create_migrations()
        apply_migrations()
        
        # Populate sample data
        populate_sample_locations()
        
        print("\n" + "=" * 50)
        print("🎉 Enhanced Swap System Setup Complete!")
        print("\n📋 New Features Available:")
        print("  ✅ QR Code Generation & Scanning")
        print("  ✅ Advanced Public Place Discovery")
        print("  ✅ Deadline & Extension Management")
        print("  ✅ Location-based Verification")
        print("  ✅ Enhanced Midpoint Algorithm")
        print("\n🔗 New API Endpoints:")
        print("  • POST /api/swaps/{swap_id}/request-extension/")
        print("  • PATCH /api/swaps/extensions/{extension_id}/respond/")
        print("  • POST /api/swaps/{swap_id}/verify-qr/")
        print("  • GET /api/swaps/midpoint/ (enhanced)")
        print("\n🎯 Ready to test the enhanced swap system!")
        
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
