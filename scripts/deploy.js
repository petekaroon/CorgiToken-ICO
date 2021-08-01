async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const CorgiTokenICO = await ethers.getContractFactory('CorgiTokenICO');

  const initialDepositAccount = '0xeAB7A5228Ee66ccF8CF5BBb1a1A0024E7a5A4d4d'
  const corgiTokenICO  = await CorgiTokenICO.deploy(initialDepositAccount);
  
  console.log("CorgiTokenICO contract address:", corgiTokenICO.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(corgiTokenICO);
}

function saveFrontendFiles(corgiTokenICO) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ CorgiTokenICO: corgiTokenICO.address }, undefined, 2)
  );

  const CorgiTokenICOArtifact = artifacts.readArtifactSync("CorgiTokenICO");

  fs.writeFileSync(
    contractsDir + "/CorgiTokenICO.json",
    JSON.stringify(CorgiTokenICOArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });