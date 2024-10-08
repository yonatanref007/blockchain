
// Connect to MetaMask

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
