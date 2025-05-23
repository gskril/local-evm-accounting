# Local-First EVM Portfolio Tracker

A simple portfolio tracker for EVM accounts that gets data exclusively from user-provided RPC endpoints. The program explicity doesn't care about transaction history to reduce complexity and maximize privacy.

Uses the [1inch Spot Price Aggregator](https://portal.1inch.dev/documentation/contracts/spot-price-aggregator/introduction) to get asset values.

For more complex portfolio tracking and tax preparation, use [Rotki](https://rotki.com/).

> [!NOTE]  
> I haven't thought of a clean way to handle custom gas tokens, so there's currently no way to track POL on Polygon for example.

## Features

- [x] Add/edit accounts
- [x] Add/edit chains
- [x] Add/edit tokens
- [ ] Add/edit manual balances for tracking assets on exchanges
- [x] View token balances
- [x] View token/portfolio value in USD/EUR/ETH

### Extras

- [ ] Show portfolio value over time (cron to refresh balances and store time series data)
- [ ] Trigger notifications when balances change

## Getting Started

> [!NOTE]  
> Docker setup coming soon for easy deployment on a home server.

### Installation

```bash
# Install dependencies for all workspaces
bun install
```

### Development

```bash
# Run everything
bun run dev

# Or run individual parts
bun run dev:server
bun run dev:client
```

### Building

```bash
# Build everything
bun run build

# Or build individual parts
bun run build:server
bun run build:client
```
