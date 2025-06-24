#!/usr/bin/env python3
"""
Frontend-Backend Connection Verification Script
Analyzes all frontend hooks and components to ensure they're properly connected to backend endpoints
"""
import os
import re
import json
from pathlib import Path

class ConnectionVerifier:
    def __init__(self):
        self.frontend_dir = Path('/mnt/persist/workspace/frontend/src')
        self.backend_dir = Path('/mnt/persist/workspace/backend')
        self.results = {
            'connected': [],
            'missing_backend': [],
            'missing_frontend': [],
            'mismatched': []
        }
    
    def log(self, message, level="INFO"):
        print(f"{level}: {message}")
    
    def extract_api_endpoints_from_constants(self):
        """Extract all API endpoints from frontend constants"""
        constants_file = self.frontend_dir / 'utils' / 'constants.js'
        
        if not constants_file.exists():
            self.log("❌ Frontend constants.js not found", "ERROR")
            return {}
        
        with open(constants_file, 'r') as f:
            content = f.read()
        
        # Extract API_ENDPOINTS object
        endpoints = {}
        
        # Find all endpoint definitions
        endpoint_pattern = r"(\w+):\s*(?:'([^']+)'|\(([^)]+)\)\s*=>\s*`([^`]+)`)"
        matches = re.findall(endpoint_pattern, content)
        
        for match in matches:
            name = match[0]
            if match[1]:  # Simple string endpoint
                endpoints[name] = match[1]
            elif match[3]:  # Function endpoint
                endpoints[name] = match[3]
        
        return endpoints
    
    def extract_backend_urls(self):
        """Extract all backend URL patterns"""
        backend_urls = {}
        
        # Main urls.py
        main_urls_file = self.backend_dir / 'urls.py'
        if main_urls_file.exists():
            with open(main_urls_file, 'r') as f:
                content = f.read()
            
            # Find included apps
            include_pattern = r"path\('api/(\w+)/', include\('backend\.(\w+)\.urls'"
            includes = re.findall(include_pattern, content)
            
            for prefix, app in includes:
                app_urls_file = self.backend_dir / app / 'urls.py'
                if app_urls_file.exists():
                    backend_urls[app] = self.extract_app_urls(app_urls_file, f'/api/{prefix}/')
        
        return backend_urls
    
    def extract_app_urls(self, urls_file, prefix):
        """Extract URLs from a specific app's urls.py"""
        with open(urls_file, 'r') as f:
            content = f.read()
        
        urls = []
        
        # Find all path definitions
        path_pattern = r"path\('([^']+)',\s*(\w+)\.as_view\(\),\s*name='([^']+)'"
        matches = re.findall(path_pattern, content)
        
        for match in matches:
            url_pattern = match[0]
            view_name = match[1]
            name = match[2]
            
            full_url = prefix + url_pattern
            urls.append({
                'pattern': full_url,
                'view': view_name,
                'name': name
            })
        
        return urls
    
    def extract_hook_endpoints(self):
        """Extract endpoints used in frontend hooks"""
        hooks_dir = self.frontend_dir / 'hooks'
        hook_endpoints = {}
        
        if not hooks_dir.exists():
            return hook_endpoints
        
        for hook_file in hooks_dir.glob('*.js'):
            if hook_file.name.startswith('use'):
                with open(hook_file, 'r') as f:
                    content = f.read()
                
                # Find API_ENDPOINTS usage
                endpoint_usage = re.findall(r'API_ENDPOINTS\.(\w+)', content)
                hook_endpoints[hook_file.stem] = list(set(endpoint_usage))
        
        return hook_endpoints
    
    def verify_connections(self):
        """Verify all frontend-backend connections"""
        self.log("🔍 Analyzing Frontend-Backend Connections")
        self.log("=" * 60)
        
        # Extract data
        frontend_endpoints = self.extract_api_endpoints_from_constants()
        backend_urls = self.extract_backend_urls()
        hook_endpoints = self.extract_hook_endpoints()
        
        self.log(f"📊 Found {len(frontend_endpoints)} frontend endpoints")
        
        total_backend_urls = sum(len(urls) for urls in backend_urls.values())
        self.log(f"📊 Found {total_backend_urls} backend URLs")
        
        # Flatten backend URLs
        all_backend_urls = []
        for app, urls in backend_urls.items():
            all_backend_urls.extend(urls)
        
        # Check each frontend endpoint
        for name, endpoint in frontend_endpoints.items():
            self.verify_single_endpoint(name, endpoint, all_backend_urls)
        
        # Check hook usage
        self.verify_hook_usage(hook_endpoints, frontend_endpoints)
        
        self.print_verification_results()
    
    def verify_single_endpoint(self, name, endpoint, backend_urls):
        """Verify a single frontend endpoint against backend URLs"""
        # Normalize endpoint for comparison
        normalized_endpoint = self.normalize_endpoint(endpoint)
        
        # Check if backend URL exists
        found = False
        for backend_url in backend_urls:
            backend_pattern = self.normalize_endpoint(backend_url['pattern'])
            
            if self.patterns_match(normalized_endpoint, backend_pattern):
                self.results['connected'].append({
                    'frontend': name,
                    'endpoint': endpoint,
                    'backend': backend_url['pattern'],
                    'view': backend_url['view']
                })
                found = True
                break
        
        if not found:
            self.results['missing_backend'].append({
                'frontend': name,
                'endpoint': endpoint
            })
    
    def normalize_endpoint(self, endpoint):
        """Normalize endpoint for comparison"""
        # Remove parameter placeholders
        normalized = re.sub(r'\$\{[^}]+\}', '{param}', endpoint)
        normalized = re.sub(r'<[^>]+>', '{param}', normalized)
        
        # Remove trailing slashes for comparison
        normalized = normalized.rstrip('/')
        
        return normalized
    
    def patterns_match(self, frontend_pattern, backend_pattern):
        """Check if frontend and backend patterns match"""
        # Simple pattern matching - could be more sophisticated
        frontend_parts = frontend_pattern.split('/')
        backend_parts = backend_pattern.split('/')
        
        if len(frontend_parts) != len(backend_parts):
            return False
        
        for f_part, b_part in zip(frontend_parts, backend_parts):
            if f_part != b_part and f_part != '{param}' and b_part != '{param}':
                return False
        
        return True
    
    def verify_hook_usage(self, hook_endpoints, frontend_endpoints):
        """Verify that hooks are using valid endpoints"""
        for hook, endpoints in hook_endpoints.items():
            for endpoint in endpoints:
                if endpoint not in frontend_endpoints:
                    self.results['missing_frontend'].append({
                        'hook': hook,
                        'endpoint': endpoint
                    })
    
    def print_verification_results(self):
        """Print verification results"""
        self.log("=" * 60)
        self.log("📊 VERIFICATION RESULTS")
        self.log("=" * 60)
        
        # Connected endpoints
        self.log(f"✅ CONNECTED ENDPOINTS: {len(self.results['connected'])}")
        for conn in self.results['connected'][:10]:  # Show first 10
            self.log(f"  ✅ {conn['frontend']} → {conn['backend']}")
        
        if len(self.results['connected']) > 10:
            self.log(f"  ... and {len(self.results['connected']) - 10} more")
        
        # Missing backend endpoints
        if self.results['missing_backend']:
            self.log(f"\n❌ MISSING BACKEND ENDPOINTS: {len(self.results['missing_backend'])}")
            for missing in self.results['missing_backend']:
                self.log(f"  ❌ {missing['frontend']}: {missing['endpoint']}")
        
        # Missing frontend endpoints
        if self.results['missing_frontend']:
            self.log(f"\n⚠️  MISSING FRONTEND ENDPOINTS: {len(self.results['missing_frontend'])}")
            for missing in self.results['missing_frontend']:
                self.log(f"  ⚠️  {missing['hook']} uses undefined {missing['endpoint']}")
        
        # Summary
        total_frontend = len(self.results['connected']) + len(self.results['missing_backend'])
        if total_frontend > 0:
            connection_rate = len(self.results['connected']) / total_frontend * 100
            self.log(f"\n🎯 CONNECTION RATE: {connection_rate:.1f}%")
            
            if connection_rate >= 95:
                self.log("🎉 EXCELLENT! Almost all endpoints are properly connected.")
            elif connection_rate >= 80:
                self.log("👍 GOOD! Most endpoints are connected, minor issues to fix.")
            else:
                self.log("⚠️  NEEDS ATTENTION! Many endpoints are not properly connected.")
        
        self.generate_fix_recommendations()
    
    def generate_fix_recommendations(self):
        """Generate recommendations for fixing connection issues"""
        if self.results['missing_backend'] or self.results['missing_frontend']:
            self.log("\n🔧 RECOMMENDED FIXES:")
            
            if self.results['missing_backend']:
                self.log("\n📝 Missing Backend Endpoints:")
                for missing in self.results['missing_backend']:
                    self.log(f"  • Add backend view for: {missing['endpoint']}")
            
            if self.results['missing_frontend']:
                self.log("\n📝 Missing Frontend Endpoints:")
                for missing in self.results['missing_frontend']:
                    self.log(f"  • Add {missing['endpoint']} to constants.js")

if __name__ == "__main__":
    verifier = ConnectionVerifier()
    verifier.verify_connections()
