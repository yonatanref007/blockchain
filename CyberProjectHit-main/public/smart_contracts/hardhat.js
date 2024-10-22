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
    await checkBalance(deployer.address)
    await checkBalance(recipient.address)
    const tx = await lock.sendTip(recipient.address, { value: tipAmount });
      
    console.log(`Sent ${hre.ethers.utils.formatEther(tipAmount)} ETH to ${recipient.address}`);
    const contractData = {
        address: lock.address,
        abi: lockABI
    };
    fs.writeFileSync(path.resolve(__dirname, 'ignition/modules/contractData.json'), JSON.stringify(contractData));
}

async function checkBalance(address) {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const balance = await provider.getBalance(address);
    console.log(`Balance of ${address}: ${ethers.utils.formatEther(balance)} ETH`);
  }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
