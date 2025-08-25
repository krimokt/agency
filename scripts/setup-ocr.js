/**
 * OCR Setup Helper Script
 * Helps diagnose and fix OCR configuration issues
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

function checkOCRSetup() {
  console.log('🔧 OCR Pipeline Setup Checker\n');
  
  let allGood = true;
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  const requiredVars = [
    'GCP_PROJECT_ID',
    'GCP_LOCATION', 
    'GCP_KEY_FILE',
    'PROCESSOR_ID_CIN_FRONT',
    'PROCESSOR_ID_CIN_BACK',
    'PROCESSOR_ID_DRIVER_FRONT',
    'PROCESSOR_ID_DRIVER_BACK'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${value}`);
    } else {
      console.log(`  ❌ ${varName}: Missing`);
      allGood = false;
    }
  });
  
  console.log('');
  
  // Check key file
  console.log('🔑 Service Account Key:');
  const keyFile = process.env.GCP_KEY_FILE;
  if (keyFile) {
    if (fs.existsSync(keyFile)) {
      console.log(`  ✅ Key file found: ${keyFile}`);
      
      // Try to read and validate JSON
      try {
        const keyContent = fs.readFileSync(keyFile, 'utf8');
        const keyData = JSON.parse(keyContent);
        
        if (keyData.type === 'service_account') {
          console.log(`  ✅ Valid service account key`);
          console.log(`  📧 Service account: ${keyData.client_email}`);
          console.log(`  🆔 Project ID: ${keyData.project_id}`);
          
          // Check if project ID matches
          if (keyData.project_id !== process.env.GCP_PROJECT_ID) {
            console.log(`  ⚠️  Warning: Key project ID (${keyData.project_id}) doesn't match GCP_PROJECT_ID (${process.env.GCP_PROJECT_ID})`);
          }
        } else {
          console.log(`  ❌ Invalid key file format`);
          allGood = false;
        }
      } catch (error) {
        console.log(`  ❌ Error reading key file: ${error.message}`);
        allGood = false;
      }
    } else {
      console.log(`  ❌ Key file not found: ${keyFile}`);
      allGood = false;
    }
  } else {
    console.log(`  ❌ GCP_KEY_FILE not set`);
    allGood = false;
  }
  
  console.log('');
  
  // Check directories
  console.log('📁 Directory Structure:');
  const keysDir = path.join(process.cwd(), 'keys');
  if (fs.existsSync(keysDir)) {
    console.log(`  ✅ Keys directory exists: ${keysDir}`);
    
    const files = fs.readdirSync(keysDir);
    if (files.length > 1) { // More than just README.md
      console.log(`  📄 Files in keys directory:`);
      files.forEach(file => {
        if (file !== 'README.md') {
          console.log(`    - ${file}`);
        }
      });
    } else {
      console.log(`  📄 Only README.md in keys directory`);
    }
  } else {
    console.log(`  ❌ Keys directory missing`);
    allGood = false;
  }
  
  console.log('');
  
  // Provide recommendations
  console.log('💡 Recommendations:');
  
  if (allGood) {
    console.log('  🎉 Everything looks good! Your OCR pipeline should work.');
    console.log('  🚀 Try uploading a document through the web interface.');
  } else {
    console.log('  📝 To fix the OCR pipeline:');
    
    if (!process.env.GCP_KEY_FILE || !fs.existsSync(process.env.GCP_KEY_FILE)) {
      console.log('');
      console.log('  🔑 Get your Google Cloud service account key:');
      console.log('    1. Go to https://console.cloud.google.com/');
      console.log('    2. Navigate to IAM & Admin > Service Accounts');
      console.log('    3. Find or create a service account with Document AI permissions');
      console.log('    4. Create a new JSON key');
      console.log('    5. Download and save as ./keys/docai-key.json');
      console.log('    6. Restart your development server');
    }
    
    const missingVars = requiredVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      console.log('');
      console.log('  📝 Add missing environment variables to .env.local:');
      missingVars.forEach(varName => {
        console.log(`    ${varName}=your_value_here`);
      });
    }
  }
  
  console.log('');
  console.log('🔗 Useful Links:');
  console.log('  - Google Cloud Console: https://console.cloud.google.com/');
  console.log('  - Document AI: https://console.cloud.google.com/ai/document-ai');
  console.log('  - Service Accounts: https://console.cloud.google.com/iam-admin/serviceaccounts');
  
  return allGood;
}

// Run the check
const isSetupComplete = checkOCRSetup();
process.exit(isSetupComplete ? 0 : 1);