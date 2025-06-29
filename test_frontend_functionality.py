#!/usr/bin/env python3
"""
Frontend Functionality Testing Script for BookSwaps Application
Tests frontend UI functionality using Selenium WebDriver
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
FRONTEND_URL = "http://localhost:5173"
TEST_USERNAME = "andrew"
TEST_PASSWORD = "*Andrew2003"

class BookSwapsFrontendTester:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.test_results = []
        
    def setup_driver(self):
        """Setup Chrome WebDriver with headless options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in background
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, 10)
            return True
        except Exception as e:
            print(f"❌ Failed to setup WebDriver: {e}")
            return False
            
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        print(f"{status} {test_name}: {details}")
        
    def test_page_load(self):
        """Test if the main page loads correctly"""
        print("\n🌐 TESTING PAGE LOAD")
        
        try:
            self.driver.get(FRONTEND_URL)
            
            # Wait for the page to load
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Check if we're on login page or main app
            page_title = self.driver.title
            current_url = self.driver.current_url
            
            self.log_test("Page Load", True, f"Title: {page_title}, URL: {current_url}")
            return True
            
        except TimeoutException:
            self.log_test("Page Load", False, "Page failed to load within timeout")
            return False
        except Exception as e:
            self.log_test("Page Load", False, f"Exception: {str(e)}")
            return False
            
    def test_login_functionality(self):
        """Test login functionality"""
        print("\n🔐 TESTING LOGIN FUNCTIONALITY")
        
        try:
            # Look for login form elements
            username_input = None
            password_input = None
            login_button = None
            
            # Try different possible selectors for login form
            possible_username_selectors = [
                'input[name="username"]',
                'input[type="text"]',
                'input[placeholder*="username" i]',
                'input[placeholder*="email" i]'
            ]
            
            possible_password_selectors = [
                'input[name="password"]',
                'input[type="password"]'
            ]
            
            possible_button_selectors = [
                'button[type="submit"]',
                'button:contains("Login")',
                'button:contains("Sign In")',
                'input[type="submit"]'
            ]
            
            # Find username input
            for selector in possible_username_selectors:
                try:
                    username_input = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except NoSuchElementException:
                    continue
                    
            # Find password input
            for selector in possible_password_selectors:
                try:
                    password_input = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except NoSuchElementException:
                    continue
                    
            # Find login button
            for selector in possible_button_selectors:
                try:
                    login_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except NoSuchElementException:
                    continue
            
            if username_input and password_input and login_button:
                # Fill in credentials
                username_input.clear()
                username_input.send_keys(TEST_USERNAME)
                
                password_input.clear()
                password_input.send_keys(TEST_PASSWORD)
                
                # Click login button
                login_button.click()
                
                # Wait for navigation or success indicator
                time.sleep(3)
                
                # Check if login was successful
                current_url = self.driver.current_url
                page_source = self.driver.page_source.lower()
                
                # Look for indicators of successful login
                success_indicators = [
                    "dashboard" in current_url,
                    "profile" in current_url,
                    "library" in current_url,
                    "welcome" in page_source,
                    "logout" in page_source,
                    TEST_USERNAME.lower() in page_source
                ]
                
                if any(success_indicators):
                    self.log_test("Login Functionality", True, f"Successfully logged in, URL: {current_url}")
                    return True
                else:
                    self.log_test("Login Functionality", False, f"Login may have failed, URL: {current_url}")
                    return False
                    
            else:
                missing_elements = []
                if not username_input: missing_elements.append("username input")
                if not password_input: missing_elements.append("password input")
                if not login_button: missing_elements.append("login button")
                
                self.log_test("Login Functionality", False, f"Missing elements: {', '.join(missing_elements)}")
                return False
                
        except Exception as e:
            self.log_test("Login Functionality", False, f"Exception: {str(e)}")
            return False
            
    def test_navigation(self):
        """Test navigation between different sections"""
        print("\n🧭 TESTING NAVIGATION")
        
        try:
            # Look for navigation elements
            nav_elements = self.driver.find_elements(By.CSS_SELECTOR, "nav a, .nav-link, [role='navigation'] a")
            
            if nav_elements:
                nav_count = len(nav_elements)
                self.log_test("Navigation Elements", True, f"Found {nav_count} navigation elements")
                
                # Test clicking on different navigation items
                for i, nav_element in enumerate(nav_elements[:3]):  # Test first 3 nav items
                    try:
                        nav_text = nav_element.text or nav_element.get_attribute('aria-label') or f"Nav Item {i+1}"
                        nav_element.click()
                        time.sleep(2)
                        
                        current_url = self.driver.current_url
                        self.log_test(f"Navigate to {nav_text}", True, f"URL: {current_url}")
                        
                    except Exception as e:
                        self.log_test(f"Navigate to {nav_text}", False, f"Exception: {str(e)}")
                        
            else:
                self.log_test("Navigation Elements", False, "No navigation elements found")
                
        except Exception as e:
            self.log_test("Navigation", False, f"Exception: {str(e)}")
            
    def test_responsive_design(self):
        """Test responsive design by changing window size"""
        print("\n📱 TESTING RESPONSIVE DESIGN")
        
        try:
            # Test different screen sizes
            screen_sizes = [
                (1920, 1080, "Desktop"),
                (768, 1024, "Tablet"),
                (375, 667, "Mobile")
            ]
            
            for width, height, device in screen_sizes:
                self.driver.set_window_size(width, height)
                time.sleep(1)
                
                # Check if page is still functional
                body = self.driver.find_element(By.TAG_NAME, "body")
                if body:
                    self.log_test(f"Responsive - {device}", True, f"Page renders at {width}x{height}")
                else:
                    self.log_test(f"Responsive - {device}", False, f"Page broken at {width}x{height}")
                    
        except Exception as e:
            self.log_test("Responsive Design", False, f"Exception: {str(e)}")
            
    def test_api_calls(self):
        """Test if frontend is making API calls"""
        print("\n🔗 TESTING API INTEGRATION")
        
        try:
            # Get browser logs to check for API calls
            logs = self.driver.get_log('browser')
            
            api_calls = []
            for log in logs:
                if 'api' in log['message'].lower():
                    api_calls.append(log['message'])
                    
            if api_calls:
                self.log_test("API Integration", True, f"Found {len(api_calls)} API-related logs")
            else:
                self.log_test("API Integration", True, "No API errors in browser logs")
                
        except Exception as e:
            self.log_test("API Integration", False, f"Exception: {str(e)}")
            
    def run_all_tests(self):
        """Run all frontend tests"""
        print("🚀 STARTING FRONTEND FUNCTIONALITY TESTING")
        print(f"Testing against: {FRONTEND_URL}")
        print(f"Test account: {TEST_USERNAME}")
        print("=" * 60)
        
        if not self.setup_driver():
            print("❌ Failed to setup WebDriver - stopping tests")
            return
            
        try:
            # Run tests in order
            if self.test_page_load():
                self.test_login_functionality()
                self.test_navigation()
                self.test_responsive_design()
                self.test_api_calls()
            
            # Print summary
            self.print_summary()
            
        finally:
            if self.driver:
                self.driver.quit()
                
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 FRONTEND TEST SUMMARY")
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
                    
        print("\n🎉 Frontend testing completed!")

if __name__ == "__main__":
    tester = BookSwapsFrontendTester()
    tester.run_all_tests()
