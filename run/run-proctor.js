const https = require("https");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const rawUrl =
  "https://raw.githubusercontent.com/dsasidhar/electron-proctor/main/dist/proctoring-tool.js";
const outputFile = path.join(__dirname, "proctoring-tool.js");

// Function to download the file
function downloadFile() {
  return new Promise((resolve, reject) => {
    console.log("Downloading file...");

    const file = fs.createWriteStream(outputFile);

    https
      .get(rawUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log("Download completed");
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(outputFile, () => {}); // Delete the file if download failed
        reject(err);
      });
  });
}

// Function to run the electron app
function runElectron() {
  console.log("Starting Electron app...");

  const command = `npx electron "${outputFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running Electron: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`Electron stderr: ${stderr}`);
    }
    if (stdout) {
      console.log(`Electron stdout: ${stdout}`);
    }
  });
}

// Main execution
async function main() {
  try {
    await downloadFile();
    runElectron();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
