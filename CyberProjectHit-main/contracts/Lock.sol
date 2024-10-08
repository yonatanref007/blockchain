// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Lock {
    uint public unlockTime;
    address payable public owner;

    event Withdrawal(uint amount, uint when);
    event Deposit(address indexed from, uint amount);

    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    // Function to deposit ETH into the contract
    function deposit() external payable {
        require(msg.value > 0, "You need to send some Ether");
        emit Deposit(msg.sender, msg.value);
    }

    // Function to withdraw only if the unlock time is reached
    function withdraw() public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);
        owner.transfer(address(this).balance);
    }

    // Check the contract balance
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
