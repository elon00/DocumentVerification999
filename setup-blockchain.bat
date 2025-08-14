@echo off
echo ==========================================
echo  Aptos Blockchain Integration Setup
echo ==========================================
echo.

echo 📋 Step 1: Checking Aptos CLI...
aptos --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Aptos CLI not found!
    echo.
    echo 📥 Please download Aptos CLI manually:
    echo    1. Go to: https://github.com/aptos-labs/aptos-core/releases
    echo    2. Download: aptos-cli-7.7.0-Windows-x86_64.zip
    echo    3. Extract aptos.exe to your PATH
    echo    4. Run this script again
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Aptos CLI found!
)

echo.
echo 📋 Step 2: Setting up environment...
if not exist .env (
    echo # Aptos Configuration > .env
    echo VITE_APP_NETWORK=devnet >> .env
    echo VITE_MODULE_ADDRESS= >> .env
    echo VITE_APTOS_API_KEY= >> .env
    echo ✅ Created .env file
) else (
    echo ✅ .env file already exists
)

echo.
echo 📋 Step 3: Manual steps required...
echo.
echo 🚀 DEPLOYMENT INSTRUCTIONS:
echo    1. Open Command Prompt (cmd)
echo    2. Run: cd contract
echo    3. Run: aptos init --network devnet
echo    4. Run: aptos move compile
echo    5. Run: aptos move publish
echo    6. Copy the contract address
echo    7. Update VITE_MODULE_ADDRESS in .env file
echo    8. Run: npm run dev
echo.
echo 💰 NEED APT TOKENS?
echo    Visit: https://aptoslabs.com/faucet
echo.
echo 📖 FULL GUIDE:
echo    See: DEPLOYMENT_GUIDE.md
echo.
echo 🎉 After deployment, your transactions will appear in:
echo    - Petra Wallet transaction history
echo    - Aptos Explorer: https://explorer.aptoslabs.com/
echo.
pause
