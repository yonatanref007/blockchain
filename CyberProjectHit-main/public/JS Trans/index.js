let account;
document.getElementById('connect-button').addEventListener('click', event => {
  let button = event.target;
  ethereum.request({method: 'eth_requestAccounts'}).then(accounts => {
    account = accounts[0];
    console.log(account);
    button.textContent = account;
    ethereum.request({method: 'eth_getBalance', params: [account, 'latest']}).then(result => {
      console.log(result);
      let wei = parseInt(result, 16); 
      let balance = wei / (10**18);
      console.log(balance + " ETH");
    });
  });
});

document.getElementById('amount-input').addEventListener('input', event => {
  let amount = event.target.value;
  let sendButton = document.getElementById('send-button');
  if (amount && !isNaN(amount) && amount > 0) {
    sendButton.textContent = `Tip $${amount}`;
    sendButton.disabled = false;
  } else {
    sendButton.textContent = 'Tip the Creator';
    sendButton.disabled = true;
  }
});

document.getElementById('send-button').addEventListener('click', event => {
  let usdAmount = document.getElementById('amount-input').value;
  getEthPrice().then(ethPrice => {
    let ethAmount = usdAmount / ethPrice;
    let weiValue = BigInt(Math.round(ethAmount * 10**18)).toString(16); // Corrected to use Math.round

    let transactionParam = {
      to: '0x45B6b39e1Cf8A6b4Ff2720f6BA0089d4574126E5',
      from: account,
      value: '0x' + weiValue
    };

    ethereum.request({method: 'eth_sendTransaction', params: [transactionParam]}).then(txhash => {
      console.log(txhash);
      checkTransactionconfirmation(txhash).then(r => alert(r));
    });
  });
});

function getEthPrice() {
  return fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    .then(response => response.json())
    .then(data => data.ethereum.usd);
}

function checkTransactionconfirmation(txhash) {
  let checkTransactionLoop = () => {
    return ethereum.request({method:'eth_getTransactionReceipt', params:[txhash]}).then(r => {
      if (r != null) return 'confirmed';
      else return checkTransactionLoop();
    });
  };
  return checkTransactionLoop();
}

let isConnected = false;

document.getElementById("connect-button").addEventListener("click", () => {
  isConnected = true;
  alert("Connected!");
});

document.getElementById("send-button").addEventListener("click", () => {
  if (!isConnected) {
    alert("Please connect first.");
  } else {
    console.log("Sending data...");
  }
});
