# Local ETH Accounting

A local-first portfolio tracker for EVM accounts that gets data exclusively from user-provided RPC endpoints. The program explicity doesn't care about transaction history to reduce complexity and maximize privacy.

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
# Run shared types in watch mode, server, and client all at once
bun run dev

# Or run individual parts
bun run dev:shared  # Watch and compile shared types
bun run dev:server  # Run the Hono backend
bun run dev:client  # Run the Vite dev server for React
```

### Building

```bash
# Build everything
bun run build

# Or build individual parts
bun run build:shared  # Build the shared types package
bun run build:client  # Build the React frontend
```
