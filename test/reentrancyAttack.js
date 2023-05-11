// test/reentrancyAttack.js
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
