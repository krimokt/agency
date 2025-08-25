# 🔧 Environment Setup for Google Cloud Document AI

## 📋 **Required Environment Variables**

Create a `.env.local` file in your project root with these variables:

```env
# Google Cloud Configuration
GCP_PROJECT_ID=423581069301
GCP_LOCATION=us
GCP_KEY_FILE=./keys/docai-key.json
```

## 🗂️ **File Structure**

```
your-project/
├── .env.local                    # Environment variables
├── keys/
│   └── docai-key.json          # Service account key file
└── src/
    └── lib/
        └── docai.ts            # Document AI helper
```

## 🛠️ **Setup Steps**

### **1. Create Google Cloud Project**
- ✅ **Already done!** Your project ID is: `423581069301`

### **2. Enable Document AI API**
- ✅ **Already done!** Document AI API is enabled

### **3. Create Document AI Processors**
- ✅ **Already done!** You have 4 Custom Extractor processors:

#### **Moroccan National Identity Card**
- **Front Side**: `3a99d7a85b81d553` - "Moroccan IDs"
- **Back Side**: `57289e0cb8656e24` - "moroccan id back"

#### **Moroccan Driver License**
- **Front Side**: `66a18a389e1dc180` - "moroccan_driver_front"
- **Back Side**: `c48ce968f7471c21` - "moroccan_driver_back"

All processors are:
- **Type**: Custom Extractor (trained specifically for your documents)
- **Status**: Enabled
- **Region**: us

### **4. Create Service Account**
- Go to **IAM & Admin > Service Accounts**
- Click **Create Service Account**
- Give it a name (e.g., "document-ai-service")
- Add these roles:
  - **Document AI API User**
  - **Service Account Token Creator**

### **5. Download Service Account Key**
- Click on your service account
- Go to **Keys** tab
- Click **Add Key > Create New Key**
- Choose **JSON** format
- Download the file

### **6. Place Key File**
- Create a `keys` folder in your project root
- Place the downloaded JSON file as `keys/docai-key.json`
- **Important**: Add `keys/` to your `.gitignore` file

### **7. Set Environment Variables**
Update your `.env.local`:

```env
GCP_PROJECT_ID=423581069301
GCP_LOCATION=us
GCP_KEY_FILE=./keys/docai-key.json
```

## 🔍 **Testing Your Setup**

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test configuration**:
   ```bash
   node test-docai.js
   ```

3. **Navigate to** `/test-docai`

4. **Click "Test Configuration"** to verify your setup

5. **Navigate to** `/id-extract`

6. **Select document type** from the dropdown (all 4 processors available)

7. **Upload a test document** (corresponding side of ID or driver license)

8. **Click "Extract Information"**

## 🚨 **Common Issues**

### **"Service account key file not found"**
- Check the path in `GCP_KEY_FILE`
- Ensure the `keys` folder exists
- Verify the JSON file is named correctly

### **"Missing required environment variables"**
- Check your `.env.local` file
- Ensure all three variables are set
- Restart your development server

### **"Permission denied"**
- Verify your service account has the correct roles
- Check that Document AI API is enabled
- Ensure billing is enabled on your project

### **"Processor not found"**
- ✅ **All processor IDs are correct**
- Verify the processors are in the correct location (us)
- Ensure the processors are active (✅ Enabled)

## 🔒 **Security Notes**

- **Never commit** your service account key to Git
- Add `keys/` to your `.gitignore` file
- Use environment variables for production
- Consider using Google Cloud's Application Default Credentials for production

## 📚 **Next Steps**

Once your environment is set up:

1. **Test with sample documents** from each processor
2. **Process both sides** of IDs and driver licenses
3. **Customize field extraction** as needed
4. **Deploy to production** with proper security

## 🆘 **Need Help?**

- Check the [Google Cloud Documentation](https://cloud.google.com/document-ai)
- Ensure all environment variables are correctly set
- Verify your Google Cloud project configuration
- Use the test page at `/test-docai` to debug issues
- Run `node test-docai.js` to test all processors
