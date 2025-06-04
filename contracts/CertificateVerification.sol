// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateVerification {
    // Structure to store certificate data
    struct Certificate {
        string participantName;
        string eventName;
        string certificateHash;
        uint256 timestamp;
        bool isValid;
    }
    
    // Mapping from certificate ID to Certificate
    mapping(uint256 => Certificate) public certificates;
    
    // Mapping from hash to certificate ID for quick lookup
    mapping(string => uint256) public hashToCertificateId;
    
    // Counter for certificate IDs
    uint256 public nextCertificateId = 1;
    
    // Owner of the contract (who can issue certificates)
    address public owner;
    
    // Events
    event CertificateIssued(
        uint256 indexed certificateId,
        string participantName,
        string eventName,
        string certificateHash
    );
    
    event CertificateRevoked(uint256 indexed certificateId);
    
    // Modifier to restrict access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Function to issue a new certificate
    function issueCertificate(
        string memory _participantName,
        string memory _eventName,
        string memory _certificateHash
    ) public onlyOwner returns (uint256) {
        require(bytes(_participantName).length > 0, "Participant name cannot be empty");
        require(bytes(_eventName).length > 0, "Event name cannot be empty");
        require(bytes(_certificateHash).length > 0, "Certificate hash cannot be empty");
        require(hashToCertificateId[_certificateHash] == 0, "Certificate with this hash already exists");
        
        uint256 certificateId = nextCertificateId;
        
        certificates[certificateId] = Certificate({
            participantName: _participantName,
            eventName: _eventName,
            certificateHash: _certificateHash,
            timestamp: block.timestamp,
            isValid: true
        });
        
        hashToCertificateId[_certificateHash] = certificateId;
        nextCertificateId++;
        
        emit CertificateIssued(certificateId, _participantName, _eventName, _certificateHash);
        
        return certificateId;
    }
    
    // Function to verify a certificate by hash
    function verifyCertificateByHash(string memory _certificateHash) 
        public view returns (
            bool exists,
            uint256 certificateId,
            string memory participantName,
            string memory eventName,
            uint256 timestamp,
            bool isValid
        ) {
        certificateId = hashToCertificateId[_certificateHash];
        
        if (certificateId == 0) {
            return (false, 0, "", "", 0, false);
        }
        
        Certificate memory cert = certificates[certificateId];
        return (
            true,
            certificateId,
            cert.participantName,
            cert.eventName,
            cert.timestamp,
            cert.isValid
        );
    }
    
    // Function to verify a certificate by ID
    function verifyCertificateById(uint256 _certificateId) 
        public view returns (
            bool exists,
            string memory participantName,
            string memory eventName,
            string memory certificateHash,
            uint256 timestamp,
            bool isValid
        ) {
        if (_certificateId == 0 || _certificateId >= nextCertificateId) {
            return (false, "", "", "", 0, false);
        }
        
        Certificate memory cert = certificates[_certificateId];
        return (
            true,
            cert.participantName,
            cert.eventName,
            cert.certificateHash,
            cert.timestamp,
            cert.isValid
        );
    }
    
    // Function to revoke a certificate
    function revokeCertificate(uint256 _certificateId) public onlyOwner {
        require(_certificateId > 0 && _certificateId < nextCertificateId, "Invalid certificate ID");
        require(certificates[_certificateId].isValid, "Certificate is already revoked");
        
        certificates[_certificateId].isValid = false;
        
        emit CertificateRevoked(_certificateId);
    }
    
    // Function to get total number of certificates issued
    function getTotalCertificates() public view returns (uint256) {
        return nextCertificateId - 1;
    }
}