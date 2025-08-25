/**
 * Test OCR Configuration Script
 * Run with: node scripts/test-ocr-config.js
 */

require('dotenv').config({ path: '.env.local' });

// Simple configuration test without TypeScript
function testOCRConfig() {
  console.log('🔧 Testing OCR Configuration...\n');
  
  const requiredVars = [
    'GCP_PROJECT_ID',
    'GCP_LOCATION', 
    'GCP_KEY_FILE',
    'PROCESSOR_ID_CIN_FRONT',
    'PROCESSOR_ID_CIN_BACK',
    'PROCESSOR_ID_DRIVER_FRONT',
    'PROCESSOR_ID_DRIVER_BACK'
  ];

  const missing = [];
  const present = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    } else {
      present.push({ name: varName, value });
    }
  }

  if (missing.length > 0) {
    console.log('❌ Configuration Test: FAILED\n');
    console.log('📝 Missing Environment Variables:');
    missing.forEach(variable => console.log(`  - ${variable}`));
    console.log('');
    return false;
  }

  console.log('✅ Configuration Test: PASSED\n');
  console.log('📋 Configuration Summary:');
  present.forEach(({ name, value }) => {
    if (name === 'GCP_KEY_FILE') {
      const fs = require('fs');
      const exists = fs.existsSync(value);
      console.log(`  ${name}: ${value} ${exists ? '✅' : '❌ (file not found)'}`);
    } else {
      console.log(`  ${name}: ${value}`);
    }
  });
  console.log('');

  // Test processor IDs format
  const processorIds = [
    { name: 'CIN Front', value: process.env.PROCESSOR_ID_CIN_FRONT },
    { name: 'CIN Back', value: process.env.PROCESSOR_ID_CIN_BACK },
    { name: 'Driver Front', value: process.env.PROCESSOR_ID_DRIVER_FRONT },
    { name: 'Driver Back', value: process.env.PROCESSOR_ID_DRIVER_BACK }
  ];

  console.log('🔍 Processor Configuration:');
  processorIds.forEach(({ name, value }) => {
    const isValid = /^[a-zA-Z0-9]+$/.test(value);
    console.log(`  ${name}: ${value} ${isValid ? '✅' : '⚠️  (unusual format)'}`);
  });
  console.log('');

  console.log('💡 Next Steps:');
  console.log('  - Configuration is ready for OCR pipeline implementation');
  console.log('  - You can now proceed with Task 2: Create core data models');
  console.log('');

  return true;
}

// Run the test
testOCRConfig();