# E2E Tests

This directory contains end-to-end tests for TaskPlex.

## Structure

```
e2e/
├── web/           # Browser-based E2E tests (Playwright)
├── tauri/         # Tauri-specific E2E tests (tauri-driver)
└── shared/        # Shared test utilities and fixtures
```

## Running E2E Tests

### Web E2E Tests (Playwright)

```bash
# Install Playwright
npm install -D @playwright/test

# Run web E2E tests
npm run test:e2e:web
```

### Tauri E2E Tests

Tauri E2E tests use WebDriver with tauri-driver.

#### Prerequisites

1. Install tauri-driver:
```bash
cargo install tauri-driver
```

2. Install WebDriver client (selenium-webdriver):
```bash
npm install -D selenium-webdriver
```

#### Running Tauri E2E Tests

```bash
# Build the Tauri app first
npm run tauri build

# Run E2E tests for Linux
npm run test:e2e:tauri:linux

# Run E2E tests for Windows
npm run test:e2e:tauri:windows
```

## Platform-Specific Testing

The E2E tests can be configured to run against different platforms:

- **Web**: Standard browser testing with Playwright
- **Tauri Linux**: Tests run against the Linux AppImage/deb
- **Tauri Windows**: Tests run against the Windows MSI/exe
- **Tauri macOS**: Tests run against the macOS dmg/app

## CI Integration

For CI/CD, use GitHub Actions with matrix strategy to test across platforms:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    
steps:
  - uses: actions/checkout@v4
  - name: Run E2E Tests
    run: npm run test:e2e:${{ matrix.os == 'ubuntu-latest' && 'linux' || matrix.os == 'windows-latest' && 'windows' || 'macos' }}
```

