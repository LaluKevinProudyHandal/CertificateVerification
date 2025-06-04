const { ethers } = require('ethers');
const crypto = require('crypto');
require('dotenv').config();

// Contract ABI (simplified version focusing on our functions)
const CONTRACT_ABI = [
  "function issueCertificate(string memory _participantName, string memory _eventName, string memory _certificateHash) public returns (uint256)",
  "function verifyCertificateByHash(string memory _certificateHash) public view returns (bool exists, uint256 certificateId, string memory participantName, string memory eventName, uint256 timestamp, bool isValid)",
  "function verifyCertificateById(uint256 _certificateId) public view returns (bool exists, string memory participantName, string memory eventName, string memory certificateHash, uint256 timestamp, bool isValid)",
  "function getTotalCertificates() public view returns (uint256)",
  "function owner() public view returns (address)",
  "event CertificateIssued(uint256 indexed certificateId, string participantName, string eventName, string certificateHash)"
];

class BlockchainService {
  constructor() {
    // Initialize provider (Sepolia testnet)
    this.provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/4d8f99fa4fb84639b1ae6cf832ec7570');
    
    // Initialize wallet with private key
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in environment variables');
    }
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // Initialize contract
    if (!process.env.CONTRACT_ADDRESS) {
      throw new Error('CONTRACT_ADDRESS not found in environment variables');
    }
    this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
    
    console.log('✅ Blockchain service initialized');
    console.log('📝 Wallet address:', this.wallet.address);
    console.log('🔗 Contract address:', process.env.CONTRACT_ADDRESS);
  }

  // Generate hash from file buffer
  generateFileHash(fileBuffer) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  // Issue a new certificate
  async issueCertificate(participantName, eventName, certificateHash) {
    try {
      console.log('🔄 Issuing certificate...');
      console.log('Participant:', participantName);
      console.log('Event:', eventName);
      console.log('Hash:', certificateHash);

      // Estimate gas
      const gasEstimate = await this.contract.issueCertificate.estimateGas(
        participantName,
        eventName,
        certificateHash
      );

      // Send transaction with some extra gas
      const tx = await this.contract.issueCertificate(
        participantName,
        eventName,
        certificateHash,
        {
          gasLimit: gasEstimate + BigInt(10000) // Add 10k extra gas
        }
      );

      console.log('📝 Transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

      // Get certificate ID from event logs
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'CertificateIssued';
        } catch (e) {
          return false;
        }
      });

      let certificateId = null;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        certificateId = parsed.args.certificateId.toString();
      }

      return {
        success: true,
        certificateId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('❌ Error issuing certificate:', error);
      
      // Parse error message
      let errorMessage = error.message;
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Verify certificate by hash
  async verifyCertificateByHash(certificateHash) {
    try {
      console.log('🔍 Verifying certificate by hash:', certificateHash);

      const result = await this.contract.verifyCertificateByHash(certificateHash);
      
      return {
        success: true,
        exists: result.exists,
        certificateId: result.exists ? result.certificateId.toString() : null,
        participantName: result.participantName,
        eventName: result.eventName,
        timestamp: result.exists ? new Date(Number(result.timestamp) * 1000).toISOString() : null,
        isValid: result.isValid
      };

    } catch (error) {
      console.error('❌ Error verifying certificate:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify certificate by ID
  async verifyCertificateById(certificateId) {
    try {
      console.log('🔍 Verifying certificate by ID:', certificateId);

      const result = await this.contract.verifyCertificateById(certificateId);
      
      return {
        success: true,
        exists: result.exists,
        participantName: result.participantName,
        eventName: result.eventName,
        certificateHash: result.certificateHash,
        timestamp: result.exists ? new Date(Number(result.timestamp) * 1000).toISOString() : null,
        isValid: result.isValid
      };

    } catch (error) {
      console.error('❌ Error verifying certificate by ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get total certificates count
  async getTotalCertificates() {
    try {
      const total = await this.contract.getTotalCertificates();
      return {
        success: true,
        total: total.toString()
      };
    } catch (error) {
      console.error('❌ Error getting total certificates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get wallet balance
  async getBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return {
        success: true,
        balance: ethers.formatEther(balance),
        address: this.wallet.address
      };
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = BlockchainService;