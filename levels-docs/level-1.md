# Orbit Ledger

![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-6C47FF?style=flat-square&logo=stellar&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Freighter](https://img.shields.io/badge/Wallet-Freighter-FF6B35?style=flat-square&logo=googlechrome&logoColor=white)

Orbit Ledger is a clean Stellar Testnet payment dApp for connecting a Freighter wallet, checking XLM balance, sending test payments, and verifying transactions on StellarExpert.

Built for the **Stellar White Belt (Level 1)** challenge in the RiseIn Stellar Journey to Mastery Program 2026.

---

## Preview

| Wallet connected | Live balance |
| --- | --- |
| <img src="../assets/wallet-connected.png" alt="Wallet connected screen" width="100%"> | <img src="../assets/live-balance.png" alt="Live XLM balance screen" width="100%"> |

| Payment flow | Successful transaction |
| --- | --- |
| <img src="../assets/payment-form.png" alt="Payment form screen" width="100%"> | <img src="../assets/successful-transaction.png" alt="Successful transaction screen" width="100%"> |

| On-chain confirmation |
| --- |
| <img src="../assets/image.png" alt="Transaction shown on StellarExpert" width="100%"> |

---

## What It Does

- Connects and disconnects a Freighter wallet
- Fetches the connected account balance from Stellar Horizon Testnet
- Sends XLM to any valid Stellar public address
- Signs transactions securely through Freighter
- Links each successful payment to StellarExpert for verification
- Handles common wallet, address, amount, and network errors

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React.js with Vite |
| Styling | CSS |
| Stellar SDK | `@stellar/stellar-sdk` |
| Wallet | `@stellar/freighter-api` |
| Network | Stellar Testnet |

The app talks directly to `https://horizon-testnet.stellar.org` and does not require a backend.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Testnet XLM from the [Stellar Laboratory Faucet](https://laboratory.stellar.org/#account-creator?network=test)

### Run Locally

```bash
git clone https://github.com/yashannadate/orbit-ledger-whitebelt.git
cd orbit-ledger-whitebelt
npm install
npm run dev
```

Make sure Freighter is set to **Testnet** before connecting your wallet.

---

## How to Use

1. Open the app and click **Connect Wallet**.
2. Confirm the connection in Freighter.
3. Check the displayed XLM balance.
4. Enter a recipient public key and payment amount.
5. Click **Send Payment** and approve the transaction.
6. Open the explorer link to verify the payment on StellarExpert.

---

## Security Notes

- Private keys never touch the app. Freighter handles transaction signing.
- The app is configured for Stellar Testnet only.
- No user account data is stored in a database.
- Transactions are built client-side and submitted through Horizon.

---

## Acknowledgments

- [Stellar Development Foundation](https://stellar.org/)
- [Freighter](https://www.freighter.app/)
- [RiseIn](https://www.risein.com/)

<p align="center">Built for educational purposes as part of the Stellar Journey to Mastery 2026.</p>
