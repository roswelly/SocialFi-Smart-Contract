# Pump Fun UI

Pump Fun UI is a Next.js-based web application for interacting with the Pump Fun platform.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Architecture Overview](#architecture-overview)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Dependencies](#dependencies)


## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- Yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/redWilly/Pump-UI
   cd Pump-UI
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running the Application

1. Set up your environment variables (see [Environment Variables](#environment-variables) section).

2. Start the development server:
   ```bash
   yarn dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## Architecture Overview

Pump Fun UI is built using the following technologies and frameworks:

- Next.js: React framework for server-side rendering and static site generation
- React: JavaScript library for building user interfaces
- Tailwind CSS: Utility-first CSS framework for styling
- Ethers.js: Library for interacting with Ethereum
- RainbowKit: Ethereum wallet connection library
- Wagmi: React hooks for EVM chains
- lightweight-charts: Charting libraries for data visualization

The application follows a component-based architecture, with reusable UI components and hooks for managing state and interactions with the blockchain.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_BASE_URL=backend-url
NEXT_PUBLIC_BONDING_CURVE_ADDRESS="ethereum-mainnet-contract-address"
NEXT_PUBLIC_WS_BASE_URL=https://backend-url
CHAINSAFE_API_KEY=your_chainsafe_api_key
CHAINSAFE_BUCKET_ID=your_chainsafe_bucket_id
```

### 🚀 Looking to build a platform like Pump.fun?

I've made the UI open-source, but the backend and smart contract are closed-source. If you're interested in creating a full-fledged Pump.fun-like platform, let's collaborate! [Contact me on Telegram](https://t.me/rink3y) (RedWilly) for more details.