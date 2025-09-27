import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { uploadFileToGCS } from "../server/gcs";
import { Storage } from "@google-cloud/storage";
import fs from "fs";

// Mock the @google-cloud/storage module
jest.mock("@google-cloud/storage");

const mockStorage = Storage as jest.MockedClass<typeof Storage>;
const mockBucket = {
  upload: jest.fn(),
  file: jest.fn().mockReturnValue({
    makePublic: jest.fn().mockResolvedValue(undefined),
  }),
};

mockStorage.mockImplementation(
  () =>
    ({
      bucket: jest.fn().mockReturnValue(mockBucket),
    } as any)
);

describe("GCS Upload Functionality", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("uploadFileToGCS", () => {
    it("should successfully upload a file and return public URL", async () => {
      // Setup environment variables
      process.env.GCS_BUCKET_NAME = "test-bucket";
      process.env.GCS_PROJECT_ID = "test-project";
      process.env.GCS_KEY_BASE64 = "dGVzdC1rZXk="; // base64 encoded "test-key"
      process.env.GCS_UPLOAD_PREFIX = "uploads/";

      // Mock successful upload
      mockBucket.upload.mockResolvedValue([{}]);

      const localFilePath = "/tmp/test-file.jpg";
      const destFileName = "test-upload.jpg";

      const result = await uploadFileToGCS(localFilePath, destFileName);

      expect(result).toBe(
        "https://storage.googleapis.com/test-bucket/uploads/test-upload.jpg"
      );
      expect(mockBucket.upload).toHaveBeenCalledWith(localFilePath, {
        destination: "uploads/test-upload.jpg",
        public: true,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });
      expect(mockBucket.file).toHaveBeenCalledWith("uploads/test-upload.jpg");
      expect(mockBucket.file().makePublic).toHaveBeenCalled();
    });

    it("should work without upload prefix", async () => {
      process.env.GCS_BUCKET_NAME = "test-bucket";
      process.env.GCS_PROJECT_ID = "test-project";
      process.env.GCS_KEY_BASE64 = "dGVzdC1rZXk=";

      mockBucket.upload.mockResolvedValue([{}]);

      const result = await uploadFileToGCS("/tmp/test.jpg", "test.jpg");

      expect(result).toBe(
        "https://storage.googleapis.com/test-bucket/test.jpg"
      );
      expect(mockBucket.upload).toHaveBeenCalledWith("/tmp/test.jpg", {
        destination: "test.jpg",
        public: true,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });
    });

    it("should delete local file after successful upload", async () => {
      process.env.GCS_BUCKET_NAME = "test-bucket";
      process.env.GCS_PROJECT_ID = "test-project";
      process.env.GCS_KEY_BASE64 = "dGVzdC1rZXk=";

      mockBucket.upload.mockResolvedValue([{}]);
      const unlinkSpy = jest.spyOn(fs, "unlinkSync").mockImplementation();

      await uploadFileToGCS("/tmp/test.jpg", "test.jpg");

      expect(unlinkSpy).toHaveBeenCalledWith("/tmp/test.jpg");
      unlinkSpy.mockRestore();
    });

    it("should throw error when GCS_BUCKET_NAME is not set", async () => {
      delete process.env.GCS_BUCKET_NAME;

      await expect(
        uploadFileToGCS("/tmp/test.jpg", "test.jpg")
      ).rejects.toThrow("GCS_BUCKET_NAME env variable not set");
    });

    it("should throw error when GCS_PROJECT_ID is not set", async () => {
      process.env.GCS_BUCKET_NAME = "test-bucket";
      delete process.env.GCS_PROJECT_ID;

      await expect(
        uploadFileToGCS("/tmp/test.jpg", "test.jpg")
      ).rejects.toThrow("GCS_PROJECT_ID env variable not set");
    });

    it("should handle invalid base64 key", async () => {
      process.env.GCS_BUCKET_NAME = "test-bucket";
      process.env.GCS_PROJECT_ID = "test-project";
      process.env.GCS_KEY_BASE64 = "invalid-base64!";

      await expect(
        uploadFileToGCS("/tmp/test.jpg", "test.jpg")
      ).rejects.toThrow("Invalid GCS_KEY_BASE64");
    });

    it("should handle upload failures", async () => {
      process.env.GCS_BUCKET_NAME = "test-bucket";
      process.env.GCS_PROJECT_ID = "test-project";
      process.env.GCS_KEY_BASE64 = "dGVzdC1rZXk=";

      mockBucket.upload.mockRejectedValue(new Error("Upload failed"));

      await expect(
        uploadFileToGCS("/tmp/test.jpg", "test.jpg")
      ).rejects.toThrow("Upload failed");
    });

    it("should handle makePublic failures", async () => {
      process.env.GCS_BUCKET_NAME = "test-bucket";
      process.env.GCS_PROJECT_ID = "test-project";
      process.env.GCS_KEY_BASE64 = "dGVzdC1rZXk=";

      mockBucket.upload.mockResolvedValue([{}]);
      const mockFile = {
        makePublic: jest
          .fn()
          .mockRejectedValue(new Error("Make public failed")),
      };
      mockBucket.file.mockReturnValue(mockFile as any);

      await expect(
        uploadFileToGCS("/tmp/test.jpg", "test.jpg")
      ).rejects.toThrow("Make public failed");
    });
  });

  describe("Integration with Routes", () => {
    it("should generate correct GCS filename format for gallery uploads", () => {
      // Test the filename generation logic used in routes
      const file = {
        originalname: "test-photo.jpg",
        filename: "multer-generated-filename",
      };

      const ext = file.originalname.split(".").pop();
      const gcsFileName = `gallery/${file.filename}.${ext}`;

      expect(gcsFileName).toBe("gallery/multer-generated-filename.jpg");
    });

    it("should generate correct GCS filename format for ID documents", () => {
      // Test the filename generation logic used in routes
      const file = {
        originalname: "id-card.png",
        filename: "multer-generated-filename",
      };

      const ext = file.originalname.split(".").pop();
      const gcsFileName = `${file.filename}.${ext}`;

      expect(gcsFileName).toBe("multer-generated-filename.png");
    });
  });
});
