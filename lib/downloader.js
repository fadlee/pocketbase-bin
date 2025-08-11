const https = require('node:https');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');
const { pipeline } = require('node:stream');

const streamPipeline = promisify(pipeline);

// Default version - will be overridden by latest release
const DEFAULT_VERSION = '0.28.4';

function getPlatformInfo() {
  const platform = process.platform;
  const arch = process.arch;

  let platformName;
  let archName;
  let extension = '';

  if (platform === 'win32') {
    platformName = 'windows';
    extension = '.exe';
  } else if (platform === 'darwin') {
    platformName = 'darwin';
  } else if (platform === 'linux') {
    platformName = 'linux';
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  if (arch === 'x64') {
    archName = 'amd64';
  } else if (arch === 'arm64') {
    archName = 'arm64';
  } else {
    throw new Error(`Unsupported architecture: ${arch}`);
  }

  return { platformName, archName, extension };
}

function getLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/pocketbase/pocketbase/releases/latest',
      method: 'GET',
      headers: {
        'User-Agent': 'pocketbase-npm-wrapper'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          const version = release.tag_name.replace(/^v/, ''); // Remove 'v' prefix
          console.log(`Latest PocketBase version: ${version}`);
          resolve(version);
        } catch (error) {
          console.warn('Failed to parse GitHub API response, using default version');
          resolve(DEFAULT_VERSION);
        }
      });
    });

    req.on('error', (error) => {
      console.warn('Failed to fetch latest release, using default version:', error.message);
      resolve(DEFAULT_VERSION);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.warn('GitHub API timeout, using default version');
      resolve(DEFAULT_VERSION);
    });

    req.end();
  });
}

function getRequestedVersion() {
  // Check command line arguments for version override
  const args = process.argv;
  const versionIndex = args.indexOf('--pb-version');

  if (versionIndex !== -1 && versionIndex + 1 < args.length) {
    return args[versionIndex + 1];
  }

  // Check environment variable
  if (process.env.POCKETBASE_VERSION) {
    return process.env.POCKETBASE_VERSION;
  }

  return null;
}

async function getBinaryPath() {
  const { extension } = getPlatformInfo();
  const binaryName = `pocketbase${extension}`;

  // Get version - either specified or latest
  const requestedVersion = getRequestedVersion();
  const version = requestedVersion || await getLatestRelease();

  console.log(`Using PocketBase version: ${version}`);

  const binaryPath = path.join(process.cwd(), binaryName);
  const versionFile = path.join(process.cwd(), '.pocketbase-version');

  const { platformName, archName } = getPlatformInfo();
  const downloadUrl = `https://github.com/pocketbase/pocketbase/releases/download/v${version}/pocketbase_${version}_${platformName}_${archName}.zip`;

  return {
    binaryPath,
    downloadUrl,
    binaryName,
    versionFile,
    version
  };
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;

    const request = client.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode} - ${response.statusMessage}`));
        return;
      }

      const totalSize = Number.parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\rDownloading... ${progress}%`);
        }
      });

      const fileStream = fs.createWriteStream(dest);
      streamPipeline(response, fileStream)
        .then(() => {
          console.log('\nDownload completed');
          resolve();
        })
        .catch(reject);
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

function extractZip(zipPath, extractDir, binaryName) {
  return new Promise((resolve, reject) => {
    try {
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(zipPath);
      const entry = zip.getEntry(binaryName);

      if (entry) {
        // Target path for the extracted file
        const targetPath = path.join(extractDir, entry.name);

        // Extract the entry to the specified directory
        zip.extractEntryTo(entry, extractDir, false, true);

        // Rename the extracted file to the desired binary name
        fs.renameSync(path.join(extractDir, entry.entryName), targetPath);

        console.log(`Extracted ${entry.name}`);
        resolve(targetPath);
      } else {
        reject(new Error(`Binary not found in zip: ${binaryName}`));
      }
    } catch (err) {
      reject(new Error('Failed to extract zip file. Please ensure adm-zip is installed.'));
    }
  });
}

async function downloadBinary() {
  const { binaryPath, downloadUrl, binaryName, versionFile, version } = await getBinaryPath();

  console.log('Downloading PocketBase binary...');
  console.log(`Platform: ${process.platform}-${process.arch}`);
  console.log(`Version: ${version}`);
  console.log(`URL: ${downloadUrl}`);

  const zipPath = path.join(process.cwd(), 'pocketbase.zip');

  try {
    await downloadFile(downloadUrl, zipPath);
    console.log('Extracting binary...');

    await extractZip(zipPath, process.cwd(), binaryName);

    // Clean up zip file
    fs.unlinkSync(zipPath);

    // Make binary executable on Unix systems
    if (process.platform !== 'win32') {
      fs.chmodSync(binaryPath, 0o755);
    }

    // Write version file
    fs.writeFileSync(versionFile, version);

    console.log(`✅ PocketBase binary ready: ${binaryName} (v${version})`);
    return binaryPath;

  } catch (error) {
    console.error('❌ Failed to download PocketBase binary:', error.message);
    throw error;
  }
}

async function ensureBinary() {
  const { binaryPath, versionFile, version } = await getBinaryPath();

  // Check if binary exists and version matches
  if (fs.existsSync(binaryPath) && fs.existsSync(versionFile)) {
    const currentVersion = fs.readFileSync(versionFile, 'utf8').trim();
    if (currentVersion === version) {
      console.log(`✅ Using existing PocketBase binary (v${version})`);
      return binaryPath;
    }

    console.log(`🔄 Version mismatch: current=${currentVersion}, requested=${version}`);
  }

  return await downloadBinary();
}

module.exports = {
  ensureBinary,
  getBinaryPath
};
