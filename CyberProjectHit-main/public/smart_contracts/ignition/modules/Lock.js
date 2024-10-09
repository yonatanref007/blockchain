async function loadContractData() {
  const response = await fetch('/contract');  // Make sure your server is running and serves this route
  if (!response.ok) {
      throw new Error('Failed to load contract data');
  }

  const data = await response.json();
  return data;
}

async function sendTip(recipientAddress) {
  const { address: contractAddress, abi: contractABI } = await loadContractData();
  console.log('Contract Address:', contractAddress);
  console.log('Contract ABI:', contractABI);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const lockContract = new ethers.Contract(contractAddress, contractABI, signer);
  const amountUSD = document.getElementById('amount-input').value;
  const amountETH = 0.000418;
  const amount = (amountUSD * amountETH).toFixed(18);

  try {
    console.log(recipientAddress)
    const tx = await lockContract.sendTip(recipientAddress, {
      value: ethers.utils.parseEther(amount)
    });
    console.log('Transaction sent:', tx);
    await tx.wait();
    console.log('Transaction mined:', tx);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}
