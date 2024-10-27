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
  //Get contract adress and abi
  const { address: contractAddress, abi: contractABI } = await loadContractData();

  const provider = new ethers.providers.Web3Provider(window.ethereum); // Connect to the local metamask
  const signer = provider.getSigner(); // Get the signer
  const signerAddress = await signer.getAddress(); // Get the signer's address

  const lockContract = new ethers.Contract(contractAddress, contractABI, signer); // Create contract instance

  const amountUSD = document.getElementById('amount-input').value;

  // Fetch the current ETH price in USD
  const ethPriceInUSD = await getETHPriceInUSD();

  // Convert USD to ETH
  const amountETH = (amountUSD / ethPriceInUSD).toFixed(18);
  const testRecipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Sample recipient address
  //This is a test account to change so it will work for every user switch signerAddress with recipientAddress
  try {
    const nonce = await provider.getTransactionCount(signerAddress, "latest");
    console.log('Using nonce:', nonce);

    const tx = await lockContract.sendTip(testRecipient, {
      value: ethers.utils.parseEther(amountETH),
      nonce: nonce
    });

    console.log('Transaction sent:', tx);
    await tx.wait();
    console.log('Transaction mined:', tx);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}
