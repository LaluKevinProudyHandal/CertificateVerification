const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const BlockchainService = require('../utils/blockchain');

const router = express.Router();

// Initialize blockchain service
let blockchainService;
try {
  blockchainService = new BlockchainService();
} catch (error) {
  console.error('❌ Failed to initialize blockchain service:', error.message);
  console.log('⚠️ Make sure CONTRACT_ADDRESS and PRIVATE_KEY are set in .env file');
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.ensureDirSync(uploadsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, JPG, PNG, GIF) and PDF files are allowed'));
    }
  }
});

// Middleware to check blockchain service
const checkBlockchainService = (req, res, next) => {
  if (!blockchainService) {
    return res.status(500).json({
      error: 'Blockchain service not initialized',
      message: 'Please check your environment configuration'
    });
  }
  next();
};

// POST /api/certificates/issue - Issue a new certificate
router.post('/issue', checkBlockchainService, upload.single('certificate'), async (req, res) => {
  try {
    const { participantName, eventName } = req.body;

    // Validate required fields
    if (!participantName || !eventName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'participantName and eventName are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a certificate file'
      });
    }

    // Generate hash from uploaded file
    const fileBuffer = await fs.readFile(req.file.path);
    const certificateHash = blockchainService.generateFileHash(fileBuffer);

    console.log('📋 Certificate Issue Request:');
    console.log('  Participant:', participantName);
    console.log('  Event:', eventName);
    console.log('  File:', req.file.originalname);
    console.log('  Hash:', certificateHash);

    // Issue certificate on blockchain
    const result = await blockchainService.issueCertificate(
      participantName,
      eventName,
      certificateHash
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Certificate issued successfully',
        data: {
          certificateId: result.certificateId,
          participantName,
          eventName,
          certificateHash,
          fileName: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
          verificationUrl: `${req.protocol}://${req.get('host')}/api/certificates/verify/${certificateHash}`
        }
      });
    } else {
      // Remove uploaded file if blockchain transaction failed
      await fs.remove(req.file.path);
      
      res.status(500).json({
        success: false,
        error: 'Failed to issue certificate on blockchain',
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error in certificate issue:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/certificates/verify/:hash - Verify certificate by hash
router.get('/verify/:hash', checkBlockchainService, async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash) {
      return res.status(400).json({
        error: 'Hash parameter is required'
      });
    }

    console.log('🔍 Verifying certificate with hash:', hash);

    const result = await blockchainService.verifyCertificateByHash(hash);

    if (result.success) {
      res.json({
        success: true,
        verified: result.exists,
        data: result.exists ? {
          certificateId: result.certificateId,
          participantName: result.participantName,
          eventName: result.eventName,
          timestamp: result.timestamp,
          isValid: result.isValid,
          certificateHash: hash
        } : null,
        message: result.exists ? 
          (result.isValid ? 'Certificate is valid and verified' : 'Certificate exists but has been revoked') :
          'Certificate not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to verify certificate',
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error in certificate verification:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/certificates/verify-id/:id - Verify certificate by ID
router.get('/verify-id/:id', checkBlockchainService, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'Valid certificate ID parameter is required'
      });
    }

    console.log('🔍 Verifying certificate with ID:', id);

    const result = await blockchainService.verifyCertificateById(id);

    if (result.success) {
      res.json({
        success: true,
        verified: result.exists,
        data: result.exists ? {
          certificateId: id,
          participantName: result.participantName,
          eventName: result.eventName,
          certificateHash: result.certificateHash,
          timestamp: result.timestamp,
          isValid: result.isValid
        } : null,
        message: result.exists ? 
          (result.isValid ? 'Certificate is valid and verified' : 'Certificate exists but has been revoked') :
          'Certificate not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to verify certificate',
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error in certificate verification by ID:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/certificates/list - Get certificate statistics
router.get('/list', checkBlockchainService, async (req, res) => {
  try {
    console.log('📊 Getting certificate statistics...');

    const totalResult = await blockchainService.getTotalCertificates();
    const balanceResult = await blockchainService.getBalance();

    if (totalResult.success) {
      res.json({
        success: true,
        data: {
          totalCertificates: totalResult.total,
          contractAddress: process.env.CONTRACT_ADDRESS,
          walletAddress: balanceResult.success ? balanceResult.address : 'Unknown',
          walletBalance: balanceResult.success ? balanceResult.balance + ' ETH' : 'Unknown',
          network: 'Sepolia Testnet'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to get certificate statistics',
        message: totalResult.error
      });
    }

  } catch (error) {
    console.error('❌ Error getting certificate list:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/certificates/health - Health check for blockchain connection
router.get('/health', checkBlockchainService, async (req, res) => {
  try {
    const balanceResult = await blockchainService.getBalance();
    const totalResult = await blockchainService.getTotalCertificates();

    res.json({
      success: true,
      blockchain: {
        connected: true,
        network: 'Sepolia Testnet',
        contractAddress: process.env.CONTRACT_ADDRESS,
        walletAddress: balanceResult.success ? balanceResult.address : 'Unknown',
        walletBalance: balanceResult.success ? balanceResult.balance + ' ETH' : 'Unknown',
        totalCertificates: totalResult.success ? totalResult.total : 'Unknown'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in blockchain health check:', error);
    res.status(500).json({
      success: false,
      error: 'Blockchain connection failed',
      message: error.message
    });
  }
});

module.exports = router;