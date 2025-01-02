#!/bin/bash

# URL of the raw file
URL="https://raw.githubusercontent.com/dsasidhar/electron-proctor/refs/heads/main/dist/proctoring-tool.js"
OUTPUT_FILE="proctoring-tool.js"
PID_FILE="electron-proctor.pid"

# Function to clean up and terminate the Electron app
cleanup() {
    if [ -f "$PID_FILE" ]; then
        ELECTRON_PID=$(cat "$PID_FILE")
        if kill -0 "$ELECTRON_PID" 2>/dev/null; then
            echo "Terminating Electron app with PID $ELECTRON_PID..."
            kill "$ELECTRON_PID"
        fi
        rm -f "$PID_FILE"
    fi
    echo "Cleanup complete. Exiting."
    exit 0
}

# Trap signals and call cleanup
trap cleanup SIGINT SIGTERM

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

echo "Download complete. Running with Electron..."

# Run with npx electron and save the PID
npx electron "$OUTPUT_FILE" &
ELECTRON_PID=$!
echo $ELECTRON_PID > "$PID_FILE"
echo "Electron app started with PID $ELECTRON_PID. Press Ctrl+C to terminate gracefully."

# Wait for the Electron process to finish
wait $ELECTRON_PID

# Cleanup the PID file on exit
cleanup
