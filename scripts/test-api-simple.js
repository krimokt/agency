/**
 * Simple API Test
 * Tests the /api/id-extract endpoint with a minimal request
 */

async function testAPI() {
  console.log('🔧 Testing API endpoint...\n');
  
  try {
    const response = await fetch('http://localhost:3005/api/id-extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true })
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📊 Response body:', data);
    
    if (response.ok) {
      console.log('✅ API is responding');
    } else {
      console.log('❌ API returned error');
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to API:', error.message);
    console.log('💡 Make sure the development server is running on port 3005');
  }
}

testAPI();