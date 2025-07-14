#!/usr/bin/env node

const { spawn } = require('node:child_process');
const { ensureBinary } = require('../lib/downloader');

async function main() {
  try {
    // Filter out our custom arguments before passing to PocketBase
    const args = process.argv.slice(2).filter((arg, index, arr) => {
      if (arg === '--pb-version') {
        return false; // Remove the flag
      }
      if (arr[index - 1] === '--pb-version') {
        return false; // Remove the version value
      }
      return true;
    });

    // Show help if requested
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
PocketBase npm wrapper - Additional options:

  --pb-version <version>   Use specific PocketBase version (e.g. --pb-version 0.28.4)

Environment variables:
  POCKETBASE_VERSION       Set default PocketBase version to use

Examples:
  npx @fadlee/pocketbase serve                    # Use latest version
  npx @fadlee/pocketbase --pb-version 0.28.4 serve  # Use specific version
  POCKETBASE_VERSION=0.28.4 npx @fadlee/pocketbase serve  # Use env var

PocketBase options:
`);
    }

    const binaryPath = await ensureBinary();

    const child = spawn(binaryPath, args, {
      stdio: 'inherit',
      shell: false,
      cwd: process.cwd(),
      env: process.env
    });

    child.on('exit', (code) => {
      process.exit(code);
    });

    child.on('error', (err) => {
      console.error('Failed to start PocketBase:', err);
      process.exit(1);
    });

    // Handle process signals
    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
