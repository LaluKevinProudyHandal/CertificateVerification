const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the contract factory
  const CertificateVerification = await hre.ethers.getContractFactory("CertificateVerification");
  
  // Deploy the contract
  console.log("Deploying CertificateVerification...");
  const certificate = await CertificateVerification.deploy();
  
  // Wait for deployment to complete
  await certificate.waitForDeployment();
  
  // Get the contract address
  const contractAddress = await certificate.getAddress();
  
  console.log("CertificateVerification deployed to:", contractAddress);
  console.log("Deployment transaction hash:", certificate.deploymentTransaction().hash);
  
  // Verify the deployment
  console.log("Verifying deployment...");
  const owner = await certificate.owner();
  const totalCertificates = await certificate.getTotalCertificates();
  
  console.log("Contract owner:", owner);
  console.log("Total certificates:", totalCertificates.toString());
  
  console.log("\n=== IMPORTANT ===");
  console.log("Copy this contract address to your .env file:");
  console.log("CONTRACT_ADDRESS=" + contractAddress);
  console.log("================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });