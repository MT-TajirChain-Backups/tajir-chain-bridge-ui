# Security Policy — Tajir Chain Bridge UI

The Tajir Chain engineering team takes the security of this project and the assets of its users with the utmost seriousness. We are committed to working with the security community to identify, address, and disclose vulnerabilities in a responsible and timely manner.

---

## Reporting a Vulnerability

> ⚠️ **Please do NOT report security vulnerabilities through public GitHub Issues, Discussions, or Pull Requests.**

Public disclosure before a fix is in place puts users at risk. Instead, use one of the dedicated private channels below.

### Disclosure Channels

| Category | Channel | Response Target |
|---|---|---|
| 🛡️ **Smart Contract Vulnerabilities** | [Immunefi Bug Bounty](https://immunefi.com/bounty/polygon) | 48 hours |
| 🌐 **Web Application / UI Vulnerabilities** | [HackerOne](https://hackerone.com/polygon-technology) | 48 hours |
| 📧 **General Security Inquiries** | security@tajirchain.io | 72 hours |

When reporting, please include as much detail as possible:

- A clear description of the vulnerability and its potential impact
- Steps to reproduce the issue (proof-of-concept, if available)
- Affected components (contract address, UI route, API endpoint, etc.)
- Your recommended severity rating (Critical / High / Medium / Low)
- Any suggested mitigations or patches

---

## Scope

### In Scope

| Component | Details |
|---|---|
| **Bridge UI** | This repository (`tajir-chain-bridge-ui`) |
| **Bridge Smart Contracts** | L1 / L2 Bridge contract, PoE contract, Rollup Manager |
| **Bridge API Service** | The backend indexer API consumed by this UI |
| **Wallet Integration** | MetaMask and WalletConnect authentication flows |
| **ERC-20 Permit Logic** | DAI permit, EIP-2612, Uniswap permit signing |

### Out of Scope

- Third-party dependencies not maintained by Tajir Chain (e.g., ethers.js, WalletConnect SDK)
- Issues in upstream Polygon zkEVM infrastructure not specific to Tajir Chain
- Theoretical vulnerabilities without a demonstrable impact
- Automated scan reports without manual triage / proof of exploitability
- Social engineering attacks against Tajir Chain staff

---

## Severity Classification

We follow the [CVSS v3.1](https://www.first.org/cvss/) standard for scoring vulnerabilities:

| Severity | Score | Examples |
|---|---|---|
| 🔴 **Critical** | 9.0 – 10.0 | Bridge contract fund drain, private key exposure |
| 🟠 **High** | 7.0 – 8.9 | Permit signature replay, cross-chain fund misdirection |
| 🟡 **Medium** | 4.0 – 6.9 | UI-based phishing vector, incorrect balance display |
| 🟢 **Low** | 0.1 – 3.9 | Minor information disclosure, non-exploitable misconfiguration |

---

## Responsible Disclosure Policy

- We commit to acknowledging your report within the response targets listed above.
- We will keep you informed of our progress toward a fix.
- We ask that you **do not disclose the vulnerability publicly** until we have released a patch and coordinated disclosure.
- Researchers who follow responsible disclosure will be **publicly credited** (if desired) in our release notes.
- We do not pursue legal action against researchers who act in good faith under this policy.

---

## Preferred Language

`Preferred-Languages: en`

---

## Security Contact

**Email:** security@tajirchain.io  
**PGP Key:** *(available upon request)*

---

## Attribution

This security policy is inspired by and partially derived from the [Polygon Technology Security Policy](https://polygon.technology/security.txt).  
Portions of the upstream bridge codebase are copyright © 2023 Catenable AG, licensed under the GNU AGPL v3.
