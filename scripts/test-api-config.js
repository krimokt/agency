/**
 * Test API Configuration Script
 * Tests if the updated API can load configuration correctly
 */

require('dotenv').config({ path: '.env.local' });

async function testAPIConfig() {
  console.log('🔧 Testing API Configuration...\n');
  
  try {
    // Simulate what the API does
    const { validateOCREnvironment } = require('../src/lib/config/ocr-config.ts');
    
    console.log('📋 Environment Variables:');
    console.log('  GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID ? '✅ Set' : '❌ Missing');
    console.log('  GCP_LOCATION:', process.env.GCP_LOCATION ? '✅ Set' : '❌ Missing');
    console.log('  GCP_KEY_FILE:', process.env.GCP_KEY_FILE ? '✅ Set' : '❌ Missing');
    console.log('  PROCESSOR_ID_CIN_FRONT:', process.env.PROCESSOR_ID_CIN_FRONT ? '✅ Set' : '❌ Missing');
    console.log('  PROCESSOR_ID_CIN_BACK:', process.env.PROCESSOR_ID_CIN_BACK ? '✅ Set' : '❌ Missing');
    console.log('');
    
    // Test validation
    const validation = validateOCREnvironment();
    
    if (validation.isValid) {
      console.log('✅ Configuration validation: PASSED');
      console.log('💡 The API should now work correctly');
    } else {
      console.log('❌ Configuration validation: FAILED');
      console.log('🚫 Errors:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
      
      if (validation.missingVariables.length > 0) {
        console.log('📝 Missing variables:');
        validation.missingVariables.forEach(variable => console.log(`  - ${variable}`));
      }
    }
    
    console.log('');
    console.log('🎯 Next Steps:');
    if (validation.isValid) {
      console.log('  - Try uploading a document through the web interface');
      console.log('  - The API should now use the correct environment variables');
      console.log('  - Check the browser console for detailed processing logs');
    } else {
      console.log('  - Fix the missing environment variables');
      console.log('  - Ensure the service account key file exists');
      console.log('  - Restart the development server after fixing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure you have built the TypeScript files or run this in a Next.js context');
  }
}

testAPIConfig();