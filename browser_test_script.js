/**
 * Browser Console Test Script for Society Chat
 * Copy and paste this into your browser console while on localhost:5173
 */

async function testSocietyChat() {
  const CONFIG = {
    API_BASE_URL: 'http://localhost:8000/api',
    SOCIETY_NAME: 'Test Book Society 181743',
    TEST_MESSAGE: '🤖 Automated test message from browser console! Testing society chat functionality. Hello everyone! 📚'
  };

  // Helper function for logging
  function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  try {
    // Get access token from localStorage (assuming user is already logged in)
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      log('No access token found. Please log in first!', 'error');
      return false;
    }

    log('Found access token, proceeding with test...');

    // Set up axios-like fetch wrapper
    const apiCall = async (endpoint, options = {}) => {
      const url = `${CONFIG.API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error || errorData.detail || response.statusText}`);
      }

      return response.json();
    };

    // Step 1: Find the society
    log(`Searching for society: ${CONFIG.SOCIETY_NAME}`);
    const societiesData = await apiCall('/chat/societies/');
    const societies = societiesData.results || societiesData;
    
    const targetSociety = societies.find(society => 
      society.name === CONFIG.SOCIETY_NAME
    );

    if (!targetSociety) {
      log(`Society "${CONFIG.SOCIETY_NAME}" not found`, 'error');
      log('Available societies:');
      societies.forEach(society => {
        console.log(`  - ${society.name} (${society.society_id || society.id})`);
      });
      return false;
    }

    const societyId = targetSociety.society_id || targetSociety.id;
    log(`Found society! ID: ${societyId}`, 'success');
    log(`Members: ${targetSociety.member_count}, Is Member: ${targetSociety.is_member}`);

    // Step 2: Join society if not already a member
    if (!targetSociety.is_member) {
      log('Attempting to join society...');
      try {
        await apiCall(`/chat/societies/${societyId}/join/`, { method: 'POST' });
        log('Successfully joined society!', 'success');
      } catch (error) {
        if (error.message.includes('already a member')) {
          log('Already a member of this society', 'success');
        } else {
          log(`Failed to join society: ${error.message}`, 'error');
          return false;
        }
      }
    } else {
      log('Already a member of this society', 'success');
    }

    // Step 3: Send test message
    log('Sending test message...');
    const messageData = {
      content: CONFIG.TEST_MESSAGE,
      message_type: 'TEXT'
    };

    log(`Message payload: ${JSON.stringify(messageData, null, 2)}`);
    
    const messageResponse = await apiCall(`/chat/societies/${societyId}/messages/send/`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });

    log('Message sent successfully!', 'success');
    log(`Message ID: ${messageResponse.message_id}`);
    log(`Content: ${messageResponse.content}`);

    // Step 4: Fetch recent messages to verify
    log('Fetching recent messages...');
    const messagesData = await apiCall(`/chat/societies/${societyId}/messages/`);
    const messages = messagesData.results || messagesData;
    
    log(`Found ${messages.length} messages in the society`);
    
    // Show last 3 messages
    const recentMessages = messages.slice(-3);
    log('Recent messages:');
    recentMessages.forEach((msg, index) => {
      const timestamp = new Date(msg.created_at).toLocaleTimeString();
      console.log(`  ${index + 1}. [${timestamp}] ${msg.user.username}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
    });

    log('🎉 Test completed successfully! Check the society chat in your browser.', 'success');
    return true;

  } catch (error) {
    log(`Test failed: ${error.message}`, 'error');
    console.error('Full error:', error);
    return false;
  }
}

// Instructions for use
console.log(`
🚀 Society Chat Test Script Loaded!

To run the test:
1. Make sure you're logged into the app (localhost:5173)
2. Run: testSocietyChat()

This will:
- Find "Test Book Society 181743"
- Join it if you're not already a member
- Send a test message
- Show recent messages

Ready to test!
`);

// Auto-run if you want (uncomment the line below)
// testSocietyChat();
