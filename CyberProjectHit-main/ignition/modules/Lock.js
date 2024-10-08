const { ethers } = require("ethers");

const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_unlockTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "when",
        "type": "uint256"
      }
    ],
    "name": "Withdrawal",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unlockTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address

// Connect to MetaMask
async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      console.log('Connected account:', accounts[0]);
      
      const connectButton = document.getElementById('connect-button');
      connectButton.textContent = "Connected";
      const sendButton = document.getElementById('send-button');
      sendButton.disabled = false;
      return accounts[0];
    } catch (error) {
      console.error("User denied account access", error);
    }
  } else {
    console.error("MetaMask not detected");
  }
}


// Send a deposit to the Lock contract
async function sendDeposit(amountInEther) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const lockContract = new ethers.Contract(contractAddress, contractABI, signer);

  // Sending ETH to the smart contract
  try {
    const tx = await lockContract.deposit({
      value: ethers.utils.parseEther(amountInEther) // Amount in ETH
    });
    console.log('Transaction sent:', tx);
    await tx.wait(); // Wait for the transaction to be mined
    console.log('Transaction mined:', tx);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}

// Withdraw funds after unlock time
async function withdrawFunds() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const lockContract = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    const tx = await lockContract.withdraw();
    console.log('Withdraw transaction sent:', tx);
    await tx.wait();
    console.log('Withdraw transaction mined:', tx);
  } catch (error) {
    console.error('Withdrawal failed:', error);
  }
}

// HTML Example:
document.getElementById('deposit-button').onclick = function() {
  const amount = document.getElementById('amount-input').value;
  sendDeposit(amount);
};
document.getElementById('withdraw-button').onclick = function() {
  withdrawFunds();
};
