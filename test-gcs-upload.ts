#!/usr/bin/env tsx

import { uploadFileToGCS } from "./server/gcs";
import path from "path";
import { promises as fs } from "fs";

async function testGCSUpload() {
  const testFilePath = path.join(process.env.HOME!, "Downloads", "test-id.jpg");

  console.log("Testing GCS upload...");
  console.log("Test file path:", testFilePath);

  try {
    // Check if file exists
    await fs.access(testFilePath);
    console.log("✅ Test file exists");

    // Generate a unique filename for the upload
    const timestamp = Date.now();
    const filename = `test-upload-${timestamp}.jpg`;

    console.log("📤 Uploading to GCS with filename:", filename);

    // Upload the file
    const gcsUrl = await uploadFileToGCS(testFilePath, filename);

    console.log("✅ Upload successful!");
    console.log("📍 GCS URL:", gcsUrl);

    return gcsUrl;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
}

// Test cases
async function runTests() {
  console.log("🧪 Running GCS Upload Tests\n");

  // Test 1: Basic upload
  try {
    console.log("Test 1: Basic file upload");
    const url = await testGCSUpload();
    console.log("✅ Test 1 PASSED\n");

    // Test 2: Check URL format
    console.log("Test 2: URL format validation");
    if (url.startsWith("https://storage.googleapis.com/")) {
      console.log("✅ Test 2 PASSED - URL format correct\n");
    } else {
      console.log("❌ Test 2 FAILED - URL format incorrect\n");
    }

    // Test 3: Check if local file was cleaned up
    console.log("Test 3: Local file cleanup check");
    const testFilePath = path.join(
      process.env.HOME!,
      "Downloads",
      "test-id.jpg"
    );
    try {
      await fs.access(testFilePath);
      console.log(
        "❌ Test 3 FAILED - Original file should be deleted after upload\n"
      );
    } catch {
      console.log(
        "✅ Test 3 PASSED - Local file was cleaned up after upload\n"
      );
    }
  } catch (error) {
    console.error("🧪 Test suite failed:", error);
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testGCSUpload };
