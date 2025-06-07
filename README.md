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
- [x] Add/edit manual balances for tracking assets on exchanges
- [x] View token balances
- [x] View token/portfolio value in USD/EUR/ETH

### Extras

- [x] Show portfolio value over time (cron to refresh balances and store time series data)
- [ ] Trigger notifications when balances change

## Getting Started

### Docker

By using the following Docker Compose file, you will expose the web client on port `8580`.

```yml
services:
  evm-portfolio:
    image: ghcr.io/gskril/evm-portfolio:latest
    container_name: evm-portfolio
    environment:
      - REDIS_URL=redis://redis:6379
      # Use this if you visit your local server from a different hostname
      # - __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=
    depends_on:
      - redis
    volumes:
      - evm-portfolio_data:/app/data
    restart: unless-stopped

  redis:
    image: redis:latest
    container_name: redis
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  evm-portfolio_data:
  redis_data:
```

### Development

```bash
# Install dependencies for all workspaces
bun install
```

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
