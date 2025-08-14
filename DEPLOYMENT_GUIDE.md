# 🚀 Real Aptos Blockchain Integration Guide

## 🎯 Overview

This guide will help you deploy the smart contract so your transactions appear in your **Petra wallet** and are viewable on the **Aptos Explorer**.

## 📋 Prerequisites

### 1. Install Aptos CLI

Due to PowerShell issues on your system, download manually:

1. **Download CLI**: Go to [Aptos CLI Releases](https://github.com/aptos-labs/aptos-core/releases)
2. **Find**: `aptos-cli-7.7.0-Windows-x86_64.zip`
3. **Extract**: `aptos.exe` to a folder in your PATH (e.g., `C:\Windows\System32\`)
4. **Test**: Open cmd and run `aptos --version`

### 2. Get APT Tokens

1. **Faucet**: Visit [https://aptoslabs.com/faucet](https://aptoslabs.com/faucet)
2. **Connect**: Your Petra wallet
3. **Request**: Devnet APT tokens (free)

## 🚀 Deployment Steps

### Step 1: Initialize Aptos Account

```bash
cd contract
aptos init --network devnet
```

- Choose **devnet**
- Let it generate a new private key
- **Important**: Save the private key securely!

### Step 2: Compile the Contract

```bash
aptos move compile
```

### Step 3: Deploy to Devnet

```bash
aptos move publish
```

- **Result**: You'll get a contract address like `0x1234...`
- **Copy**: This address for the next step

### Step 4: Configure Environment

Create/update `.env` file in project root:

```env
VITE_APP_NETWORK=devnet
VITE_MODULE_ADDRESS=0x[YOUR_CONTRACT_ADDRESS_HERE]
VITE_APTOS_API_KEY=
```

### Step 5: Restart App

```bash
npm run dev
```

## ✅ Testing Real Blockchain

### 1. Connect Petra Wallet

- Switch app to **Blockchain Mode**
- Connect your Petra wallet
- Ensure you're on **Devnet**

### 2. Store a File

- Upload any file
- Click **"Store on Blockchain (Gas Required)"**
- **Approve** transaction in Petra wallet
- **Wait** for confirmation (~3-5 seconds)

### 3. Verify Real Transaction

- **Petra Wallet**: Check transaction history
- **Aptos Explorer**: Visit [https://explorer.aptoslabs.com/](https://explorer.aptoslabs.com/)
- **Search**: Your transaction hash
- **Verify**: Transaction details, gas fees, timestamp

## 🔍 What You'll See

### In Petra Wallet:

- ✅ Transaction history with gas fees
- ✅ Contract interaction details
- ✅ APT balance changes

### On Aptos Explorer:

- ✅ Full transaction details
- ✅ Contract execution logs
- ✅ Gas usage breakdown
- ✅ Timestamp and block info

## 🛠️ Troubleshooting

### PowerShell Issues

```bash
# Use Command Prompt instead of PowerShell
cmd
cd contract
aptos move compile
```

### Network Timeouts

1. **VPN**: Try using a VPN connection
2. **Wait**: Network might be congested
3. **Retry**: Run commands again after 5-10 minutes

### Contract Deployment Failed

```bash
# Check account balance
aptos account list --account YOUR_ADDRESS

# Get more tokens if needed
# Visit: https://aptoslabs.com/faucet
```

### Transaction Rejected

- **Gas Fees**: Ensure you have enough APT
- **Network**: Confirm you're on Devnet
- **Wallet**: Check Petra wallet connection

## 📱 Verification Checklist

After deployment, verify:

- [ ] Contract compiles successfully
- [ ] Deployment returns contract address
- [ ] `.env` file updated with address
- [ ] App restarts without errors
- [ ] Blockchain mode shows "Real Aptos Blockchain Connected"
- [ ] File upload creates real transaction
- [ ] Transaction appears in Petra wallet
- [ ] Transaction viewable on Aptos Explorer

## 🎉 Success!

Once deployed, your file hash verifier will:

- ✅ Create **real blockchain transactions**
- ✅ Charge **actual gas fees**
- ✅ Show in **Petra wallet history**
- ✅ Be **publicly viewable** on Aptos Explorer
- ✅ Provide **permanent, immutable** file verification

## 🔗 Useful Links

- **Aptos CLI**: https://github.com/aptos-labs/aptos-core/releases
- **Faucet**: https://aptoslabs.com/faucet
- **Explorer**: https://explorer.aptoslabs.com/
- **Petra Wallet**: https://petra.app/
- **Aptos Docs**: https://aptos.dev/en/build/smart-contracts

### Module Not Found Error

- Verify the MODULE_ADDRESS in .env matches your deployed contract
- Ensure the contract was successfully deployed to devnet
- Check the blockchain explorer to confirm deployment

## Alternative: Use Demo Mode

If you encounter deployment issues, you can continue using the demo mode which provides the same functionality locally without blockchain integration.

## Support

- Aptos Developer Documentation: https://aptos.dev/
- Move Language Guide: https://move-language.github.io/move/
- Community Discord: https://discord.gg/aptoslabs
