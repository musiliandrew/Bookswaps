#!/usr/bin/env node

/**
 * Test Script: Send Message to Test Book Society 181743
 * This script will authenticate, join the society, and send a test message
 */

const axios = require('axios');

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:8000/api',
  SOCIETY_NAME: 'Test Book Society 181743',
  TEST_USERNAME: 'testuser', // Change this to your username
  TEST_PASSWORD: 'testpass', // Change this to your password
  TEST_MESSAGE: '🤖 Automated test message from script! Testing society chat functionality. Hello everyone! 📚'
};

class SocietyChatTester {
  constructor() {
    this.accessToken = null;
    this.societyId = null;
    this.axios = axios.create({
      baseURL: CONFIG.API_BASE_URL,
      timeout: 10000,
    });
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async authenticate() {
    try {
      this.log('Attempting to authenticate...');
      
      const response = await this.axios.post('/users/login/', {
        username: CONFIG.TEST_USERNAME,
        password: CONFIG.TEST_PASSWORD
      });

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
        this.log('Authentication successful!', 'success');
        return true;
      } else {
        this.log('Authentication failed: No access token received', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Authentication failed: ${error.response?.data?.detail || error.message}`, 'error');
      return false;
    }
  }

  async findSociety() {
    try {
      this.log(`Searching for society: ${CONFIG.SOCIETY_NAME}`);
      
      const response = await this.axios.get('/chat/societies/');
      const societies = response.data.results || response.data;
      
      const targetSociety = societies.find(society => 
        society.name === CONFIG.SOCIETY_NAME
      );

      if (targetSociety) {
        this.societyId = targetSociety.society_id || targetSociety.id;
        this.log(`Found society! ID: ${this.societyId}`, 'success');
        this.log(`Members: ${targetSociety.member_count}, Is Member: ${targetSociety.is_member}`);
        return targetSociety;
      } else {
        this.log(`Society "${CONFIG.SOCIETY_NAME}" not found`, 'error');
        this.log('Available societies:');
        societies.forEach(society => {
          console.log(`  - ${society.name} (${society.society_id || society.id})`);
        });
        return null;
      }
    } catch (error) {
      this.log(`Failed to fetch societies: ${error.response?.data?.detail || error.message}`, 'error');
      return null;
    }
  }

  async joinSociety() {
    try {
      this.log('Attempting to join society...');
      
      const response = await this.axios.post(`/chat/societies/${this.societyId}/join/`);
      
      this.log('Successfully joined society!', 'success');
      return true;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already a member')) {
        this.log('Already a member of this society', 'success');
        return true;
      } else {
        this.log(`Failed to join society: ${error.response?.data?.error || error.message}`, 'error');
        return false;
      }
    }
  }

  async sendMessage() {
    try {
      this.log('Sending test message...');
      
      const messageData = {
        content: CONFIG.TEST_MESSAGE,
        message_type: 'TEXT'
      };

      this.log(`Message payload: ${JSON.stringify(messageData, null, 2)}`);
      
      const response = await this.axios.post(
        `/chat/societies/${this.societyId}/messages/send/`,
        messageData
      );

      this.log('Message sent successfully!', 'success');
      this.log(`Message ID: ${response.data.message_id}`);
      this.log(`Content: ${response.data.content}`);
      return true;
    } catch (error) {
      this.log(`Failed to send message: ${error.response?.data?.error || error.message}`, 'error');
      if (error.response?.data) {
        this.log(`Error details: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
      }
      return false;
    }
  }

  async getSocietyMessages() {
    try {
      this.log('Fetching recent messages...');
      
      const response = await this.axios.get(`/chat/societies/${this.societyId}/messages/`);
      const messages = response.data.results || response.data;
      
      this.log(`Found ${messages.length} messages in the society`);
      
      // Show last 3 messages
      const recentMessages = messages.slice(-3);
      recentMessages.forEach((msg, index) => {
        const timestamp = new Date(msg.created_at).toLocaleTimeString();
        console.log(`  ${index + 1}. [${timestamp}] ${msg.user.username}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      });
      
      return true;
    } catch (error) {
      this.log(`Failed to fetch messages: ${error.response?.data?.detail || error.message}`, 'error');
      return false;
    }
  }

  async runTest() {
    console.log('🚀 Starting Society Chat Test Script');
    console.log('=====================================');
    
    // Step 1: Authenticate
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      this.log('Test failed: Authentication required', 'error');
      return false;
    }

    // Step 2: Find the society
    const society = await this.findSociety();
    if (!society) {
      this.log('Test failed: Society not found', 'error');
      return false;
    }

    // Step 3: Join the society (if not already a member)
    const joinSuccess = await this.joinSociety();
    if (!joinSuccess) {
      this.log('Test failed: Could not join society', 'error');
      return false;
    }

    // Step 4: Send test message
    const messageSuccess = await this.sendMessage();
    if (!messageSuccess) {
      this.log('Test failed: Could not send message', 'error');
      return false;
    }

    // Step 5: Verify message was sent by fetching recent messages
    await this.getSocietyMessages();

    console.log('=====================================');
    this.log('🎉 Test completed successfully! Check the society chat in your browser.', 'success');
    return true;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const tester = new SocietyChatTester();
  
  // Override config with command line arguments if provided
  if (process.argv[2]) CONFIG.TEST_USERNAME = process.argv[2];
  if (process.argv[3]) CONFIG.TEST_PASSWORD = process.argv[3];
  
  console.log(`Using credentials: ${CONFIG.TEST_USERNAME} / ${'*'.repeat(CONFIG.TEST_PASSWORD.length)}`);
  
  tester.runTest().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = SocietyChatTester;
