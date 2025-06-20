// src/lib/indexerClient.test.ts
// Quick test harness to verify indexer functionality after SDK changes

import { billboardIndexer } from './indexerClient';

/**
 * Test harness for indexer functionality
 * Run this before and after SDK changes to ensure compatibility
 */
export async function testIndexerFunctionality() {
  console.log('🧪 Testing Indexer Functionality...');
  
  const results = {
    getAllMessages: false,
    getMessageCount: false,
    apiConnection: false,
    dataStructure: false,
  };

  try {
    // Test 1: API Connection
    console.log('📡 Testing API connection...');
    const messages = await billboardIndexer.getAllMessages(5); // Limit to 5 for testing
    results.apiConnection = true;
    console.log('✅ API connection successful');

    // Test 2: Data Structure Validation
    console.log('🔍 Validating data structure...');
    if (Array.isArray(messages)) {
      results.dataStructure = true;
      console.log('✅ Data structure valid (array)');
      
      if (messages.length > 0) {
        const firstMessage = messages[0];
        const hasRequiredFields = 
          typeof firstMessage.author_address === 'string' &&
          typeof firstMessage.time === 'string' &&
          typeof firstMessage.message === 'string';
        
        if (hasRequiredFields) {
          console.log('✅ Message structure valid:', {
            author: firstMessage.author_address.substring(0, 10) + '...',
            time: firstMessage.time,
            message: firstMessage.message.substring(0, 30) + '...'
          });
          results.getAllMessages = true;
        } else {
          console.log('❌ Message structure invalid:', firstMessage);
        }
      } else {
        console.log('⚠️ No messages found, but structure is valid');
        results.getAllMessages = true; // Empty array is still valid
      }
    } else {
      console.log('❌ Data structure invalid - not an array:', typeof messages);
    }

    // Test 3: Message Count
    console.log('🔢 Testing message count...');
    const count = await billboardIndexer.getMessageCount();
    if (typeof count === 'number' && count >= 0) {
      results.getMessageCount = true;
      console.log('✅ Message count valid:', count);
    } else {
      console.log('❌ Message count invalid:', count);
    }

  } catch (error) {
    console.error('❌ Indexer test failed:', error);
    
    // Detailed error analysis
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        console.log('🔍 Network/fetch error - check API endpoint and keys');
      } else if (error.message.includes('GraphQL')) {
        console.log('🔍 GraphQL error - check query structure');
      } else if (error.message.includes('Authorization')) {
        console.log('🔍 Auth error - check API key');
      } else {
        console.log('🔍 Unknown error:', error.message);
      }
    }
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('API Connection:', results.apiConnection ? '✅' : '❌');
  console.log('Data Structure:', results.dataStructure ? '✅' : '❌');
  console.log('Get Messages:', results.getAllMessages ? '✅' : '❌');
  console.log('Get Count:', results.getMessageCount ? '✅' : '❌');
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return {
    success: allPassed,
    results,
    timestamp: new Date().toISOString()
  };
}

/**
 * Quick test runner for development
 * Usage: import and call in a component or run in browser console
 */
export async function runIndexerTest() {
  try {
    const result = await testIndexerFunctionality();
    return result;
  } catch (error) {
    console.error('Test runner failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Export for easy browser console testing
if (typeof window !== 'undefined') {
  (window as unknown as { testIndexer: typeof runIndexerTest }).testIndexer = runIndexerTest;
  console.log('🧪 Indexer test available: window.testIndexer()');
}