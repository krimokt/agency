const { DocumentProcessorServiceClient } = require("@google-cloud/documentai");
const fs = require("fs");

// Test configuration
const config = {
  projectId: "423581069301",
  location: "us",
  keyFile: "./keys/docai-key.json"
};

// All your processors
const processors = [
  {
    id: "3a99d7a85b81d553",
    name: "Moroccan IDs (Front)",
    description: "Front side of Moroccan National Identity Card"
  },
  {
    id: "57289e0cb8656e24",
    name: "moroccan id back",
    description: "Back side of Moroccan National Identity Card"
  },
  {
    id: "66a18a389e1dc180",
    name: "moroccan_driver_front",
    description: "Front side of Moroccan Driver License"
  },
  {
    id: "c48ce968f7471c21",
    name: "moroccan_driver_back",
    description: "Back side of Moroccan Driver License"
  }
];

async function testDocumentAI() {
  try {
    console.log("🔧 Testing Document AI with your configuration...");
    console.log("📋 Config:", config);
    console.log("📄 Processors to test:", processors.length);
    
    // Check if key file exists
    if (!fs.existsSync(config.keyFile)) {
      console.error("❌ Service account key file not found:", config.keyFile);
      console.log("💡 Please place your service account key file in the keys/ folder");
      return;
    }
    
    // Initialize client
    const client = new DocumentProcessorServiceClient({
      keyFilename: config.keyFile,
    });
    
    console.log("✅ Document AI client initialized");
    
    // Test each processor
    for (const processor of processors) {
      console.log(`\n🔍 Testing processor: ${processor.name}`);
      console.log(`📝 Description: ${processor.description}`);
      
      const processorName = `projects/${config.projectId}/locations/${config.location}/processors/${processor.id}`;
      console.log(`📍 Processor name: ${processorName}`);
      
      try {
        // Try to get processor info
        const [processorInfo] = await client.getProcessor({
          name: processorName,
        });
        
        console.log("✅ Processor found and accessible!");
        console.log("📄 Processor details:", {
          name: processorInfo.name,
          type: processorInfo.type,
          state: processorInfo.state,
          displayName: processorInfo.displayName
        });
        
      } catch (error) {
        console.error(`❌ Error accessing processor ${processor.name}:`, error.message);
        
        if (error.message.includes('NOT_FOUND')) {
          console.log("💡 Check if the processor ID is correct");
        } else if (error.message.includes('PERMISSION_DENIED')) {
          console.log("💡 Check your service account permissions");
        }
        continue;
      }
    }
    
    console.log("\n🎉 Document AI setup test completed!");
    console.log("💡 You can now use these processors in your Next.js application");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("🔍 Error details:", error);
  }
}

// Run the test
testDocumentAI();
