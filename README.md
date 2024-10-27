# CrypVideo - Blockchain Video Sharing Platform

CrypVideo is a decentralized video sharing platform designed to empower content creators and viewers by leveraging blockchain technology. Built on the Ethereum blockchain, CrypVideo offers a secure, transparent, and fair monetization solution through a tipping mechanism using USD-to-ETH conversion. This repository contains the code, setup instructions, and technical details for deploying and running CrypVideo locally.

## Project Overview

CrypVideo provides a decentralized platform where:

Creators can upload and manage videos securely on IPFS (InterPlanetary File System).
Viewers can discover, view, and tip creators using Ethereum-based smart contracts.
This project promotes fair monetization, secure content storage, and enhanced user privacy through blockchain technology.

## Features

**Decentralized Storage:** All video content is stored on IPFS for censorship resistance and security.

**Ethereum Tipping System:** Enables fair and transparent tipping using smart contracts and MetaMask integration.

**User Profiles:** Customizable profiles for content creators and viewers.

**Secure Authentication:** Blockchain-based authentication for enhanced security.

## Requirements

Node.js (v14 or above)

NPM (v6 or above)

Hardhat (local Ethereum network)

MetaMask browser extension


Ensure these are installed and configured on your machine before proceeding.

## Installation and Setup
To set up CrypVideo locally, follow these steps:

1.**Clone the Repository:**

```bash
git clone https://github.com/yonatanref007/blockchain.git
cd blockchain
```

2.**Install Dependencies:**

```bash
npm install
```
3.**Set Up Metamask:**

Add MetaMask to your browser, and configure it to connect to a local Ethereum network (e.g., localhost:8545) to interact with your Hardhat node.

4.**Configure Environment Variables:**

Create a .env file in the project root to store sensitive configurations, such as API keys or private keys, required by the application.

## Running the Project
To run the CrypVideo platform locally:

1.**Start Local Blockchain Network:**

Navigate to the project location and in the terminal, run:
```bash
npx hardhat node
```
2.**Compile and Deploy Contracts:**

Open a new terminal and compile the smart contracts:
```bash
npx hardhat compile
```
Deploy the contracts to the local network:
```bash
npx hardhat run public/smart_contracts/hardhat.js --network localhost
```
3.**Start the Development Server:**
```bash
npm start
```
4.**Access the Platform:**

Open your browser and navigate to http://localhost:3000 (/3002).

You should now see CrypVideo running locally. Use your MetaMask wallet to interact with the tipping features and test various functionalities.


## Setting up HTTPS Locally
To run CrypVideo over HTTPS on your local environment:

1.**Generate SSL Certificates:**

Create a self-signed SSL certificate and key. You can use OpenSSL:
```bash
openssl req -nodes -new -x509 -keyout key.pem -out certificate.crt
```
Store key.pem and certificate.crt files in a secure location within the project.

2.**Modify Server Configuration for HTTPS and Session Management:**

Update the server code as follows to enable HTTPS and configure secure session management:
```javascript
const fs = require('fs');
const https = require('https');
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');

const privateKey = fs.readFileSync('./key.pem', 'utf8');
const certificate = fs.readFileSync('./certificate.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Setup session management
const secretKey = crypto.randomBytes(128).toString('hex');
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true, 
        maxAge: 3600000 
    }
}));

// Start HTTPS server
https.createServer(credentials, app).listen(3000, () => {
    console.log("Server running at https://localhost:3000");
});
```

3.**Update Browser Settings:**

Since this is a self-signed certificate, your browser may warn you about the connection’s security. Approve the connection to proceed.



## Smart Contracts
The platform’s core tipping functionality is enabled by Ethereum smart contracts, ensuring secure and transparent transactions. These contracts handle the USD-to-ETH conversion, tipping, and content ownership verification. Contracts are written in Solidity and deployed through Hardhat.

## Contributing

We welcome contributions to CrypVideo! Please submit a pull request or open an issue to discuss potential changes. Ensure code is well-documented and tested before submission.

