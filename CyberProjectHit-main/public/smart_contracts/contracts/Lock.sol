// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract TipJar {
    event TipSent(address indexed recipient, uint amount);

    // Constructor is not needed for this basic tip functionality
    constructor() payable {}

    // Function to send tips to a specified recipient
    function sendTip(address payable recipient) external payable {
        require(msg.value > 0, "Send a positive amount");
        require(recipient != address(0), "Invalid recipient");

        recipient.transfer(msg.value);
        emit TipSent(recipient, msg.value);
    }

    // Function to check the contract's balance
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}