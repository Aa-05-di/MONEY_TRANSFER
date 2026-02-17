const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Transactions", function () {

  let transactions;
  let owner;
  let receiver;

  // This runs before every test — deploys a fresh contract
  beforeEach(async function () {
    [owner, receiver] = await ethers.getSigners();
    const Transactions = await ethers.getContractFactory("Transactions");
    transactions = await Transactions.deploy();
    await transactions.waitForDeployment();
  });

  it("Should start with 0 transactions", async function () {
    const count = await transactions.getTransactionCount();
    expect(count).to.equal(0);
  });

  it("Should add a transaction and increase count", async function () {
    await transactions.addToBlockchain(
      receiver.address,
      100,
      "First transaction!"
    );

    const count = await transactions.getTransactionCount();
    expect(count).to.equal(1);
  });

  it("Should store transaction details correctly", async function () {
    await transactions.addToBlockchain(
      receiver.address,
      250,
      "Hello blockchain!"
    );

    const allTx = await transactions.getAllTransactions();

    expect(allTx[0].sender).to.equal(owner.address);
    expect(allTx[0].receiver).to.equal(receiver.address);
    expect(allTx[0].amount).to.equal(250);
    expect(allTx[0].message).to.equal("Hello blockchain!");
  });

  it("Should emit a Transfer event", async function () {
    await expect(
      transactions.addToBlockchain(receiver.address, 100, "test")
    ).to.emit(transactions, "Transfer");
  });

});