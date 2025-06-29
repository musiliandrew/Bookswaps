#!/usr/bin/env python
"""
Test script for Open Library integration
"""
import os
import sys
import django
from django.conf import settings

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import requests
import json
from backend.library.views import OpenLibrarySearchView

def test_open_library_api():
    """Test direct Open Library API calls"""
    print("🔍 Testing Open Library API Integration...")
    print("=" * 50)
    
    # Test 1: Search by title
    print("\n1. Testing title search: 'Harry Potter'")
    try:
        url = "https://openlibrary.org/search.json"
        params = {
            'title': 'Harry Potter',
            'limit': 3,
            'fields': 'key,title,author_name,first_publish_year,isbn,cover_i'
        }
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        books = data.get('docs', [])
        
        print(f"✅ Found {len(books)} books")
        for i, book in enumerate(books[:2], 1):
            print(f"   {i}. {book.get('title', 'No title')} by {', '.join(book.get('author_name', ['Unknown']))}")
            if book.get('first_publish_year'):
                print(f"      Published: {book['first_publish_year']}")
            if book.get('cover_i'):
                print(f"      Cover: https://covers.openlibrary.org/b/id/{book['cover_i']}-L.jpg")
    except Exception as e:
        print(f"❌ Title search failed: {e}")
    
    # Test 2: Search by ISBN
    print("\n2. Testing ISBN search: '9780439708180' (Harry Potter)")
    try:
        isbn = "9780439708180"
        url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        book_data = data.get(f"ISBN:{isbn}", {})
        
        if book_data:
            print(f"✅ Found book: {book_data.get('title', 'No title')}")
            authors = [author.get('name', '') for author in book_data.get('authors', [])]
            print(f"   Authors: {', '.join(authors) if authors else 'Unknown'}")
            print(f"   Publish Date: {book_data.get('publish_date', 'Unknown')}")
            if book_data.get('cover'):
                print(f"   Cover: {book_data['cover'].get('large', 'No cover')}")
        else:
            print("❌ No book found for this ISBN")
    except Exception as e:
        print(f"❌ ISBN search failed: {e}")
    
    # Test 3: Search by author
    print("\n3. Testing author search: 'J.K. Rowling'")
    try:
        url = "https://openlibrary.org/search.json"
        params = {
            'author': 'J.K. Rowling',
            'limit': 3,
            'fields': 'key,title,author_name,first_publish_year'
        }
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        books = data.get('docs', [])
        
        print(f"✅ Found {len(books)} books")
        for i, book in enumerate(books[:2], 1):
            print(f"   {i}. {book.get('title', 'No title')} ({book.get('first_publish_year', 'Unknown year')})")
    except Exception as e:
        print(f"❌ Author search failed: {e}")

def test_django_view():
    """Test our Django view implementation"""
    print("\n🚀 Testing Django OpenLibrarySearchView...")
    print("=" * 50)
    
    from django.test import RequestFactory
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    factory = RequestFactory()
    
    # Create a test user
    try:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        print("✅ Test user created")
    except:
        user = User.objects.get(username='testuser')
        print("✅ Using existing test user")
    
    view = OpenLibrarySearchView()
    
    # Test 1: General search
    print("\n1. Testing general search via Django view")
    try:
        request = factory.get('/library/books/search/openlibrary/?q=Python&type=general&limit=3')
        request.user = user
        response = view.get(request)
        
        if response.status_code == 200:
            data = response.data
            print(f"✅ Search successful! Found {data.get('count', 0)} results")
            for i, book in enumerate(data.get('results', [])[:2], 1):
                print(f"   {i}. {book.get('title', 'No title')} by {book.get('author', 'Unknown')}")
        else:
            print(f"❌ Search failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Django view test failed: {e}")
    
    # Test 2: ISBN search
    print("\n2. Testing ISBN search via Django view")
    try:
        request = factory.get('/library/books/search/openlibrary/?q=9780439708180&type=isbn&limit=1')
        request.user = user
        response = view.get(request)
        
        if response.status_code == 200:
            data = response.data
            results = data.get('results', [])
            if results:
                book = results[0]
                print(f"✅ ISBN search successful!")
                print(f"   Title: {book.get('title', 'No title')}")
                print(f"   Author: {book.get('author', 'Unknown')}")
                print(f"   Year: {book.get('year', 'Unknown')}")
                print(f"   Cover: {book.get('cover_image_url', 'No cover')}")
            else:
                print("❌ No results found")
        else:
            print(f"❌ ISBN search failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ Django ISBN search failed: {e}")
    
    # Clean up test user
    try:
        user.delete()
        print("\n✅ Test user cleaned up")
    except:
        pass

def main():
    print("🚀 BookSwaps Open Library Integration Test")
    print("=" * 60)
    
    # Test direct API calls
    test_open_library_api()
    
    # Test Django integration
    test_django_view()
    
    print("\n" + "=" * 60)
    print("✅ Test completed! Check the results above.")
    print("\nNext steps:")
    print("1. Start your Django server: python manage.py runserver")
    print("2. Test the frontend integration")
    print("3. Try adding books using the smart search feature")

if __name__ == "__main__":
    main()
