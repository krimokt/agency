/**
 * Test Document AI Processors
 * Verifies if the configured processors are accessible
 */

require('dotenv').config({ path: '.env.local' });
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai');

async function testProcessors() {
  console.log('🔧 Testing Document AI Processors...\n');
  
  try {
    // Initialize client
    const client = new DocumentProcessorServiceClient({
      keyFilename: process.env.GCP_KEY_FILE,
    });
    
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION;
    
    console.log(`📋 Project: ${projectId}`);
    console.log(`📍 Location: ${location}\n`);
    
    // Test each processor
    const processors = [
      { name: 'CIN Front', id: process.env.PROCESSOR_ID_CIN_FRONT },
      { name: 'CIN Back', id: process.env.PROCESSOR_ID_CIN_BACK },
      { name: 'Driver Front', id: process.env.PROCESSOR_ID_DRIVER_FRONT },
      { name: 'Driver Back', id: process.env.PROCESSOR_ID_DRIVER_BACK }
    ];
    
    console.log('🔍 Testing Processors:');
    
    for (const processor of processors) {
      try {
        const processorName = `projects/${projectId}/locations/${location}/processors/${processor.id}`;
        console.log(`\n  Testing ${processor.name} (${processor.id})...`);
        
        const [processorInfo] = await client.getProcessor({
          name: processorName,
        });
        
        console.log(`  ✅ ${processor.name}: Accessible`);
        console.log(`     Display Name: ${processorInfo.displayName}`);
        console.log(`     Type: ${processorInfo.type}`);
        console.log(`     State: ${processorInfo.state}`);
        
      } catch (error) {
        console.log(`  ❌ ${processor.name}: ${error.message}`);
        
        if (error.message.includes('NOT_FOUND')) {
          console.log(`     💡 Processor not found in project ${projectId}`);
        } else if (error.message.includes('PERMISSION_DENIED')) {
          console.log(`     💡 Check service account permissions`);
        }
      }
    }
    
    console.log('\n💡 If processors are not found:');
    console.log('  1. Check if processors exist in your Google Cloud project');
    console.log('  2. Create new processors if needed');
    console.log('  3. Update processor IDs in .env.local');
    console.log(`  4. Visit: https://console.cloud.google.com/ai/document-ai?project=${projectId}`);
    
  } catch (error) {
    console.error('❌ Failed to test processors:', error.message);
  }
}

testProcessors();