# @fadlee/pocketbase-bin

[![npm version](https://badge.fury.io/js/%40fadlee%2Fpocketbase-bin.svg)](https://badge.fury.io/js/%40fadlee%2Fpocketbase-bin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Node.js wrapper for [PocketBase](https://pocketbase.io/) that automatically downloads and manages PocketBase binaries with latest version detection.

## Features

- 🚀 **Automatic Binary Management**: Downloads the correct PocketBase binary for your platform
- 🔄 **Latest Version Detection**: Automatically fetches and uses the latest PocketBase release
- 🎯 **Version Pinning**: Support for specific version requirements
- 🌍 **Cross-Platform**: Works on macOS, Linux, and Windows (x64 and ARM64)
- ⚡ **Zero Configuration**: Works out of the box with sensible defaults
- 🔧 **Environment Variables**: Configurable via environment variables
- 📦 **NPX/Bunx Compatible**: Can be used directly with npx or bunx without installation

## Installation

### Global Installation

```bash
npm install -g @fadlee/pocketbase-bin
```

### Local Installation

```bash
npm install @fadlee/pocketbase-bin
```

### Use with NPX/Bunx (No Installation Required)

```bash
# With npm/npx
npx @fadlee/pocketbase-bin serve

# With bun/bunx
bunx @fadlee/pocketbase-bin serve
```

## Usage

### Basic Usage

```bash
# Start PocketBase server with latest version
pocketbase serve

# Or with npx
npx @fadlee/pocketbase-bin serve

# Or with bunx
bunx @fadlee/pocketbase-bin serve
```

### Version Management

```bash
# Use a specific version
pocketbase --pb-version 0.28.4 serve

# Or with environment variable
POCKETBASE_VERSION=0.28.4 pocketbase serve
```

### Common Commands

```bash
# Start the server
pocketbase serve

# Start with custom host and port
pocketbase serve --http=0.0.0.0:8090

# Create admin user
pocketbase admin create

# Import collections
pocketbase admin import collections.json

# Show help
pocketbase --help
```

## Configuration

### Command Line Options

- `--pb-version <version>`: Use a specific PocketBase version (e.g., `--pb-version 0.28.4`)

### Environment Variables

- `POCKETBASE_VERSION`: Set the default PocketBase version to use

### Examples

```bash
# Use latest version (default)
npx @fadlee/pocketbase-bin serve
bunx @fadlee/pocketbase-bin serve

# Use specific version via flag
npx @fadlee/pocketbase-bin --pb-version 0.28.4 serve
bunx @fadlee/pocketbase-bin --pb-version 0.28.4 serve

# Use specific version via environment variable
POCKETBASE_VERSION=0.28.4 npx @fadlee/pocketbase-bin serve
POCKETBASE_VERSION=0.28.4 bunx @fadlee/pocketbase-bin serve

# Start server on custom port
npx @fadlee/pocketbase-bin serve --http=localhost:9090
bunx @fadlee/pocketbase-bin serve --http=localhost:9090
```

## How It Works

1. **Version Detection**: The wrapper checks for a requested version via `--pb-version` flag or `POCKETBASE_VERSION` environment variable. If none specified, it fetches the latest release from GitHub.

2. **Binary Download**: Downloads the appropriate PocketBase binary for your platform (OS and architecture) from the official GitHub releases.

3. **Caching**: Downloaded binaries are cached locally with version tracking to avoid unnecessary re-downloads.

4. **Execution**: Passes all arguments directly to the PocketBase binary, maintaining full compatibility with PocketBase CLI.

## Supported Platforms

- **Operating Systems**: macOS, Linux, Windows
- **Architectures**: x64 (AMD64), ARM64
- **Node.js**: >= 14.0.0

## File Structure

When you run the wrapper, it creates the following files in your current directory:

```
.
├── pocketbase          # The PocketBase binary (Unix)
├── pocketbase.exe      # The PocketBase binary (Windows)
├── .pocketbase-version # Version tracking file
├── pb_data/           # PocketBase data directory (created by PocketBase)
└── pb_logs/           # PocketBase logs directory (created by PocketBase)
```

## Development

### Project Structure

```
├── bin/
│   └── runner.js      # Main executable script
├── lib/
│   └── downloader.js  # Binary download and management logic
├── package.json       # Package configuration
└── README.md         # This file
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/fadlee/pocketbase-bin.git
cd pocketbase-bin

# Install dependencies
npm install

# Test the wrapper
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Related Projects

- [PocketBase](https://pocketbase.io/) - The official PocketBase project
- [PocketBase JavaScript SDK](https://github.com/pocketbase/js-sdk) - Official JavaScript/TypeScript SDK

## Support

If you encounter any issues or have questions:

1. Check the [PocketBase documentation](https://pocketbase.io/docs/)
2. Search existing [GitHub issues](https://github.com/fadlee/pocketbase-bin/issues)
3. Create a new issue if needed

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

**Note**: This is an unofficial wrapper for PocketBase. For official PocketBase documentation and support, visit [pocketbase.io](https://pocketbase.io/).