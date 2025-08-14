# File Hash Verifier dApp - Project Structure

## Overview

A complete full-stack blockchain application for file integrity verification built on the Aptos network.

## 🏗️ Project Structure

```
filehashverifier/
├── 📁 contract/                    # Smart contract (Move)
│   ├── Move.toml                   # Move project configuration
│   ├── 📁 sources/
│   │   ├── file_hash_verifier.move # Main smart contract
│   │   └── message_board.move      # Legacy (can be removed)
│   └── 📁 tests/
│       └── test_end_to_end.move    # Unit tests
│
├── 📁 frontend/                    # React frontend
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # App entry point
│   ├── index.css                   # Global styles
│   ├── constants.ts                # App constants
│   │
│   ├── 📁 components/              # React components
│   │   ├── FileHashVerifier.tsx    # Main dApp component
│   │   ├── Header.tsx              # App header
│   │   ├── WalletDetails.tsx       # Wallet info
│   │   ├── NetworkInfo.tsx         # Network status
│   │   ├── AccountInfo.tsx         # Account details
│   │   └── 📁 ui/                  # UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── toast.tsx
│   │
│   ├── 📁 entry-functions/         # Blockchain transactions
│   │   ├── storeFileHash.ts        # Store file hash
│   │   └── verifyFileHash.ts       # Verify file hash
│   │
│   ├── 📁 view-functions/          # Blockchain queries
│   │   ├── getAllFiles.ts          # Get all files
│   │   ├── getTotalFiles.ts        # Get file count
│   │   └── getFileByName.ts        # Get specific file
│   │
│   ├── 📁 utils/                   # Utilities
│   │   ├── aptosClient.ts          # Aptos client setup
│   │   └── helpers.ts              # Helper functions
│   │
│   └── 📁 lib/
│       └── utils.ts                # General utilities
│
├── 📁 scripts/                     # Development scripts
│   └── 📁 move/
│       ├── compile.js              # Compile contracts
│       ├── publish.js              # Deploy contracts
│       ├── test.js                 # Run tests
│       └── upgrade.js              # Upgrade contracts
│
├── 📁 public/                      # Static assets
│   ├── aptos.png                   # App icon
│   └── 📁 icons/                   # PWA icons
│
├── 📄 Configuration Files
├── package.json                    # Dependencies & scripts
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
├── components.json                 # UI components config
├── .env.example                    # Environment template
├── .env                           # Environment variables
│
└── 📄 Documentation
    ├── README.md                   # Main documentation
    ├── DEMO.md                     # Demo guide
    └── LICENSE                     # Apache 2.0 license
```

## 🎯 Key Components

### Smart Contract (`contract/sources/file_hash_verifier.move`)

- **Language**: Move (Aptos blockchain)
- **Purpose**: Store and verify file hashes immutably
- **Key Functions**:
  - `store_file_hash()` - Store file hash with metadata
  - `verify_file_hash()` - Verify file against stored hash
  - `get_all_files()` - Retrieve all stored files
  - `get_file_by_name()` - Get specific file record

### Frontend (`frontend/`)

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite
- **Key Features**:
  - Wallet integration (Petra, Martian, etc.)
  - File upload and hash calculation
  - Real-time blockchain interaction
  - Responsive design

### Main Component (`frontend/components/FileHashVerifier.tsx`)

- File upload and hash calculation (SHA-256)
- Store file hashes on blockchain
- Verify file integrity
- Display all stored files
- Real-time feedback and notifications

## 🔧 Technology Stack

### Blockchain

- **Aptos Network** - High-performance blockchain
- **Move Language** - Safe smart contract development
- **Aptos TS SDK** - TypeScript integration

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast development and building
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components

### Development Tools

- **Node.js** - Runtime environment
- **npm** - Package management
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Compile Smart Contract

```bash
npm run move:compile
```

### 4. Run Tests

```bash
npm run move:test
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Deploy Smart Contract (Optional)

```bash
npm run move:publish
```

## 📝 Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run fmt` - Format code with Prettier

### Smart Contract

- `npm run move:compile` - Compile Move contracts
- `npm run move:test` - Run Move unit tests
- `npm run move:publish` - Deploy to blockchain
- `npm run move:upgrade` - Upgrade existing contract

### Deployment

- `npm run deploy` - Deploy to Vercel

## 🔒 Security Features

### Client-Side Security

- **Local Hash Calculation**: Files never leave your device
- **Web Crypto API**: Browser-native cryptographic operations
- **Wallet Signing**: All transactions signed by user wallet

### Blockchain Security

- **Immutable Storage**: Hashes stored permanently on blockchain
- **Event Logging**: All actions recorded as blockchain events
- **Access Control**: Only file owners can perform certain operations

## 🎮 Usage Flow

### Store File Hash

1. User selects file
2. Client calculates SHA-256 hash
3. User signs transaction
4. Hash stored on blockchain
5. Confirmation and file appears in list

### Verify File

1. User selects file to verify
2. Client calculates current hash
3. System compares with blockchain record
4. Result displayed (match/mismatch)
5. Verification count updated

## 🌟 Features

### Core Functionality

- ✅ File hash storage on blockchain
- ✅ File integrity verification
- ✅ Immutable audit trail
- ✅ Multiple wallet support

### User Experience

- ✅ Drag & drop file upload
- ✅ Real-time hash calculation
- ✅ Instant feedback
- ✅ Responsive design
- ✅ Toast notifications

### Developer Experience

- ✅ TypeScript support
- ✅ Hot module replacement
- ✅ Comprehensive testing
- ✅ Easy deployment
- ✅ Clean code structure

## 🔮 Potential Extensions

### Technical Enhancements

- IPFS integration for file storage
- Multiple hash algorithms (MD5, SHA-1, etc.)
- Batch file processing
- API endpoints for programmatic access

### Feature Additions

- File sharing with permissions
- Timestamping services
- Multi-signature verification
- Mobile app version
- Browser extension

### Integrations

- CI/CD pipeline integration
- Git hooks for automatic verification
- Cloud storage integration
- Enterprise SSO support

## 📊 Performance Considerations

### Frontend Optimization

- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

### Blockchain Optimization

- Gas-efficient smart contracts
- Batch operations
- Event-based indexing
- State management optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review process

## 📄 License

Apache License 2.0 - see LICENSE file for details.

---

This project demonstrates the power of blockchain technology for file integrity verification while maintaining a user-friendly interface and developer-friendly codebase.
