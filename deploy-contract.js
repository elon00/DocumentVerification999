const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployContract() {
  console.log('🚀 Starting Aptos Contract Deployment...');
  
  try {
    // Check if we have the contract directory
    const contractDir = path.join(__dirname, 'contract');
    if (!fs.existsSync(contractDir)) {
      console.error('❌ Contract directory not found!');
      return;
    }
    
    console.log('📁 Contract directory found');
    
    // First, let's manually download the Aptos CLI
    console.log('📥 Downloading Aptos CLI manually...');
    
    // Create a simple batch file to download CLI
    const downloadScript = `
@echo off
echo Downloading Aptos CLI...
curl -L -o aptos-cli.zip "https://github.com/aptos-labs/aptos-core/releases/download/aptos-cli-v7.7.0/aptos-cli-7.7.0-Windows-x86_64.zip"
if exist aptos-cli.zip (
    echo Extracting...
    tar -xf aptos-cli.zip
    echo Done!
    del aptos-cli.zip
) else (
    echo Failed to download CLI
)
`;
    
    fs.writeFileSync('download-cli.bat', downloadScript);
    
    try {
      execSync('download-cli.bat', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Automated download failed, continuing with existing setup...');
    }
    
    // Clean up
    if (fs.existsSync('download-cli.bat')) {
      fs.unlinkSync('download-cli.bat');
    }
    
    console.log('\n📋 Manual Deployment Instructions:');
    console.log('==================================');
    console.log('1. Install Aptos CLI manually:');
    console.log('   - Download from: https://github.com/aptos-labs/aptos-core/releases');
    console.log('   - Extract aptos.exe to your PATH');
    console.log('');
    console.log('2. Initialize Aptos account:');
    console.log('   aptos init --network devnet');
    console.log('');
    console.log('3. Compile the contract:');
    console.log('   cd contract');
    console.log('   aptos move compile');
    console.log('');
    console.log('4. Deploy the contract:');
    console.log('   aptos move publish');
    console.log('');
    console.log('5. Copy the module address to your .env file:');
    console.log('   VITE_MODULE_ADDRESS=0xYOUR_ADDRESS_HERE');
    console.log('');
    console.log('📱 After deployment, transactions will appear in:');
    console.log('   - Petra Wallet transaction history');
    console.log('   - Aptos Explorer: https://explorer.aptoslabs.com/');
    
    // Create a sample .env file
    const envContent = `# Aptos Configuration
VITE_APP_NETWORK=devnet
VITE_MODULE_ADDRESS=
VITE_APTOS_API_KEY=

# Instructions:
# 1. Deploy your contract using: aptos move publish
# 2. Copy the deployed module address to VITE_MODULE_ADDRESS
# 3. Restart the development server: npm run dev
`;
    
    if (!fs.existsSync('.env')) {
      fs.writeFileSync('.env', envContent);
      console.log('\n✅ Created .env file template');
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure you have internet connection');
    console.log('- Try running as administrator');
    console.log('- Check Windows Defender/antivirus settings');
  }
}

deployContract();
