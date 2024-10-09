// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Lock {
    event TipSent(address indexed recipient, uint amount);

    constructor() payable {
        
    }

    function sendTip(address payable recipient) external payable {
        require(msg.value > 0, "Send a positive amount");
        require(recipient != address(0), "Invalid recipient");

        recipient.transfer(msg.value);
        emit TipSent(recipient, msg.value);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
