const { ethers } = require("hardhat");

async function main() {
  // Get the list of test accounts Hardhat gives us
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get the contract factory (like a blueprint of our contract)
  const Transactions = await ethers.getContractFactory("Transactions");

  // Deploy it!
  const transactions = await Transactions.deploy();
  await transactions.waitForDeployment();

  console.log("Transactions contract deployed to:", await transactions.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });