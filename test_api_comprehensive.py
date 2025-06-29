#!/usr/bin/env python3
"""
Comprehensive API Testing Script for BookSwaps Application
Tests all backend endpoints with real data using test account: andrew/*Andrew2003
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USERNAME = "andrew"
TEST_PASSWORD = "*Andrew2003"

class BookSwapsAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        print(f"{status} {test_name}: {details}")
        
    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔐 TESTING AUTHENTICATION")
        
        # Test login
        try:
            response = self.session.post(f"{BASE_URL}/users/login/", {
                "username": TEST_USERNAME,
                "password": TEST_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                print(f"Login response data: {data}")  # Debug
                self.access_token = data.get('access') or data.get('access_token')
                self.refresh_token = data.get('refresh') or data.get('refresh_token')

                if self.access_token:
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.access_token}'
                    })
                    self.log_test("Login", True, f"Got access token: {self.access_token[:20]}...")
                else:
                    self.log_test("Login", False, f"No access token in response: {data}")
                    return False
            else:
                self.log_test("Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Login", False, f"Exception: {str(e)}")
            return False
            
        # Test token refresh
        try:
            response = self.session.post(f"{BASE_URL}/users/token/refresh/", {
                "refresh": self.refresh_token
            })
            
            if response.status_code == 200:
                new_token = response.json().get('access')
                self.log_test("Token Refresh", True, f"New token: {new_token[:20]}...")
            else:
                self.log_test("Token Refresh", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Token Refresh", False, f"Exception: {str(e)}")
            
        return True
        
    def test_user_endpoints(self):
        """Test user-related endpoints"""
        print("\n👤 TESTING USER ENDPOINTS")
        
        # Test get current user profile
        try:
            response = self.session.get(f"{BASE_URL}/users/me/profile/")
            if response.status_code == 200:
                user_data = response.json()
                self.user_id = user_data.get('id')
                self.log_test("Get Current User Profile", True, f"User ID: {self.user_id}, Username: {user_data.get('username')}")
            else:
                self.log_test("Get Current User Profile", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Current User Profile", False, f"Exception: {str(e)}")

        # Test profile completion
        try:
            response = self.session.get(f"{BASE_URL}/users/me/profile-completion/")
            if response.status_code == 200:
                completion_data = response.json()
                self.log_test("Get Profile Completion", True, f"Completion: {completion_data.get('percentage', 'N/A')}%")
            else:
                self.log_test("Get Profile Completion", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Profile Completion", False, f"Exception: {str(e)}")
            
        # Test get user profile by ID
        if self.user_id:
            try:
                response = self.session.get(f"{BASE_URL}/users/profile/{self.user_id}/")
                if response.status_code == 200:
                    profile_data = response.json()
                    self.log_test("Get User Profile", True, f"Profile completion: {profile_data.get('profile_completion', 'N/A')}%")
                else:
                    self.log_test("Get User Profile", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Get User Profile", False, f"Exception: {str(e)}")
                
        # Test user stats
        try:
            response = self.session.get(f"{BASE_URL}/users/me/stats/")
            if response.status_code == 200:
                stats = response.json()
                self.log_test("Get User Stats", True, f"Books: {stats.get('total_books', 0)}, Swaps: {stats.get('total_swaps', 0)}")
            else:
                self.log_test("Get User Stats", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get User Stats", False, f"Exception: {str(e)}")
            
        # Test followers/following
        if self.user_id:
            for endpoint in ['followers', 'following']:
                try:
                    response = self.session.get(f"{BASE_URL}/users/{endpoint}/{self.user_id}/")
                    if response.status_code == 200:
                        data = response.json()
                        count = data.get('count', 0)
                        self.log_test(f"Get {endpoint.title()}", True, f"Count: {count}")
                    else:
                        self.log_test(f"Get {endpoint.title()}", False, f"Status: {response.status_code}")
                except Exception as e:
                    self.log_test(f"Get {endpoint.title()}", False, f"Exception: {str(e)}")
                    
    def test_book_endpoints(self):
        """Test book-related endpoints"""
        print("\n📚 TESTING BOOK ENDPOINTS")
        
        # Test get user library
        try:
            response = self.session.get(f"{BASE_URL}/library/library/")
            if response.status_code == 200:
                books_data = response.json()
                book_count = books_data.get('count', 0) if isinstance(books_data, dict) else len(books_data)
                self.log_test("Get User Library", True, f"Total books: {book_count}")

                # Store first book ID for further testing
                if book_count > 0:
                    books_list = books_data.get('results', books_data) if isinstance(books_data, dict) else books_data
                    if books_list:
                        first_book = books_list[0]
                        book_id = first_book.get('id')
                        if book_id:
                            self.test_book_detail(book_id)
            else:
                self.log_test("Get User Library", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get User Library", False, f"Exception: {str(e)}")

        # Test get all books
        try:
            response = self.session.get(f"{BASE_URL}/library/books/")
            if response.status_code == 200:
                books_data = response.json()
                book_count = books_data.get('count', 0) if isinstance(books_data, dict) else len(books_data)
                self.log_test("Get All Books", True, f"Total books: {book_count}")
            else:
                self.log_test("Get All Books", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get All Books", False, f"Exception: {str(e)}")

        # Test book search
        try:
            response = self.session.get(f"{BASE_URL}/library/books/search/?q=python")
            if response.status_code == 200:
                search_results = response.json()
                result_count = search_results.get('count', 0) if isinstance(search_results, dict) else len(search_results)
                self.log_test("Book Search", True, f"Found {result_count} results")
            else:
                self.log_test("Book Search", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Book Search", False, f"Exception: {str(e)}")

        # Test bookmarks
        try:
            response = self.session.get(f"{BASE_URL}/library/bookmarks/")
            if response.status_code == 200:
                bookmarks = response.json()
                bookmark_count = bookmarks.get('count', 0) if isinstance(bookmarks, dict) else len(bookmarks)
                self.log_test("Get Bookmarks", True, f"Total bookmarks: {bookmark_count}")
            else:
                self.log_test("Get Bookmarks", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Bookmarks", False, f"Exception: {str(e)}")

        # Test favorites
        try:
            response = self.session.get(f"{BASE_URL}/library/favorites/")
            if response.status_code == 200:
                favorites = response.json()
                favorite_count = favorites.get('count', 0) if isinstance(favorites, dict) else len(favorites)
                self.log_test("Get Favorites", True, f"Total favorites: {favorite_count}")
            else:
                self.log_test("Get Favorites", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Favorites", False, f"Exception: {str(e)}")
            
    def test_book_detail(self, book_id):
        """Test individual book detail endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/library/books/{book_id}/")
            if response.status_code == 200:
                book_data = response.json()
                self.log_test("Get Book Detail", True, f"Book: {book_data.get('title', 'Unknown')}")
            else:
                self.log_test("Get Book Detail", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Book Detail", False, f"Exception: {str(e)}")
            
    def test_swap_endpoints(self):
        """Test swap-related endpoints"""
        print("\n🔄 TESTING SWAP ENDPOINTS")
        
        # Test get swap list
        try:
            response = self.session.get(f"{BASE_URL}/swaps/list/")
            if response.status_code == 200:
                swaps_data = response.json()
                swap_count = swaps_data.get('count', 0)
                self.log_test("Get Swap List", True, f"Total swaps: {swap_count}")
            else:
                self.log_test("Get Swap List", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Swap List", False, f"Exception: {str(e)}")

        # Test swap history
        try:
            response = self.session.get(f"{BASE_URL}/swaps/history/")
            if response.status_code == 200:
                history_data = response.json()
                history_count = history_data.get('count', 0)
                self.log_test("Get Swap History", True, f"Total history: {history_count}")
            else:
                self.log_test("Get Swap History", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Swap History", False, f"Exception: {str(e)}")
            
        # Test notifications
        try:
            response = self.session.get(f"{BASE_URL}/swaps/notifications/")
            if response.status_code == 200:
                notifications = response.json()
                notif_count = notifications.get('count', 0)
                self.log_test("Get Notifications", True, f"Total notifications: {notif_count}")
            else:
                self.log_test("Get Notifications", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Notifications", False, f"Exception: {str(e)}")
            
    def test_discussion_endpoints(self):
        """Test discussion-related endpoints"""
        print("\n💬 TESTING DISCUSSION ENDPOINTS")
        
        # Test get discussion posts
        try:
            response = self.session.get(f"{BASE_URL}/discussions/posts/list/")
            if response.status_code == 200:
                discussions = response.json()
                post_count = discussions.get('count', 0)
                self.log_test("Get Discussion Posts", True, f"Total posts: {post_count}")
            else:
                self.log_test("Get Discussion Posts", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Discussion Posts", False, f"Exception: {str(e)}")

        # Test get top posts
        try:
            response = self.session.get(f"{BASE_URL}/discussions/top-posts/")
            if response.status_code == 200:
                top_posts = response.json()
                top_count = top_posts.get('count', 0)
                self.log_test("Get Top Posts", True, f"Total top posts: {top_count}")
            else:
                self.log_test("Get Top Posts", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Top Posts", False, f"Exception: {str(e)}")

        # Test get societies
        try:
            response = self.session.get(f"{BASE_URL}/discussions/societies/")
            if response.status_code == 200:
                societies = response.json()
                society_count = societies.get('count', 0)
                self.log_test("Get Societies", True, f"Total societies: {society_count}")
            else:
                self.log_test("Get Societies", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Societies", False, f"Exception: {str(e)}")

    def test_chat_endpoints(self):
        """Test chat-related endpoints"""
        print("\n💬 TESTING CHAT ENDPOINTS")

        # Test get messages
        try:
            response = self.session.get(f"{BASE_URL}/chat/messages/")
            if response.status_code == 200:
                messages = response.json()
                msg_count = messages.get('count', 0) if isinstance(messages, dict) else len(messages)
                self.log_test("Get Messages", True, f"Total messages: {msg_count}")
            else:
                self.log_test("Get Messages", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Messages", False, f"Exception: {str(e)}")

        # Test get chat societies
        try:
            response = self.session.get(f"{BASE_URL}/chat/societies/")
            if response.status_code == 200:
                societies = response.json()
                society_count = societies.get('count', 0) if isinstance(societies, dict) else len(societies)
                self.log_test("Get Chat Societies", True, f"Total societies: {society_count}")
            else:
                self.log_test("Get Chat Societies", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Chat Societies", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 STARTING COMPREHENSIVE API TESTING")
        print(f"Testing against: {BASE_URL}")
        print(f"Test account: {TEST_USERNAME}")
        print("=" * 60)
        
        # Run tests in order
        if not self.test_authentication():
            print("❌ Authentication failed - stopping tests")
            return
            
        self.test_user_endpoints()
        self.test_book_endpoints()
        self.test_swap_endpoints()
        self.test_discussion_endpoints()
        self.test_chat_endpoints()
        
        # Print summary
        self.print_summary()
        
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
                    
        print("\n🎉 Testing completed!")

if __name__ == "__main__":
    tester = BookSwapsAPITester()
    tester.run_all_tests()
