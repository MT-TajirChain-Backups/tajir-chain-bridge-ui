<div align="center">

<br/>

# Tajir Chain · Bridge UI

**The official cross-chain bridge interface for the Tajir Chain ecosystem.**  
Move ETH and ERC-20 tokens seamlessly between Ethereum and Tajir Chain — secured by zero-knowledge proofs.

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node ≥ 16](https://img.shields.io/badge/node-%E2%89%A516-brightgreen)](https://nodejs.org/)
[![npm ≥ 8](https://img.shields.io/badge/npm-%E2%89%A58-red)](https://www.npmjs.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](./Dockerfile)
[![Built with Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ethers.js](https://img.shields.io/badge/ethers.js-5.x-purple)](https://docs.ethers.org/)

<br/>

[**Live Bridge**](#) &nbsp;·&nbsp; [**Documentation**](#) &nbsp;·&nbsp; [**Security Policy**](./SECURITY.md) &nbsp;·&nbsp; [**Report a Bug**](../../issues)

<br/>

---

</div>

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [ABIs & Smart Contracts](#abis--smart-contracts)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Configuration](#environment-configuration)
   - [Running Locally](#running-locally)
7. [Docker Deployment](#docker-deployment)
8. [CI / CD Pipeline](#ci--cd-pipeline)
9. [Project Structure](#project-structure)
10. [Contributing](#contributing)
11. [Security](#security)
12. [License](#license)

---

## Overview

**Tajir Chain Bridge UI** is a production-grade, decentralised web application that provides a trustless bridge between **Ethereum** (Layer 1) and **Tajir Chain** — an Ethereum-compatible zkEVM rollup network. It enables users, developers, and institutions to transfer digital assets across both networks with full on-chain verifiability and minimal trust assumptions.

The bridge is built on the **Polygon zkEVM bridge protocol**, inheriting battle-tested cryptographic guarantees and extending them with Tajir Chain's own branding, tokenomics, and network configuration. Every cross-chain transfer is settled through zero-knowledge Merkle proofs, ensuring that no centralised party can forge or censor transactions.

> **Who is this for?**  
> This repository is intended for **blockchain developers**, **node operators**, **dApp integrators**, **institutional stakeholders**, and **open-source contributors** who wish to run, audit, or build upon the Tajir Chain bridge infrastructure.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               Tajir Chain Bridge UI (React 18)           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐  │   │
│  │  │  Wallet  │  │  Bridge  │  │ Activity  │  │ Fiat   │  │   │
│  │  │ Connect  │  │  Form    │  │  History  │  │ Rates  │  │   │
│  │  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └───┬────┘  │   │
│  │       │             │              │             │        │   │
│  │  ┌────▼─────────────▼──────────────▼─────────────▼────┐  │   │
│  │  │          Context / State Management Layer           │  │   │
│  │  │   (Env · Providers · Bridge · Error · Price)        │  │   │
│  │  └───────────────────────┬─────────────────────────────┘  │   │
│  │                          │                                 │   │
│  │  ┌───────────────────────▼─────────────────────────────┐  │   │
│  │  │                  Adapters Layer                      │  │   │
│  │  │  ethereum.ts · bridge-api.ts · storage.ts · env.ts  │  │   │
│  │  └──────┬────────────────────────────────────┬──────────┘  │   │
│  └─────────┼────────────────────────────────────┼─────────────┘   │
└────────────┼────────────────────────────────────┼─────────────────┘
             │                                    │
    ┌─────────▼──────────┐              ┌──────────▼──────────┐
    │  Ethereum (L1)     │              │  Tajir Chain (L2)   │
    │  Bridge Contract   │◄────ZK───────│  Bridge Contract    │
    │  PoE Contract      │   Proofs     │  (zkEVM rollup)     │
    │  Rollup Manager    │              │                     │
    └────────────────────┘              └─────────────────────┘
                          ▲
                          │ REST API
                    ┌─────┴──────┐
                    │ Bridge API │
                    │  Service   │
                    └────────────┘
```

**Data flow for a deposit (L1 → L2):**

1. User connects wallet (MetaMask or WalletConnect).
2. UI validates environment, chain configs, and contract addresses via zod schemas.
3. User approves token spend (ERC-20 approval or EIP-2612 / DAI permit signature).
4. Bridge contract is called on Ethereum; transaction emits a `BridgeEvent`.
5. Bridge API indexes the deposit and generates a Merkle proof.
6. UI polls the Bridge API and displays real-time status (`initiated → on-hold → completed`).
7. Claim is executed on Tajir Chain; user receives funds on L2.

**L2 → L1 withdrawals** follow the reverse path, requiring additional ZK batch finality before funds can be claimed on Ethereum.

---

## Key Features

| Feature | Description |
|---|---|
| 🔀 **Bidirectional Bridging** | Deposit (L1→L2) and withdraw (L2→L1) ETH & any ERC-20 token |
| 🔐 **Zero-Knowledge Security** | Transfers settled via ZK Merkle proofs — no trust in relayers |
| 🦊 **MetaMask & WalletConnect** | Native support for MetaMask and WalletConnect v2 |
| 🔏 **ERC-20 Permit Support** | Gas-optimised approvals via DAI permit, EIP-2612, and Uniswap permit |
| 📊 **Activity History** | Full paginated history of all bridge transactions per address |
| 💱 **Fiat Conversion** | Optional real-time USD / EUR / GBP / JPY / CNY exchange rates |
| 🎨 **Themeable UI** | Configurable branding — logos, colors, network name — via env vars |
| 🐳 **Docker Ready** | Multi-stage Dockerfile with runtime env substitution (no rebuild per env) |
| 🔄 **Auto Gas Estimation** | EIP-1559 and legacy gas support with configurable safety margins |
| 🌐 **Network-Agnostic** | Supports Mainnet, Goerli, Sepolia, and custom devnets |

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | [React](https://reactjs.org/) | 18.x |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | 4.x |
| **Build Tool** | [Vite](https://vitejs.dev/) | 6.x |
| **Ethereum** | [ethers.js](https://docs.ethers.org/) | 5.x |
| **Wallet** | [WalletConnect Ethereum Provider](https://docs.walletconnect.com/) | 2.x |
| **Styling** | [React JSS](https://cssinjs.org/react-jss/) | 10.x |
| **Routing** | [React Router](https://reactrouter.com/) | 6.x |
| **Validation** | [Zod](https://zod.dev/) | 3.x |
| **HTTP Client** | [Axios](https://axios-http.com/) | 1.x |
| **Contract Types** | [TypeChain](https://github.com/dethcrypto/TypeChain) | 8.x |
| **SEO** | [React Helmet Async](https://github.com/staylor/react-helmet-async) | 2.x |
| **Linting** | ESLint + Prettier | — |
| **CI/CD** | GitHub Actions + Docker | — |
| **Web Server** | nginx (Alpine) | — |

---

## ABIs & Smart Contracts

The `/abis` directory contains the Application Binary Interfaces for all on-chain contracts the bridge interacts with:

| ABI File | Contract | Description |
|---|---|---|
| `bridge.json` | `Bridge` | Core bridge contract (L1 & L2 deposit / claim) |
| `bridgeL2_v1.json` | `BridgeL2 v1` | L2-specific bridge variant |
| `proof-of-efficiency.json` | `ProofOfEfficiency` | zkEVM batch verification (PoE) |
| `rollup-manager.json` | `RollupManager` | Manages rollup batches and exits |
| `erc-20.json` | `ERC-20` | Standard token interface with permit extensions |
| `uniswap-v2-pair.json` | `UniswapV2Pair` | Pair contract for Uniswap-style permit support |
| `uniswap-v2-router-02.json` | `UniswapV2Router02` | Router for WETH liquidity operations |

> Contract TypeScript types are auto-generated at install time via `typechain` from these ABIs.  
> **Do not edit** the generated types in `src/types/contracts/` manually.

---

## Getting Started

### Prerequisites

| Requirement | Minimum Version |
|---|---|
| [Node.js](https://nodejs.org/) | `>= 16` |
| [npm](https://www.npmjs.com/) | `>= 8` |
| [Git](https://git-scm.com/) | Latest |

An Ethereum-compatible wallet (MetaMask or WalletConnect) is required to interact with the bridge in-browser.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tajir-chain/tajir-chain-bridge-ui.git
cd tajir-chain-bridge-ui

# 2. Install dependencies (TypeChain types auto-generated post-install)
npm install
```

> **Note:** The `postinstall` script automatically runs `generate-contract-types.sh`, which invokes TypeChain to generate TypeScript bindings from all ABIs in `/abis`.

### Environment Configuration

Copy the example environment file and populate it with your network values:

```bash
cp .env.example .env
```

#### Required Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_ETHEREUM_RPC_URL` | Ethereum L1 JSON-RPC endpoint | `https://mainnet.infura.io/v3/<KEY>` |
| `VITE_ETHEREUM_EXPLORER_URL` | Ethereum block explorer URL | `https://etherscan.io` |
| `VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS` | L1 Bridge contract address (42 chars) | `0x...` |
| `VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS` | PoE contract address | `0x...` |
| `VITE_ETHEREUM_ROLLUP_MANAGER_ADDRESS` | Rollup Manager contract address | `0x...` |
| `VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT` | Force global exit root update | `true` |
| `VITE_POLYGON_ZK_EVM_RPC_URL` | Tajir Chain (L2) JSON-RPC endpoint | `https://rpc.tajirchain.io` |
| `VITE_POLYGON_ZK_EVM_EXPLORER_URL` | L2 block explorer URL | `https://explorer.tajirchain.io` |
| `VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS` | L2 Bridge contract address (42 chars) | `0x...` |
| `VITE_POLYGON_ZK_EVM_NETWORK_ID` | Tajir Chain network ID | `1` |
| `VITE_BRIDGE_API_URL` | Backend bridge indexer API URL | `https://bridge-api.tajirchain.io` |
| `VITE_ENABLE_FIAT_EXCHANGE_RATES` | Enable fiat price display | `true` / `false` |
| `VITE_ENABLE_DEPOSIT_WARNING` | Show deposit risk warning | `true` / `false` |
| `VITE_ENABLE_REPORT_FORM` | Enable bug report form | `true` / `false` |

#### Optional / Branding Variables

| Variable | Description |
|---|---|
| `VITE_LOGO_PATH` | Path or URL to the network logo SVG |
| `VITE_FAVICON_PATH` | Favicon path |
| `VITE_NETWORK_NAME` | Display name shown in the UI |
| `VITE_NETWORK_SYMBOL` | Native token symbol |
| `VITE_BRAND_COMPONENTS` | Enable branded header/navbar (`true`/`false`) |
| `VITE_FRONTEND_TYPE` | UI design variant: `new-design` (default) or `old-design` |

#### Theming Variables

The UI supports full color customisation via environment variables:

```env
VITE_THEME_COLOR_PRIMARY_MAIN=#7b3fe4
VITE_THEME_COLOR_PRIMARY_DARK=#5a1cc3
VITE_THEME_COLOR_SUCCESS_MAIN=#1ccc8d
VITE_THEME_COLOR_ERROR_MAIN=#e8430d
VITE_THEME_COLOR_BLACK=#0a0b0d
VITE_THEME_COLOR_WHITE=#ffffff
```

Refer to [`.env.example`](./.env.example) for the complete list of supported variables.

### Running Locally

```bash
npm run dev
```

The application will be available at **`http://localhost:5173`** (or the port shown in your terminal).

#### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Compile a production bundle to `/dist` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint all TypeScript/TSX source files |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format all files with Prettier |

---

## Docker Deployment

The multi-stage `Dockerfile` produces a minimal **nginx:alpine** runtime image — no Node.js or build tools are shipped to production. Environment variables are injected at container start-up via `scripts/entrypoint.sh` (sed-based placeholder substitution), enabling a **single Docker image to serve multiple environments without rebuilding**.

### Build the Image

```bash
docker build . -t tajir-chain-bridge-ui:latest
```

### Run the Container

```bash
docker run -p 8080:80 \
  -e VITE_BRIDGE_API_URL="https://bridge-api.tajirchain.io" \
  -e VITE_ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/<KEY>" \
  -e VITE_ETHEREUM_EXPLORER_URL="https://etherscan.io" \
  -e VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS="0x..." \
  -e VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT="true" \
  -e VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS="0x..." \
  -e VITE_ETHEREUM_ROLLUP_MANAGER_ADDRESS="0x..." \
  -e VITE_POLYGON_ZK_EVM_RPC_URL="https://rpc.tajirchain.io" \
  -e VITE_POLYGON_ZK_EVM_EXPLORER_URL="https://explorer.tajirchain.io" \
  -e VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS="0x..." \
  -e VITE_POLYGON_ZK_EVM_NETWORK_ID="1" \
  -e VITE_ENABLE_FIAT_EXCHANGE_RATES="false" \
  -e VITE_ENABLE_DEPOSIT_WARNING="true" \
  -e VITE_ENABLE_REPORT_FORM="false" \
  tajir-chain-bridge-ui:latest
```

The bridge UI will be served at **`http://localhost:8080`**.

> See [`deployment/nginx.conf`](./deployment/nginx.conf) for the nginx server configuration.

---

## CI / CD Pipeline

Automated workflows are defined under [`.github/workflows/`](./.github/workflows/):

| Workflow | Trigger | Description |
|---|---|---|
| `push-docker-main.yml` | Push to `develop` / manual dispatch | Builds & pushes multi-arch Docker image (`amd64` + `arm64`) to DockerHub |
| `push-docker-develop.yml` | Push to `develop` | Builds development image |
| `auto-tag.yml` | Push to `main` | Automatically tags releases |
| `autobuild.yml` | Pull Request | Runs build validation |
| `require-source-branch.yml` | Pull Request | Enforces source branch naming policy |
| `require-version-label.yml` | Pull Request | Requires version bump label on PRs |

---

## Project Structure

```
tajir-chain-bridge-ui/
├── abis/                          # Smart contract ABIs (JSON)
│   ├── bridge.json                # Core bridge contract ABI
│   ├── bridgeL2_v1.json           # L2 bridge variant ABI
│   ├── erc-20.json                # ERC-20 + permit extensions
│   ├── proof-of-efficiency.json   # zkEVM PoE contract ABI
│   ├── rollup-manager.json        # Rollup manager ABI
│   ├── uniswap-v2-pair.json       # Uniswap pair ABI
│   └── uniswap-v2-router-02.json  # Uniswap router ABI
├── deployment/
│   └── nginx.conf                 # nginx server configuration
├── scripts/
│   ├── deploy.sh                  # Deployment helper script
│   ├── entrypoint.sh              # Docker env substitution entrypoint
│   └── generate-contract-types.sh # TypeChain code generation script
├── src/
│   ├── adapters/                  # External service adapters
│   │   ├── bridge-api.ts          # Bridge indexer REST API client
│   │   ├── env.ts                 # Environment variable parsing & validation (zod)
│   │   ├── ethereum.ts            # ethers.js blockchain interaction layer
│   │   ├── fiat-exchange-rates-api.ts  # Fiat currency rate fetcher
│   │   ├── storage.ts             # localStorage persistence
│   │   └── tokens.ts              # Token list adapter
│   ├── assets/                    # SVG icons, images, network logos
│   ├── constants.ts               # App-wide constants and chain factory
│   ├── contexts/                  # React context providers
│   │   └── providers.context.tsx  # Wallet / provider state management
│   ├── domain/
│   │   └── index.ts               # Core TypeScript domain types & enums
│   ├── hooks/                     # Custom React hooks
│   ├── routes.ts                  # Application route definitions
│   ├── styles/                    # Global CSS / JSS theme tokens
│   ├── utils/                     # Pure utility functions
│   └── views/                     # Page-level React components
│       ├── home/                  # Bridge form (deposit / withdraw)
│       ├── activity/              # Transaction history
│       ├── bridge-confirmation/   # Confirmation screen
│       ├── bridge-details/        # Transaction detail view
│       ├── login/                 # Wallet connection screen
│       ├── settings/              # User preferences (currency, etc.)
│       └── shared/                # Reusable UI components
├── .env.example                   # Environment variable template
├── Dockerfile                     # Multi-stage production Dockerfile
├── index.html                     # Vite HTML entry point
├── package.json                   # Dependencies & npm scripts
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite bundler configuration
```

---

## Contributing

We welcome contributions from the global developer community. Please read the following before submitting a pull request.

- **Branch policy:** All PRs must target the `develop` branch.
- **Code style:** Run `npm run lint:fix` and `npm run format` before committing.
- **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/) format.
- **Version labels:** PRs require a version bump label (`patch`, `minor`, or `major`).

Detailed guidelines are available in [`.github/CONTIBUTING.md`](./.github/CONTIBUTING.md).

For complex feature proposals, please open an [Issue](../../issues) first to align with the core team before investing development time.

---

## Security

The security of the Tajir Chain Bridge is taken seriously by our engineering team. If you discover a vulnerability, **please do not open a public GitHub Issue.**

| Channel | Contact |
|---|---|
| 🛡️ Smart Contract Bugs | [Immunefi Bug Bounty](https://immunefi.com/bounty/polygon) |
| 🌐 Web Application Vulnerabilities | [HackerOne](https://hackerone.com/polygon-technology) |
| 📧 Direct Security Contact | security@tajirchain.io |

Please review our full [Security Policy](./SECURITY.md) before submitting a report.

---

## License

```
MIT License

Copyright (c) 2024 Tajir Chain

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> **Attribution:** This project is built upon the [Polygon zkEVM Bridge UI](https://github.com/0xPolygonHermez/zkevm-bridge-ui),
> originally developed by Hermez Network and maintained by Polygon Technology.
> Portions of the upstream codebase are licensed under the **GNU Affero General Public License v3.0** —
> see the original [LICENSE](./LICENSE) file for full upstream license details.

---

<div align="center">

**Built with ❤️ by the Tajir Chain Engineering Team**

[Website](https://tajirchain.com) &nbsp;·&nbsp; 

<sub>©2026 Tajir Holdings. All rights reserved.</sub>

</div>