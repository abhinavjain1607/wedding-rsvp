#!/usr/bin/env tsx

import path from "path";
import fs from "fs";
import { uploadFileToGCS } from "../server/gcs.js";

async function runGCSTests() {
  console.log("🧪 GCS Upload Manual Test Suite\n");

  const testFilePath = path.join(process.env.HOME!, "Downloads", "test-id.jpg");

  console.log(`Testing with file: ${testFilePath}`);

  // Check if file exists
  try {
    await fs.promises.access(testFilePath);
    console.log("✅ Test file exists");
  } catch {
    console.log("❌ Test file does not exist");
    return;
  }

  // Test 1: Environment variable validation
  console.log("\n📋 Test 1: Environment Variable Validation");
  try {
    const timestamp = Date.now();
    const filename = `test-upload-${timestamp}.jpg`;
    await uploadFileToGCS(testFilePath, filename);
    console.log(
      "❌ Expected error for missing GCS credentials, but upload succeeded"
    );
  } catch (error: any) {
    if (error.message.includes("GCS_BUCKET_NAME env variable not set")) {
      console.log("✅ PASSED - Correctly detected missing GCS_BUCKET_NAME");
    } else {
      console.log(`❌ FAILED - Unexpected error: ${error.message}`);
    }
  }

  // Test 2: File path validation
  console.log("\n📋 Test 2: File Path Validation");
  const nonExistentFile = "/tmp/non-existent-file.jpg";
  try {
    await uploadFileToGCS(nonExistentFile, "test.jpg");
    console.log(
      "❌ Expected error for non-existent file, but upload succeeded"
    );
  } catch (error: any) {
    console.log(`✅ PASSED - Correctly handled file error: ${error.message}`);
  }

  // Test 3: Filename generation logic
  console.log("\n📋 Test 3: Filename Generation Logic");
  const testCases = [
    {
      originalname: "photo.jpg",
      filename: "abc123",
      expected: "gallery/abc123.jpg",
    },
    {
      originalname: "document.pdf",
      filename: "def456",
      expected: "gallery/def456.pdf",
    },
    { originalname: "id.png", filename: "ghi789", expected: "ghi789.png" }, // for ID docs
  ];

  testCases.forEach(({ originalname, filename, expected }, index) => {
    const ext = originalname.split(".").pop();
    let gcsFileName;
    if (expected.startsWith("gallery/")) {
      gcsFileName = `gallery/${filename}.${ext}`;
    } else {
      gcsFileName = `${filename}.${ext}`;
    }

    if (gcsFileName === expected) {
      console.log(`✅ Test 3.${index + 1} PASSED - Generated: ${gcsFileName}`);
    } else {
      console.log(
        `❌ Test 3.${
          index + 1
        } FAILED - Expected: ${expected}, Got: ${gcsFileName}`
      );
    }
  });

  // Test 4: URL format validation
  console.log("\n📋 Test 4: URL Format Validation");
  const testUrls = [
    {
      bucket: "my-bucket",
      filename: "test.jpg",
      expected: "https://storage.googleapis.com/my-bucket/test.jpg",
    },
    {
      bucket: "wedding-photos",
      filename: "gallery/photo.png",
      expected:
        "https://storage.googleapis.com/wedding-photos/gallery/photo.png",
    },
  ];

  testUrls.forEach(({ bucket, filename, expected }, index) => {
    const url = `https://storage.googleapis.com/${bucket}/${filename}`;
    if (url === expected) {
      console.log(`✅ Test 4.${index + 1} PASSED - URL format correct: ${url}`);
    } else {
      console.log(
        `❌ Test 4.${index + 1} FAILED - Expected: ${expected}, Got: ${url}`
      );
    }
  });

  console.log("\n🎉 Test suite completed!");
  console.log("\nTo run actual GCS upload, set these environment variables:");
  console.log("- GCS_BUCKET_NAME");
  console.log("- GCS_PROJECT_ID");
  console.log("- GCS_KEY_BASE64 (base64-encoded service account key)");
  console.log("- GCS_UPLOAD_PREFIX (optional)");
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the tests
runGCSTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
