// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Transactions {

    // Counts how many transactions have happened
    uint256 private transactionCount;

    // This event fires every time a transfer is made
    event Transfer(
        address from,
        address receiver,
        uint amount,
        string message,
        uint256 timestamp
    );

    // This is the shape of one transaction record
    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
    }

    // Array that stores ALL transactions ever made
    TransferStruct[] private transactions;

    // The main function — sends ETH and records the transaction
    function addToBlockchain(
        address payable receiver,
        uint amount,
        string memory message
    ) public {
        transactionCount++;

        transactions.push(TransferStruct(
            msg.sender,
            receiver,
            amount,
            message,
            block.timestamp
        ));

        emit Transfer(
            msg.sender,
            receiver,
            amount,
            message,
            block.timestamp
        );
    }

    // Returns all transactions
    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }

    // Returns the total transaction count
    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }
}