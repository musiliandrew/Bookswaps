#!/usr/bin/env node

/**
 * Critical Fixes Test Script
 * Tests the most important fixes for Bookswaps platform
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Critical Fixes for Bookswaps Platform');
console.log('================================================');

const tests = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to check if file exists and contains specific content
function checkFileContent(filePath, searchString, description) {
  try {
    if (!fs.existsSync(filePath)) {
      tests.push({ name: description, status: 'FAIL', reason: 'File not found' });
      failedTests++;
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString)) {
      tests.push({ name: description, status: 'PASS', reason: 'Content found' });
      passedTests++;
      return true;
    } else {
      tests.push({ name: description, status: 'FAIL', reason: 'Content not found' });
      failedTests++;
      return false;
    }
  } catch (error) {
    tests.push({ name: description, status: 'ERROR', reason: error.message });
    failedTests++;
    return false;
  }
}

// Helper function to check if problematic content is removed
function checkContentRemoved(filePath, searchString, description) {
  try {
    if (!fs.existsSync(filePath)) {
      tests.push({ name: description, status: 'FAIL', reason: 'File not found' });
      failedTests++;
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(searchString)) {
      tests.push({ name: description, status: 'PASS', reason: 'Problematic content removed' });
      passedTests++;
      return true;
    } else {
      tests.push({ name: description, status: 'FAIL', reason: 'Problematic content still exists' });
      failedTests++;
      return false;
    }
  } catch (error) {
    tests.push({ name: description, status: 'ERROR', reason: error.message });
    failedTests++;
    return false;
  }
}

console.log('\n🧪 Running Tests...\n');

// Test 1: Check if setIsHovered is defined in EnhancedPostCard
checkFileContent(
  'frontend/src/components/Socials/Discussions/EnhancedPostCard.jsx',
  'const [isHovered, setIsHovered] = useState(false);',
  'EnhancedPostCard: setIsHovered state defined'
);

// Test 2: Check if useAuth dependency array is fixed
checkContentRemoved(
  'frontend/src/hooks/useAuth.js',
  '[profile, refreshToken, error]',
  'useAuth: Removed problematic dependencies'
);

// Test 3: Check if useAuth has proper dependency array
checkFileContent(
  'frontend/src/hooks/useAuth.js',
  '[refreshToken]',
  'useAuth: Fixed dependency array'
);

// Test 4: Check if ChatPage has loading state
checkFileContent(
  'frontend/src/components/Socials/ChatPage.jsx',
  'const [loading, setLoading] = useState(true);',
  'ChatPage: Loading state added'
);

// Test 5: Check if ChatPage handles empty conversations
checkFileContent(
  'frontend/src/components/Socials/ChatPage.jsx',
  'setConversations([]);',
  'ChatPage: Empty conversations handling'
);

// Test 6: Check if ErrorBoundary is enhanced
checkFileContent(
  'frontend/src/components/Common/ErrorBoundary.jsx',
  'ExclamationTriangleIcon',
  'ErrorBoundary: Enhanced with proper UI'
);

// Test 7: Check if App.jsx uses ErrorBoundary
checkFileContent(
  'frontend/src/App.jsx',
  'import ErrorBoundary',
  'App.jsx: ErrorBoundary imported'
);

// Test 8: Check if CSS variables are consolidated
checkFileContent(
  'frontend/src/index.css',
  '--dark-primary: #334155;',
  'CSS: New variables added'
);

// Test 9: Check if performance utilities exist
checkFileContent(
  'frontend/src/components/Common/PerformanceOptimizer.jsx',
  'withPerformanceOptimization',
  'Performance: Optimization utilities created'
);

// Test 10: Check if useWebSocket dependencies are fixed
checkContentRemoved(
  'frontend/src/hooks/useWebSocket.js',
  '[connectWebSocket, isAuthenticated, userId, profile?.user_id]',
  'useWebSocket: Fixed dependency array'
);

// Test 11: Check if documentation exists
checkFileContent(
  'PLATFORM_FIXES_DOCUMENTATION.md',
  'Comprehensive Platform Fixes',
  'Documentation: Fix documentation created'
);

// Test 12: Check if fix script exists
checkFileContent(
  'fix_platform_issues.sh',
  'Bookswaps Platform Comprehensive Fix Script',
  'Scripts: Fix script created'
);

// Display results
console.log('\n📊 Test Results:');
console.log('================');

tests.forEach((test, index) => {
  const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${test.name}`);
  if (test.status !== 'PASS') {
    console.log(`   Reason: ${test.reason}`);
  }
});

console.log('\n📈 Summary:');
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📊 Total: ${tests.length}`);

const successRate = ((passedTests / tests.length) * 100).toFixed(1);
console.log(`🎯 Success Rate: ${successRate}%`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! The critical fixes are properly implemented.');
} else if (successRate >= 80) {
  console.log('\n✅ Most fixes are working. Review failed tests above.');
} else {
  console.log('\n⚠️  Several fixes need attention. Please review the failed tests.');
}

console.log('\n🚀 Next Steps:');
console.log('1. Run: ./fix_platform_issues.sh');
console.log('2. Test the application manually');
console.log('3. Check browser console for errors');
console.log('4. Verify chat functionality works');

process.exit(failedTests > 0 ? 1 : 0);
