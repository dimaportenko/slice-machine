# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build Commands
```bash
# Clean all build artifacts
yarn clean

# Build all packages (topological order)
yarn build

# Build essential packages (plugin-kit and manager)
yarn build-essential

# Build individual packages
yarn workspace slice-machine-ui build
yarn workspace @slicemachine/manager build
```

### Development Mode
```bash
# Start all packages in dev mode concurrently
yarn dev

# Start individual packages in dev mode
yarn dev:manager
yarn dev:slice-machine-ui
yarn dev:plugin-kit
yarn dev:init
```

### Testing
```bash
# Run all tests across workspaces
yarn test

# Run unit tests with coverage
yarn workspace slice-machine-ui unit
yarn workspace slice-machine-ui unit:watch

# Run E2E tests with Playwright
cd playwright && npm test
```

### Linting & Formatting
```bash
# Lint all workspaces
yarn lint

# Stylelint for CSS modules
yarn stylelint

# Format code
yarn prettier:check
yarn prettier:fix

# Pre-commit hooks
yarn lint-staged
```

### Playground Development
```bash
# Start development playground (requires yarn dev running)
yarn play
yarn play my-playground-name
yarn play -f sveltekit  # specify framework
```

## Architecture

### Monorepo Structure
This is a Yarn workspace monorepo containing:
- **slice-machine-ui** - Next.js UI application for Slice Machine
- **@slicemachine/manager** - Core business logic and API management
- **@slicemachine/plugin-kit** - Plugin system for framework adapters
- **@slicemachine/init** - CLI initialization tool
- **start-slicemachine** - CLI launcher for Slice Machine
- **Adapters** - Framework-specific implementations:
  - @slicemachine/adapter-next
  - @slicemachine/adapter-nuxt
  - @slicemachine/adapter-nuxt2
  - @slicemachine/adapter-sveltekit

### Key Concepts

#### Plugin System
The plugin-kit provides a hook-based system for framework adapters. Adapters implement hooks to handle framework-specific operations like slice creation, custom type management, and code generation.

#### Manager Layer
The manager package handles:
- Authentication with Prismic
- Repository management
- API communication
- S3 screenshot uploads
- Configuration management
- Telemetry

#### SM Types
Slice Machine uses "SM" types (e.g., GroupSM) which are reshaped versions of @prismicio/types-internal types. These use arrays instead of objects for easier field ordering and transformations. Use `fromSM` and `toSM` helpers for conversion.

### File Structure Conventions
- Slices are stored in `slices/` directory
- Custom types in `customtypes/`
- Configuration in `slicemachine.config.json`
- TypeScript project detection via tsconfig.json presence

### Testing Strategy
- Unit tests with Vitest for all packages
- E2E tests with Playwright in `/playwright`
- MSW for API mocking in tests
- Coverage reports with @vitest/coverage-v8

### Important APIs
- Prismic Auth API for user authentication
- Prismic Repository API for content management
- AWS S3 for screenshot storage
- GitHub API for release notes
- NPM Registry for version checking