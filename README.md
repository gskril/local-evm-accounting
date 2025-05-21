> [!NOTE]  
> This is a work in progress and not currently operational.

# Local-First EVM Portfolio Tracker

A simple portfolio tracker for EVM accounts that gets data exclusively from user-provided RPC endpoints. The program explicity doesn't care about transaction history to reduce complexity and maximize privacy.

Uses the [1inch Spot Price Aggregator](https://portal.1inch.dev/documentation/contracts/spot-price-aggregator/introduction) to get asset values.

For more complex portfolio tracking and tax preparation, use [Rotki](https://rotki.com/).

## Features

- [ ] Add account
- [ ] Add chain
- [ ] Add token
- [ ] View token balances
- [ ] View portfolio value (in USD)

## Getting Started

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
