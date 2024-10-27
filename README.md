# CrypVideo - Blockchain Video Sharing Platform

CrypVideo is a decentralized video sharing platform designed to empower content creators and viewers by leveraging blockchain technology. Built on the Ethereum blockchain, CrypVideo offers a secure, transparent, and fair monetization solution through a tipping mechanism using USD-to-ETH conversion. This repository contains the code, setup instructions, and technical details for deploying and running CrypVideo locally.

## Project Overview

CrypVideo provides a decentralized platform where:

Creators can upload and manage videos securely on IPFS (InterPlanetary File System).
Viewers can discover, view, and tip creators using Ethereum-based smart contracts.
This project promotes fair monetization, secure content storage, and enhanced user privacy through blockchain technology.

## Features

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

## Running the Project
To run the CrypVideo platform locally:

1.**Start Local Blockchain Network:**

Navigate to the project location and in the terminal, run:
```bash
cd CyberProjectHit-main/
```
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

Open your browser and navigate to http localhost route the code is on (https if secured).

You should now see CrypVideo running locally. Use your MetaMask wallet to interact with the tipping features and test various functionalities.


## Setting up HTTPS Locally
To run CrypVideo over HTTPS on your local environment:

1.**Generate SSL Certificates:**

Copy the certificate file that is in the code repository:

2.**Upload the certificate to your trusted files in the computer:**

### Steps (Windows)

1. **Open the Microsoft Management Console (MMC):**
   - Press `Win + R` to open the **Run** dialog.
   - Type `mmc` and press **Enter** to open the console.

2. **Add the Certificates Snap-in:**
   - In the MMC window, go to **File > Add/Remove Snap-in…**.
   - In the **Available snap-ins** list, find and select **Certificates**, then click **Add**.
   - Choose **Computer account** (this applies the certificate system-wide), and click **Next**.
   - Select **Local computer** and click **Finish**.

3. **Navigate to Trusted Root Certification Authorities:**
   - In the left sidebar, expand **Certificates (Local Computer)**.
   - Expand **Trusted Root Certification Authorities** and select **Certificates**.

4. **Import the Certificate:**
   - Right-click on **Certificates** under **Trusted Root Certification Authorities**, go to **All Tasks**, and select **Import…**.
   - This will start the **Certificate Import Wizard**.

5. **Choose the Certificate File:**
   - In the wizard, click **Browse…** and navigate to the location of your certificate file.
   - Select the certificate and click **Open**. Then, click **Next**.

6. **Place the Certificate in the Trusted Root Certification Authorities Store:**
   - Ensure that **Place all certificates in the following store** is selected, and it shows **Trusted Root Certification Authorities**.
   - Click **Next** and then **Finish** to complete the import.

7. **Confirm the Certificate Import:**
   - You should see a confirmation message stating the import was successful.
   - Close the MMC by going to **File > Exit**. If prompted to save the console settings, you can choose not to save.

8. **Restart Your Browser:**
   - Restart your browser to make sure it recognizes the newly trusted certificate.

### Steps (MAC)

1. **Open Keychain Access:**
   - Press `Command + Space` to open **Spotlight Search**.
   - Type `Keychain Access` and press **Enter** to launch the application.

2. **Import the Certificate:**
   - In **Keychain Access**, go to the **File** menu and select **Import Items…**.
   - Navigate to the location of your certificate file (e.g., `certificate.crt`).
   - Select the certificate file and click **Open**.

3. **Select Keychain:**
   - When prompted, choose **System** or **Login** as the keychain to import the certificate.
   - Click **Add** to import the certificate.

4. **Set the Certificate to Always Trust:**
   - Locate the imported certificate in the **Keychain Access** window.
   - Double-click the certificate to open its details.
   - Expand the **Trust** section.
   - Set **When using this certificate:** to **Always Trust**.
   - Close the certificate details window. You may be prompted to enter your password to confirm the changes.

5. **Restart Your Browser:**
   - Restart your browser to make sure it recognizes the newly trusted certificate.

## Smart Contracts
The platform’s core tipping functionality is enabled by Ethereum smart contracts, ensuring secure and transparent transactions. These contracts handle the USD-to-ETH conversion, tipping, and content ownership verification. Contracts are written in Solidity and deployed through Hardhat.

## Contributing

We welcome contributions to CrypVideo! Please submit a pull request or open an issue to discuss potential changes. Ensure code is well-documented and tested before submission.
