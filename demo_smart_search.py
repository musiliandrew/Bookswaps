#!/usr/bin/env python
"""
Demo script for Smart Book Search feature
Shows how the Open Library integration works
"""
import requests
import json
from datetime import datetime

def demo_search_types():
    """Demonstrate different search types"""
    print("🔍 BookSwaps Smart Book Search Demo")
    print("=" * 50)
    print(f"Demo run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Demo searches
    searches = [
        {
            "title": "📖 Title Search",
            "description": "Search for 'The Great Gatsby'",
            "url": "https://openlibrary.org/search.json",
            "params": {
                'title': 'The Great Gatsby',
                'limit': 3,
                'fields': 'key,title,author_name,first_publish_year,isbn,cover_i'
            }
        },
        {
            "title": "👤 Author Search", 
            "description": "Search for books by 'Stephen King'",
            "url": "https://openlibrary.org/search.json",
            "params": {
                'author': 'Stephen King',
                'limit': 3,
                'fields': 'key,title,author_name,first_publish_year,cover_i'
            }
        },
        {
            "title": "#️⃣ ISBN Search",
            "description": "Search for ISBN: 9780143127550 (The Handmaid's Tale)",
            "url": "https://openlibrary.org/api/books",
            "params": {
                'bibkeys': 'ISBN:9780143127550',
                'format': 'json',
                'jscmd': 'data'
            }
        },
        {
            "title": "🔍 General Search",
            "description": "General search for 'Python programming'",
            "url": "https://openlibrary.org/search.json",
            "params": {
                'q': 'Python programming',
                'limit': 3,
                'fields': 'key,title,author_name,first_publish_year,cover_i'
            }
        }
    ]
    
    for i, search in enumerate(searches, 1):
        print(f"{i}. {search['title']}")
        print(f"   {search['description']}")
        print("   " + "-" * 40)
        
        try:
            response = requests.get(search['url'], params=search['params'], timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if 'ISBN:' in search['params'].get('bibkeys', ''):
                # ISBN search response format
                isbn_key = list(data.keys())[0] if data else None
                if isbn_key and data[isbn_key]:
                    book = data[isbn_key]
                    print(f"   ✅ Found: {book.get('title', 'No title')}")
                    authors = [a.get('name', '') for a in book.get('authors', [])]
                    print(f"   📚 Authors: {', '.join(authors) if authors else 'Unknown'}")
                    print(f"   📅 Published: {book.get('publish_date', 'Unknown')}")
                    if book.get('cover'):
                        print(f"   🖼️  Cover: {book['cover'].get('large', 'No cover')}")
                else:
                    print("   ❌ No book found for this ISBN")
            else:
                # Regular search response format
                books = data.get('docs', [])
                print(f"   ✅ Found {len(books)} books")
                
                for j, book in enumerate(books[:2], 1):
                    title = book.get('title', 'No title')
                    authors = ', '.join(book.get('author_name', ['Unknown']))
                    year = book.get('first_publish_year', 'Unknown')
                    
                    print(f"   {j}. {title}")
                    print(f"      By: {authors} ({year})")
                    
                    if book.get('cover_i'):
                        cover_url = f"https://covers.openlibrary.org/b/id/{book['cover_i']}-L.jpg"
                        print(f"      Cover: {cover_url}")
                    
                    if j < len(books[:2]):
                        print()
            
        except Exception as e:
            print(f"   ❌ Search failed: {e}")
        
        print()
        print()

def demo_book_data_format():
    """Show how book data is formatted for the frontend"""
    print("📋 Book Data Format Demo")
    print("=" * 50)
    
    # Example of how our backend formats the data
    sample_book = {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "authors": ["F. Scott Fitzgerald"],
        "isbn": "9780743273565",
        "year": 1925,
        "publisher": "Scribner",
        "cover_image_url": "https://covers.openlibrary.org/b/id/8225261-L.jpg",
        "synopsis": "A classic American novel set in the Jazz Age...",
        "genres": ["Fiction", "Classic Literature", "American Literature"],
        "page_count": 180,
        "open_library_key": "/works/OL468516W",
        "source": "open_library"
    }
    
    print("📖 Sample Book Data (JSON format):")
    print(json.dumps(sample_book, indent=2))
    print()
    
    print("🎯 Frontend Auto-Population:")
    print("When a user selects this book, the form will auto-fill:")
    print(f"   Title: {sample_book['title']}")
    print(f"   Author: {sample_book['author']}")
    print(f"   ISBN: {sample_book['isbn']}")
    print(f"   Year: {sample_book['year']}")
    print(f"   Genre: {sample_book['genres'][0] if sample_book['genres'] else 'Not specified'}")
    print(f"   Cover: {sample_book['cover_image_url']}")
    print(f"   Synopsis: {sample_book['synopsis'][:50]}...")
    print()

def demo_search_flow():
    """Demonstrate the complete search flow"""
    print("🚀 Complete Search Flow Demo")
    print("=" * 50)
    
    flow_steps = [
        "1. 👤 User clicks 'Add Book' button",
        "2. 🎯 System shows choice: Smart Search vs Manual",
        "3. 🔍 User selects 'Smart Search'",
        "4. 📝 User types 'Harry Potter' in search box",
        "5. ⏱️  System waits 500ms (debounce)",
        "6. 🌐 API call to Open Library",
        "7. 📊 Results displayed with covers",
        "8. 👆 User clicks on desired book",
        "9. ✨ Form auto-populates with book data",
        "10. ✅ User reviews and adds to library"
    ]
    
    for step in flow_steps:
        print(f"   {step}")
    
    print()
    print("💡 Key Benefits:")
    benefits = [
        "⚡ Faster than manual entry (seconds vs minutes)",
        "🎯 Accurate data (no typos or missing info)",
        "📸 Beautiful covers automatically included",
        "🔍 Discover books you didn't know existed",
        "📱 Works perfectly on mobile devices",
        "🔄 Fallback to manual if book not found"
    ]
    
    for benefit in benefits:
        print(f"   {benefit}")

def main():
    """Run the complete demo"""
    print("🎉 Welcome to BookSwaps Smart Book Search!")
    print("This demo shows how our Open Library integration works.")
    print()
    
    # Run all demos
    demo_search_types()
    demo_book_data_format()
    demo_search_flow()
    
    print("🎯 Next Steps:")
    print("1. Start your Django server: python manage.py runserver")
    print("2. Open the frontend and try adding a book")
    print("3. Experience the magic of smart search!")
    print()
    print("📚 Happy book swapping! ✨")

if __name__ == "__main__":
    main()
