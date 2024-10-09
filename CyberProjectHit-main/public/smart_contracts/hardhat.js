const hre = require("hardhat");
const fs = require("fs");
const path = require("path");


const lockABI = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../artifacts/contracts/Lock.sol/Lock.json"), "utf8")
).abi;
async function main() {
    const [deployer, recipient] = await hre.ethers.getSigners();
    const Lock = await hre.ethers.getContractFactory("Lock");
    const lock = await Lock.deploy();
    await lock.deployed();
    const tipAmount = hre.ethers.utils.parseEther("5");
    const tx = await lock.sendTip(recipient.address, { value: tipAmount });
    await tx.wait();  
    console.log(`Sent ${hre.ethers.utils.formatEther(tipAmount)} ETH to ${recipient.address}`);
    const balance = await lock.getBalance();


    const contractData = {
        address: lock.address,
        abi: lockABI
    };
    fs.writeFileSync(path.resolve(__dirname, 'ignition/modules/contractData.json'), JSON.stringify(contractData));
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
