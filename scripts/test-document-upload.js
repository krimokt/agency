/**
 * Test Document Upload
 * Simulates uploading a document to test the OCR API
 */

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testDocumentUpload() {
  console.log('🔧 Testing Document Upload API...\n');
  
  try {
    // Check if we have a test image
    const testImagePath = './test-images/sample-id.jpg';
    
    if (!fs.existsSync(testImagePath)) {
      console.log('📁 No test image found at:', testImagePath);
      console.log('💡 To test with a real document:');
      console.log('  1. Create a "test-images" folder');
      console.log('  2. Add a sample Moroccan ID image as "sample-id.jpg"');
      console.log('  3. Run this script again');
      console.log('');
      console.log('🌐 Or test through the web interface:');
      console.log('  1. Go to http://localhost:3005');
      console.log('  2. Upload a document');
      console.log('  3. Check browser console for detailed logs');
      return;
    }
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath));
    form.append('processorId', process.env.PROCESSOR_ID_CIN_FRONT || '3a99d7a85b81d553');
    
    console.log('📤 Sending test document to API...');
    
    // Send request
    const response = await fetch('http://localhost:3005/api/id-extract', {
      method: 'POST',
      body: form
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API Response: Success');
      console.log('📋 Extracted Fields:');
      
      Object.entries(result.fields || {}).forEach(([key, value]) => {
        if (key !== 'fullText' && key !== 'rawEntities') {
          console.log(`  ${key}: ${value}`);
        }
      });
      
      if (result.fields?.rawEntities) {
        console.log('\n🔍 Raw Entities:');
        result.fields.rawEntities.forEach((entity, index) => {
          console.log(`  ${index + 1}. ${entity.type}: "${entity.text}" (${entity.confidence})`);
        });
      }
      
    } else {
      console.log('❌ API Response: Error');
      console.log('Error:', result.error);
      console.log('Details:', result.details);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3005/api/debug-ocr');
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server not running on port 3005');
    console.log('💡 Start your server with: npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testDocumentUpload();
  }
}

main();