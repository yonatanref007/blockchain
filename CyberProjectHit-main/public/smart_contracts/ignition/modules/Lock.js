async function loadContractData() {
  const response = await fetch('/contract');  // Make sure your server is running and serves this route
  if (!response.ok) {
      throw new Error('Failed to load contract data');
  }

  const data = await response.json();
  return data;
}


async function getETHPriceInUSD() {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
  if (!response.ok) {
    throw new Error('Failed to fetch ETH price');
  }

  const data = await response.json();
  return data.ethereum.usd;
}

async function sendTip(recipientAddress) {
  const { address: contractAddress, abi: contractABI } = await loadContractData();
  console.log('Contract Address:', contractAddress);
  console.log('Contract ABI:', contractABI);
  
  const provider = new ethers.providers.Web3Provider(window.ethereum); // Local Hardhat node
  const signer = provider.getSigner();
  console.log('Contract Address:', contractAddress);
  const lockContract = new ethers.Contract(contractAddress, contractABI, signer); // Use dynamic address
  
  const amountUSD = document.getElementById('amount-input').value;

  // Fetch current ETH price in USD
  const ethPriceInUSD = await getETHPriceInUSD();

  // Convert USD to ETH
  const amountETH = (amountUSD / ethPriceInUSD).toFixed(18);
  const test = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  try {
    const tx = await lockContract.sendTip(test, {
      value: ethers.utils.parseEther(amountETH)
    });
    console.log('Transaction sent:', tx);
    await tx.wait();
    console.log('Transaction mined:', tx);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}