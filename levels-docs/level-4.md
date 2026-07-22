# 🟢 Level 4 — Green Belt

> Production-ready smart contract infrastructure with inter-contract calls, a custom Soroban token, advanced frontend analytics, a redesigned UI, and automated CI/CD pipelines.

Built for the **Stellar Green Belt (Level 4)** challenge as part of the RiseIn Stellar Journey to Mastery Program 2026.

---

## ✨ Advanced Contract Patterns

### 1. Inter-Contract Calls
The Treasury contract has been upgraded to interact directly with other smart contracts on the network. Upon the successful execution of any payroll proposal, the Treasury contract securely invokes the **SPAY Token** contract's `mint()` function via `env.invoke_contract()`. This guarantees that 1 SPAY token is minted and sent to every employee instantly upon payment, proving on-chain activity without any manual intervention.

### 2. Custom Token Creation (SPAY)
A native Soroban custom token—the **SPAY Token**—was written in Rust, tested, and deployed to the Testnet. It implements a complete token interface including `mint()`, `balance()`, and `total_supply()`. The `mint` function features strict authorization, ensuring that only the recognized Treasury contract address is permitted to mint new tokens.

---

## 💻 Frontend Features & New UI

The application's interface was completely overhauled in Level 4 to provide a premium, dynamic, and data-rich Web3 experience.

### 1. New Landing Page (Connect Screen)
The initial connection screen was transformed into a full **Landing Page** featuring a modern hero section ("Trustless Payroll"), a 5-point feature highlights grid, and a step-by-step "How It Works" guide. It introduces the protocol to users before prompting them to connect their Freighter wallet. 

### 2. Analytics Stats Bar
A real-time data visualization row was added to the top of the main dashboard, calculating live protocol metrics based on execution history:
- **Total Paid (XLM)**: Sum of all XLM successfully distributed.
- **Total Proposals**: Count of all executed payroll transactions.
- **SPAY Minted**: Total SPAY tokens earned by employees.
- **Active Employees**: Number of unique wallet addresses paid.

### 3. Payroll History Table & CSV Export
Instead of just showing the current state, the app now maintains a persistent **Payroll History Table**. Whenever a transaction is finalized on the network, the app extracts the receipt data and pushes a new row containing the Employee Address, Amount, Proposal ID, Date & Time, and a clickable StellarExpert **Transaction Hash Link**. Users can instantly download this entire ledger via the **Export CSV** button.

### 4. SPAY Token Balance Display
The sidebar now features a dedicated **SPAY Token card**. It connects directly to the Soroban RPC to simulate a transaction against the SPAY contract's `balance()` function, fetching the user's live token balance. It includes a manual refresh button and automatically updates 3 seconds after every successful payroll execution.

### 5. Mobile Responsive Design
The entire application was optimized for all screen sizes. Using dynamic CSS `@media` queries in `index.css`, the complex Analytics Bar transforms from a 4-column layout to a 2-column or 1-column stack on smaller screens. The Landing Page features, dashboard grid, and navigation bar perfectly adapt to provide a flawless experience on desktop, tablet, and mobile devices.

---

## ⚙️ DevOps & Real-Time Tracking

### Advanced Event Streaming Implementation
The frontend implements advanced tracking by intercepting Soroban SDK `Result` objects and parsing the resulting transaction data. As the smart contract emits events upon execution, the frontend captures the execution context and populates the history table in real-time, syncing the state instantly without requiring a page refresh.

### CI/CD Pipeline
An automated Continuous Integration and Deployment pipeline was established via **GitHub Actions** (`ci.yml`). On every push to the `main` branch, the pipeline spins up an Ubuntu runner and executes two parallel jobs:
1. **Frontend Build**: Installs dependencies and verifies the Vite production bundle builds successfully.
2. **Rust Contract Tests**: Installs the `wasm32-unknown-unknown` toolchain and runs `cargo test` on both the Treasury and SPAY Token contracts.

---

## 🔗 Deployed Contracts & Proofs

| Component | Contract ID / Link |
|---|---|
| **Treasury Contract** | `CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS` |
| **SPAY Token Contract** | `CBJBY4ER5AXT6FC7M5V7PMPANDTBVELP6AOBEKXQHZPEHDPL4ZG3L547` |
| **Explorer** | [View Treasury on StellarExpert](https://stellar.expert/explorer/testnet/contract/CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS) |

### 📌 Inter-Contract Execution Hash

**Treasury executing payment AND minting SPAY Token in one transaction:**  
`76a0b00a58b9a3dae6d57e189c1c9d6f88e022651fa94161b5e3665f3e6c63ad`

[View on StellarExpert ↗](https://stellar.expert/explorer/testnet/tx/76a0b00a58b9a3dae6d57e189c1c9d6f88e022651fa94161b5e3665f3e6c63ad)

### 📸 Level 4 Media Proofs

**Beautiful Mobile Responsive View:**  

<img width="603" height="882" alt="Mobile Dashboard View" src="/Users/kishan/projects/stellar_pay/assets/mobile_responsive.png" />


---

<p align="center">🟢 Green Belt Complete — Stellar Journey to Mastery 2026</p>