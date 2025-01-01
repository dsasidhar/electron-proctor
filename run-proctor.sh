#!/bin/bash

# URL of the raw file
URL="https://raw.githubusercontent.com/dsasidhar/electron-proctor/refs/heads/main/dist/proctoring-tool.js"
OUTPUT_FILE="proctoring-tool.js"

# Download the file
echo "Downloading $OUTPUT_FILE..."
curl -L -o "$OUTPUT_FILE" "$URL" || {
    echo "Failed to download file"
    exit 1
}

# Check if download was successful
if [ ! -f "$OUTPUT_FILE" ]; then
    echo "Download failed: File not found"
    exit 1
fi

echo "Download complete. Running with electron..."

# Run with npx electron
npx electron "$OUTPUT_FILE"