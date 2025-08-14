# File Hash Verifier dApp

## Project Description

A revolutionary blockchain-based file integrity verification system built on the Aptos network. This decentralized application (dApp) empowers users to leverage blockchain technology for secure, immutable file verification. By storing cryptographic hashes on the blockchain, users can detect file tampering, ensure document authenticity, and maintain a permanent audit trail of their digital assets.

The system eliminates the need for centralized authorities by providing a trustless environment where file integrity can be verified independently. Whether you're securing legal documents, software releases, or sensitive data, this dApp provides an uncompromising solution for digital asset integrity.

## Project Vision

To create a decentralized, trustless ecosystem for file integrity verification that democratizes access to blockchain-based security. Our vision is to build a world where digital document authenticity is verifiable by anyone, anywhere, without relying on centralized authorities or third-party services.

We envision this technology being adopted across industries - from legal firms securing contracts to software companies ensuring release integrity, from academic institutions protecting research data to individuals safeguarding personal documents. By leveraging the immutable nature of blockchain technology, we aim to establish a new standard for digital trust and transparency.

## Key Features

### 🔒 **Immutable Hash Storage**

- Store SHA-256 file hashes permanently on the Aptos blockchain
- Cryptographically secure hash generation using Web Crypto API
- Tamper-proof records with blockchain-backed integrity

### ✅ **Real-time File Verification**

- Instant verification against stored blockchain records
- Comprehensive integrity checking with detailed results
- Detection of any file modifications or corruption

### 📊 **Advanced Analytics & Tracking**

- Monitor verification frequency for each file
- Comprehensive audit trails with timestamp records
- Statistical insights into file verification patterns

### 🌐 **Decentralized Architecture**

- No central authority or single point of failure
- Trustless verification accessible to anyone
- Blockchain-powered transparency and immutability

### 💼 **Enterprise-Ready Interface**

- Intuitive, responsive UI built with modern web technologies
- Professional design suitable for business environments
- Seamless wallet integration with multiple Aptos wallets

### 🔐 **Privacy-First Design**

- Only cryptographic hashes are stored, never actual file content
- Client-side hash calculation ensures data privacy
- User-controlled data with wallet-based authentication

## Future Scope

### 🚀 **Phase 1: Enhanced Security**

- Multi-signature support for enterprise file verification
- Integration with additional hash algorithms (SHA-3, BLAKE2)
- Advanced encryption for sensitive file metadata

### 🌍 **Phase 2: Cross-Chain Integration**

- Support for Ethereum, Solana, and other major blockchains
- Cross-chain verification capabilities
- Universal file integrity protocol development

### 📱 **Phase 3: Mobile & API Expansion**

- Native mobile applications for iOS and Android
- RESTful API for third-party integrations
- CLI tools for developer and enterprise automation

### 🏢 **Phase 4: Enterprise Solutions**

- White-label solutions for enterprise clients
- Integration with existing document management systems
- Advanced role-based access controls and permissions

### 🤝 **Phase 5: Ecosystem Growth**

- Integration with cloud storage providers (AWS, Google Cloud, Azure)
- Partnership with legal and compliance platforms
- Development of industry-specific verification standards

### 🔬 **Phase 6: Advanced Features**

- AI-powered anomaly detection for file patterns
- Batch verification for large file sets
- Smart contract automation for scheduled verifications

## Smart Contract Features

The Move smart contract (`file_hash_verifier.move`) provides:

- `store_file_hash()` - Store a file hash with metadata on the blockchain
- `verify_file_hash()` - Verify a file hash against stored records
- `get_all_files()` - Retrieve all stored file records
- `get_file_by_name()` - Get specific file record by name
- `get_total_files()` - Get total count of stored files

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Blockchain**: Aptos Move smart contracts
- **Wallet Integration**: Aptos Wallet Adapter
- **Development Tools**: Aptos TS SDK, Node.js

## Screenshots

![alt text](<Screenshot 2025-08-05 154542-1.png>)
![alt text](<Screenshot 2025-08-05 154639.png>)

## Contract Details

0x1b9f6c6be32302f53ad0b8fa2c511929dbe1b9736f1ee97cf350382de99b8813

## How It Works

1. **Store File Hash**: Users upload a file, the system calculates its SHA-256 hash, and stores it on the blockchain
2. **Verify File**: Users can upload a file and verify its integrity against stored blockchain records
3. **Immutable Audit Trail**: All storage and verification events are recorded on the blockchain

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- An Aptos wallet (Petra, Martian, etc.)
- Aptos CLI (optional, for contract development)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/HarishRajavarapu/FileHashVerifier.git

cd filehashverifier
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file and set your configuration.

4. Compile and publish the Move contract:

```bash
npm run move:compile
npm run move:publish
```

5. Update the `VITE_MODULE_ADDRESS` in your `.env` file with the deployed contract address.

6. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run move:publish` - Publish the Move contract to the Aptos network
- `npm run move:test` - Run Move unit tests
- `npm run move:compile` - Compile the Move contract
- `npm run move:upgrade` - Upgrade the Move contract
- `npm run dev` - Start the frontend development server
- `npm run build` - Build the frontend for production
- `npm run deploy` - Deploy the dApp to Vercel

## Usage

1. **Connect Wallet**: Connect your Aptos wallet using the wallet selector
2. **Store File Hash**:
   - Click "Store File Hash"
   - Select a file to upload
   - The system will calculate the SHA-256 hash
   - Click "Store Hash on Blockchain" to save it
3. **Verify File**:
   - Click "Verify File Hash"
   - Select the file you want to verify
   - Enter the original filename
   - Click "Verify File Integrity"
   - The system will compare against blockchain records

## Security Considerations

- Files are not uploaded to the blockchain - only their SHA-256 hashes
- Hash calculations are performed client-side using the Web Crypto API
- All blockchain transactions are signed by the user's wallet
- Smart contract events provide an immutable audit trail

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
