# 🎓 Blockchain Certificate Verification System

A blockchain-based certificate verification system using Ethereum smart contracts and Node.js REST API.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Smart Contract](#smart-contract)
- [Testing](#testing)
- [Deployment](#deployment)
- [Demo](#demo)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This project implements a decentralized certificate verification system that uses blockchain technology to ensure the authenticity and immutability of certificates. The system consists of:

- **Smart Contract**: Stores certificate hashes on Ethereum blockchain
- **REST API**: Handles certificate issuance and verification
- **Verification System**: Allows real-time certificate validation

## ✨ Features

- 🔒 **Immutable Storage**: Certificate hashes stored on blockchain
- ⚡ **Fast Verification**: Real-time certificate validation
- 🛡️ **Secure**: SHA-256 hashing with blockchain security
- 🌐 **Accessible**: RESTful API for easy integration
- 💰 **Cost-Effective**: Hash-only storage minimizes gas costs
- 🔍 **Transparent**: All transactions visible on blockchain explorer

## 🚀 Tech Stack

### Blockchain
- **Platform**: Ethereum (Sepolia Testnet)
- **Smart Contract**: Solidity ^0.8.19
- **Development**: Hardhat Framework
- **Web3 Library**: Ethers.js v6

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **File Upload**: Multer
- **Hashing**: Node.js Crypto module
- **Environment**: dotenv

### Tools
- **IDE**: Visual Studio Code
- **Testing**: Hardhat Testing Framework
- **API Testing**: Postman / REST Client

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │────│   REST API      │────│  Smart Contract │
│                 │    │   (Node.js)     │    │   (Solidity)    │
│ - Upload Form   │    │ - File Upload   │    │ - Hash Storage  │
│ - Verify Form   │    │ - Hash Generate │    │ - Verification  │
│                 │    │ - Blockchain    │    │ - Event Logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   File System   │    │   Ethereum      │
                       │   (Uploads)     │    │   (Sepolia)     │
                       └─────────────────┘    └─────────────────┘
```

## 📦 Installation

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- MetaMask wallet
- SepoliaETH for deployment

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/certificate-verification.git
cd certificate-verification
```

### Step 2: Install Dependencies
```bash
# Install all dependencies
npm install

# Or install separately
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install express multer crypto fs-extra cors dotenv ethers
```

### Step 3: Project Structure
```
certificate-verification/
├── contracts/
│   └── CertificateVerification.sol
├── scripts/
│   └── deploy.js
├── api/
│   ├── server.js
│   ├── routes/
│   │   └── certificates.js
│   ├── utils/
│   │   └── blockchain.js
│   └── uploads/
├── test/
├── hardhat.config.js
├── .env
└── README.md
```

## ⚙️ Configuration

### 1. Environment Variables
Create `.env` file in root directory:

```env
# Blockchain Configuration
PRIVATE_KEY=your_metamask_private_key_without_0x
CONTRACT_ADDRESS=deployed_contract_address
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# API Configuration
PORT=3000
NODE_ENV=development

# Optional: Add your Infura Project ID
INFURA_PROJECT_ID=your_infura_project_id
```

### 2. Hardhat Configuration
The `hardhat.config.js` is already configured for Sepolia testnet.

### 3. Get Test Tokens
1. Add Sepolia network to MetaMask
2. Get free SepoliaETH from [Sepolia Faucet](https://sepoliafaucet.com)
3. Ensure you have at least 0.01 SepoliaETH for deployment

## 📚 Usage

### Deploy Smart Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Copy the contract address to .env file
```

### Start API Server

```bash
# Navigate to API directory
cd api

# Start server
node server.js

# Server will run on http://localhost:3000
```

### Test API Endpoints

Use the provided `test-api.http` file with REST Client extension:

```http
### Issue Certificate
POST http://localhost:3000/api/certificates/issue
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="participantName"

John Doe
------WebKitFormBoundary
Content-Disposition: form-data; name="eventName"

Programming Contest 2024
------WebKitFormBoundary
Content-Disposition: form-data; name="certificate"; filename="certificate.pdf"
Content-Type: application/pdf

< ./sample-certificate.pdf
------WebKitFormBoundary--

### Verify Certificate
GET http://localhost:3000/api/certificates/verify/CERTIFICATE_HASH_HERE
```

## 📖 API Documentation

### Endpoints

#### 1. Issue Certificate
**POST** `/api/certificates/issue`

**Request:**
```javascript
// Form Data
{
  "participantName": "John Doe",
  "eventName": "Programming Contest 2024",
  "certificate": "file.pdf" // File upload
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "certificateId": "1",
    "hash": "abc123...",
    "transactionHash": "0x123...",
    "participantName": "John Doe",
    "eventName": "Programming Contest 2024",
    "timestamp": "2024-06-04T10:30:00.000Z"
  }
}
```

#### 2. Verify Certificate
**GET** `/api/certificates/verify/:hash`

**Response:**
```javascript
{
  "success": true,
  "message": "Certificate verified successfully",
  "data": {
    "isValid": true,
    "certificate": {
      "participantName": "John Doe",
      "eventName": "Programming Contest 2024",
      "issuer": "0x123...",
      "timestamp": "1717491000",
      "certificateHash": "abc123..."
    }
  }
}
```

#### 3. Get Certificate Details
**GET** `/api/certificates/:id`

#### 4. Get Certificates by Participant
**GET** `/api/certificates/participant/:name`

### Error Responses
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 📜 Smart Contract

### Contract Functions

```solidity
// Issue new certificate
function issueCertificate(
    string memory _participantName,
    string memory _eventName,
    string memory _certificateHash
) public returns (uint256)

// Verify certificate
function verifyCertificate(string memory _certificateHash) 
    public view returns (bool)

// Get certificate details
function getCertificate(uint256 _certificateId) 
    public view returns (Certificate memory)
```

### Events
```solidity
event CertificateIssued(
    uint256 indexed certificateId,
    string participantName,
    string eventName,
    string certificateHash,
    address indexed issuer
);
```

## 🧪 Testing

### Run Smart Contract Tests
```bash
npx hardhat test
```

### Run API Tests
```bash
# Using Postman collection
# Import: postman-collection.json

# Or using curl
curl -X POST http://localhost:3000/api/certificates/issue \
  -F "participantName=John Doe" \
  -F "eventName=Test Event" \
  -F "certificate=@sample.pdf"
```

### Test Scenarios
1. **Issue Certificate**: Upload valid certificate file
2. **Verify Valid Certificate**: Check existing certificate hash
3. **Verify Invalid Certificate**: Check non-existent hash
4. **Get Certificate Details**: Retrieve certificate by ID
5. **Error Handling**: Test with invalid inputs

## 🚀 Deployment

### Local Development
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Start API server
cd api && node server.js
```

### Testnet Deployment (Sepolia)
```bash
# Deploy smart contract
npx hardhat run scripts/deploy.js --network sepolia

# Update .env with contract address
# Deploy API to cloud service (Heroku, Railway, etc.)
```

### Production Considerations
- Use mainnet for production
- Implement proper authentication
- Add rate limiting
- Use HTTPS
- Monitor gas prices
- Implement proper logging

## 🎬 Demo

### Demo Script
1. **Setup**: Show MetaMask, Sepolia testnet, contract address
2. **Issue Certificate**: 
   - Upload sample certificate via API
   - Show transaction on Sepolia Etherscan
   - Display success response
3. **Verify Certificate**:
   - Use certificate hash to verify
   - Show blockchain query result
   - Demonstrate invalid hash handling

### Video Demo Points
- Smart contract deployment
- API functionality
- Blockchain interaction
- Error handling
- Response time demonstration

## 🔧 Troubleshooting

### Common Issues

#### 1. Contract Deployment Fails
```bash
# Check balance
npx hardhat run scripts/check-balance.js --network sepolia

# Increase gas limit in hardhat.config.js
gas: 3000000,
gasPrice: 20000000000
```

#### 2. API Cannot Connect to Contract
- Verify CONTRACT_ADDRESS in .env
- Check network connection
- Ensure MetaMask is on Sepolia
- Restart API server after .env changes

#### 3. File Upload Issues
- Check file size (max 5MB)
- Verify multer configuration
- Ensure uploads directory exists
- Check file permissions

#### 4. Transaction Failures
- Insufficient SepoliaETH balance
- Gas price too low
- Network congestion
- Invalid contract address

### Debug Commands
```bash
# Check Hardhat configuration
npx hardhat help

# Verify contract on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS

# Test contract interaction
npx hardhat console --network sepolia
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Guidelines
- Follow Solidity best practices
- Add unit tests for new features
- Update documentation
- Use consistent code formatting
- Add error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ethereum Foundation for blockchain technology
- Hardhat team for development framework
- OpenZeppelin for smart contract security standards
- Sepolia testnet for free testing environment

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [lalukevinproudyhandal@mail.ugm.ac.id]
- Documentation: [project-docs-url]

---

**⭐ Star this repository if you find it helpful!**
