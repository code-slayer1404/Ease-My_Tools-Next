"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import JSZip from "jszip";
import styles from "./styles.module.css";

// Types
type Mode = "encrypt" | "decrypt";
type FileStatus = "pending" | "processing" | "completed" | "error";

interface FileItem {
  id: string;
  file: File;
  originalName: string;
  originalType: string;
  size: number;
  status: FileStatus;
  progress: number;
  encryptedSize?: number;
  error?: string;
  result?: Blob;
}

interface EncryptionProgress {
  current: number;
  total: number;
  currentFile: string;
  estimatedTimeRemaining: number;
}

interface ProcessResult {
  id: string;
  originalName: string;
  processedName: string;
  originalSize: number;
  processedSize: number;
  type: string;
  blob: Blob;
  timestamp: Date;
  mode: Mode;
}

interface ChunkMetadata {
  index: number;
  offset: number;
  length: number;
  encryptedLength: number;
  iv: string;
}

interface EncryptedFileHeader {
  magic: string;
  version: number;
  originalName: string;
  originalType: string;
  originalSize: number;
  createdAt: number;
  chunkSize: number;
  totalChunks: number;
  salt: string;
  chunks: ChunkMetadata[];
}

const MAGIC_IDENTIFIER = "EASYMT";
const CURRENT_VERSION = 2;
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const PBKDF2_ITERATIONS = 600000; // Increased from 100000 to 600000 for better security
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit

// Helper: Convert Uint8Array to ArrayBuffer
const toArrayBuffer = (uint8Array: Uint8Array): ArrayBuffer => {
  return uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength,
  ) as ArrayBuffer;
};

// Helper: Convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary);
};

// Helper: Convert Base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    const charCode = binary.charCodeAt(i);
    if (!isNaN(charCode)) {
      bytes[i] = charCode;
    }
  }
  return bytes.buffer;
};

// Generate secure random bytes
const getRandomBytes = (size: number): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(size));
};

// Generate secure password
const generateSecurePassword = (): string => {
  const length = 20;
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*";

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  const allChars = uppercase + lowercase + numbers + symbols;
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomValue = array[i];
    if (randomValue !== undefined) {
      password += allChars.charAt(randomValue % allChars.length);
    }
  }

  return password;
};

// Password strength checker
const checkPasswordStrength = (
  password: string,
): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;

  const strengthMap = [
    { score: 0, label: "Very Weak", color: "#ef4444" },
    { score: 2, label: "Weak", color: "#f59e0b" },
    { score: 4, label: "Fair", color: "#eab308" },
    { score: 5, label: "Good", color: "#10b981" },
    { score: 7, label: "Strong", color: "#22c55e" },
  ];

  const strength = strengthMap.reduce((prev, curr) =>
    score >= curr.score ? curr : prev,
  );
  return { score, label: strength.label, color: strength.color };
};

// Derive key from password using PBKDF2 with increased iterations
const deriveKey = async (
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const saltBuffer = toArrayBuffer(salt);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

// Encrypt a single chunk with its own IV
const encryptChunk = async (
  chunk: Uint8Array,
  key: CryptoKey,
): Promise<{ encryptedData: Uint8Array; iv: Uint8Array }> => {
  const iv = getRandomBytes(12);
  const ivBuffer = toArrayBuffer(iv);
  const chunkBuffer = toArrayBuffer(chunk);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivBuffer },
    key,
    chunkBuffer,
  );

  return {
    encryptedData: new Uint8Array(encrypted),
    iv,
  };
};

// Decrypt a single chunk with its specific IV
const decryptChunk = async (
  encryptedChunk: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array,
): Promise<Uint8Array> => {
  const ivBuffer = toArrayBuffer(iv);
  const chunkBuffer = toArrayBuffer(encryptedChunk);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer },
    key,
    chunkBuffer,
  );

  return new Uint8Array(decrypted);
};

// Helper function to read file chunk using File.slice (never loads entire file)
const readFileChunk = async (
  file: File,
  start: number,
  end: number,
): Promise<Uint8Array> => {
  const chunkBlob = file.slice(start, end);
  const chunkBuffer = await chunkBlob.arrayBuffer();
  return new Uint8Array(chunkBuffer);
};

// Encrypt file with proper header and chunk table - CHUNK-BASED PROCESSING
const encryptFile = async (
  file: File,
  password: string,
  onProgress?: (progress: number) => void,
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void,
): Promise<Blob> => {
  const salt = getRandomBytes(32);
  const key = await deriveKey(password, salt);

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const chunks: {
    encryptedData: Uint8Array;
    iv: Uint8Array;
    originalLength: number;
  }[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    
    const chunk = await readFileChunk(file, start, end);
    const originalLength = chunk.length;

    const { encryptedData, iv } = await encryptChunk(chunk, key);
    chunks.push({ encryptedData, iv, originalLength });

    if (onProgress) {
      onProgress(((i + 1) / totalChunks) * 100);
    }
    if (onChunkComplete) {
      onChunkComplete(i + 1, totalChunks);
    }
  }

  let dataOffset = 0;
  const chunkMetadata: ChunkMetadata[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (!chunk) continue;
    chunkMetadata.push({
      index: i,
      offset: dataOffset,
      length: chunk.originalLength,
      encryptedLength: chunk.encryptedData.length,
      iv: arrayBufferToBase64(toArrayBuffer(chunk.iv)),
    });
    dataOffset += chunk.encryptedData.length;
  }

  const header: EncryptedFileHeader = {
    magic: MAGIC_IDENTIFIER,
    version: CURRENT_VERSION,
    originalName: file.name,
    originalType: file.type || "application/octet-stream",
    originalSize: file.size,
    createdAt: Date.now(),
    chunkSize: CHUNK_SIZE,
    totalChunks: chunks.length,
    salt: arrayBufferToBase64(toArrayBuffer(salt)),
    chunks: chunkMetadata,
  };

  const headerJson = JSON.stringify(header);
  const headerBytes = new TextEncoder().encode(headerJson);
  const headerLength = headerBytes.length;

  const headerLengthBuffer = new Uint8Array(4);
  new DataView(headerLengthBuffer.buffer).setUint32(0, headerLength, false);

  let totalEncryptedSize = 0;
  for (const chunk of chunks) {
    totalEncryptedSize += chunk.encryptedData.length;
  }

  const result = new Uint8Array(4 + headerLength + totalEncryptedSize);
  let writeOffset = 0;

  result.set(headerLengthBuffer, writeOffset);
  writeOffset += 4;

  result.set(headerBytes, writeOffset);
  writeOffset += headerLength;

  for (const chunk of chunks) {
    result.set(chunk.encryptedData, writeOffset);
    writeOffset += chunk.encryptedData.length;
  }

  return new Blob([result], { type: "application/x-easymytools-encrypted" });
};

// Decrypt file with robust header parsing - CHUNK-BASED PROCESSING
const decryptFile = async (
  file: File,
  password: string,
  onProgress?: (progress: number) => void,
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void,
): Promise<{ blob: Blob; originalName: string; originalType: string }> => {
  const headerLengthBuffer = await readFileChunk(file, 0, 4);
  
  if (headerLengthBuffer.length < 4) {
    throw new Error("File too small. Corrupted or invalid encrypted file.");
  }

  const headerLength = new DataView(headerLengthBuffer.buffer).getUint32(0, false);

  if (headerLength <= 0 || headerLength > file.size - 4) {
    throw new Error("Invalid header length. File may be corrupted.");
  }

  const headerBytes = await readFileChunk(file, 4, 4 + headerLength);
  const headerJson = new TextDecoder().decode(headerBytes);

  let header: EncryptedFileHeader;
  try {
    header = JSON.parse(headerJson);
  } catch (err) {
    throw new Error("Invalid header format. File may be corrupted.");
  }

  if (header.magic !== MAGIC_IDENTIFIER) {
    throw new Error("Invalid file format. Not an EaseMyTools encrypted file.");
  }

  if (header.version !== CURRENT_VERSION) {
    throw new Error(
      `Unsupported encryption version: ${header.version}. Expected version: ${CURRENT_VERSION}`,
    );
  }

  if (!header.salt || !header.chunks || !Array.isArray(header.chunks)) {
    throw new Error("Invalid header data. Missing required fields.");
  }

  const saltBuffer = base64ToArrayBuffer(header.salt);
  const salt = new Uint8Array(saltBuffer);

  const key = await deriveKey(password, salt);

  const encryptedDataStart = 4 + headerLength;
  
  const decryptedChunks: Uint8Array[] = [];

  for (let i = 0; i < header.chunks.length; i++) {
    const chunkMeta = header.chunks[i];
    if (!chunkMeta) {
      throw new Error(
        `Missing chunk metadata for chunk ${i}. File may be corrupted.`,
      );
    }

    const chunkStart = encryptedDataStart + chunkMeta.offset;
    const chunkEnd = chunkStart + chunkMeta.encryptedLength;

    if (chunkEnd > file.size) {
      throw new Error(
        `Chunk ${i} extends beyond file bounds. File may be corrupted.`,
      );
    }

    const encryptedChunk = await readFileChunk(file, chunkStart, chunkEnd);

    const ivBuffer = base64ToArrayBuffer(chunkMeta.iv);
    const iv = new Uint8Array(ivBuffer);

    try {
      const decryptedChunk = await decryptChunk(encryptedChunk, key, iv);

      if (decryptedChunk.length !== chunkMeta.length) {
        console.warn(
          `Chunk ${i} size mismatch: expected ${chunkMeta.length}, got ${decryptedChunk.length}`,
        );
      }

      decryptedChunks.push(decryptedChunk);
    } catch (err) {
      throw new Error(
        `Failed to decrypt chunk ${i}. Incorrect password or corrupted file.`,
      );
    }

    if (onProgress) {
      onProgress(((i + 1) / header.chunks.length) * 100);
    }
    if (onChunkComplete) {
      onChunkComplete(i + 1, header.chunks.length);
    }
  }

  const totalLength = decryptedChunks.reduce(
    (sum, chunk) => sum + chunk.length,
    0,
  );
  const reconstructedData = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of decryptedChunks) {
    reconstructedData.set(chunk, offset);
    offset += chunk.length;
  }

  if (reconstructedData.length !== header.originalSize) {
    console.warn(
      `Final size mismatch: expected ${header.originalSize}, got ${reconstructedData.length}`,
    );
  }

  return {
    blob: new Blob([reconstructedData], { type: header.originalType }),
    originalName: header.originalName,
    originalType: header.originalType,
  };
};

// Helper function to generate unique file identifier
const getFileIdentifier = (file: File): string => {
  return `${file.name}|${file.size}|${file.lastModified}`;
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FileEncryptor = () => {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<EncryptionProgress>({
    current: 0,
    total: 0,
    currentFile: "",
    estimatedTimeRemaining: 0,
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [encryptionDetails, setEncryptionDetails] = useState<{
    algorithm: string;
    keyDerivation: string;
    iterations: number;
    chunkSize: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch = mode === "decrypt" || password === confirmPassword;
  
  // Determine if UI sections should be visible
  const hasValidFiles = files.length > 0;
  const canProcess =
    hasValidFiles &&
    password.length > 0 &&
    (mode === "decrypt" || passwordsMatch) &&
    !isProcessing;

  // Track existing file identifiers to prevent duplicates
  const existingFileIdentifiers = React.useMemo(() => {
    const identifiers = new Set<string>();
    files.forEach(file => {
      identifiers.add(getFileIdentifier(file.file));
    });
    return identifiers;
  }, [files]);

  const handleFiles = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const newFiles: FileItem[] = [];
    const errors: string[] = [];
    const currentIdentifiers = new Set(existingFileIdentifiers);

    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File exceeds 100MB limit (${formatFileSize(file.size)})`);
        continue;
      }

      const fileId = getFileIdentifier(file);
      if (currentIdentifiers.has(fileId)) {
        errors.push(`${file.name}: Duplicate file detected (same name, size, and modification time)`);
        continue;
      }

      currentIdentifiers.add(fileId);
      
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        originalName: file.name,
        originalType: file.type,
        size: file.size,
        status: "pending",
        progress: 0,
      });
    }

    if (errors.length > 0) {
      setError(`Skipped ${errors.length} file(s):\n${errors.join('\n')}`);
      setTimeout(() => setError(""), 8000);
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      setError("");
    } else if (errors.length > 0 && newFiles.length === 0) {
      setError(`No valid files to process. ${errors.length} file(s) were rejected.`);
    }
  }, [existingFileIdentifiers]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError("");
    setSuccess("");
    setEncryptionDetails(null);
    // Reset password when files are cleared
    setPassword("");
    setConfirmPassword("");
  }, []);

  const handleGeneratePassword = useCallback(() => {
    const newPassword = generateSecurePassword();
    setPassword(newPassword);
    if (mode === "encrypt") {
      setConfirmPassword(newPassword);
    }
  }, [mode]);

  const copyFileInfo = useCallback((result: ProcessResult) => {
    const info = `File: ${result.originalName}
Type: ${result.type}
Original Size: ${formatFileSize(result.originalSize)}
Processed Size: ${formatFileSize(result.processedSize)}
Status: ${result.mode === "encrypt" ? "Encrypted" : "Decrypted"}
Time: ${result.timestamp.toLocaleString()}`;
    navigator.clipboard.writeText(info);
    setSuccess("File information copied to clipboard");
    setTimeout(() => setSuccess(""), 3000);
  }, []);

  const downloadResult = useCallback((result: ProcessResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.processedName;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess(`Download started: ${result.processedName}`);
    setTimeout(() => setSuccess(""), 3000);
  }, []);

  const clearResult = useCallback((id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearAllResults = useCallback(() => {
    setResults([]);
  }, []);

  const processFiles = useCallback(async () => {
    if (!canProcess) return;

    setIsProcessing(true);
    setError("");
    setSuccess("");
    setEncryptionDetails({
      algorithm: "AES-256-GCM",
      keyDerivation: "PBKDF2",
      iterations: PBKDF2_ITERATIONS,
      chunkSize: "1 MB",
    });

    const controller = new AbortController();
    setAbortController(controller);

    try {
      for (let i = 0; i < files.length; i++) {
        if (controller.signal.aborted) break;

        const fileItem = files[i];
        if (!fileItem) continue;

        const fileStartTime = Date.now();

        setProgress({
          current: i + 1,
          total: files.length,
          currentFile: fileItem.originalName,
          estimatedTimeRemaining: 0,
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "processing", progress: 0 }
              : f,
          ),
        );

        try {
          let resultBlob: Blob;
          let processedName: string;

          if (mode === "encrypt") {
            resultBlob = await encryptFile(
              fileItem.file,
              password,
              (progress) => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileItem.id ? { ...f, progress } : f,
                  ),
                );
              },
              (current, total) => {
                const elapsed = Date.now() - fileStartTime;
                const estimatedTotal = (elapsed / current) * total;
                const remaining = Math.max(0, estimatedTotal - elapsed);

                setProgress((prev) => ({
                  ...prev,
                  estimatedTimeRemaining: remaining / 1000,
                }));
              },
            );
            processedName = `${fileItem.originalName}.encrypted`;
          } else {
            const decrypted = await decryptFile(
              fileItem.file,
              password,
              (progress) => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileItem.id ? { ...f, progress } : f,
                  ),
                );
              },
              (current, total) => {
                const elapsed = Date.now() - fileStartTime;
                const estimatedTotal = (elapsed / current) * total;
                const remaining = Math.max(0, estimatedTotal - elapsed);

                setProgress((prev) => ({
                  ...prev,
                  estimatedTimeRemaining: remaining / 1000,
                }));
              },
            );
            resultBlob = decrypted.blob;
            processedName = decrypted.originalName;
          }

          const result: ProcessResult = {
            id: fileItem.id,
            originalName: fileItem.originalName,
            processedName,
            originalSize: fileItem.size,
            processedSize: resultBlob.size,
            type: fileItem.originalType,
            blob: resultBlob,
            timestamp: new Date(),
            mode,
          };

          setResults((prev) => [...prev, result]);

          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    status: "completed",
                    result: resultBlob,
                    encryptedSize: resultBlob.size,
                  }
                : f,
            ),
          );

          setSuccess(
            `${mode === "encrypt" ? "Encrypted" : "Decrypted"} successfully: ${fileItem.originalName}`,
          );
          setTimeout(() => setSuccess(""), 5000);
        } catch (err) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    status: "error",
                    error:
                      err instanceof Error ? err.message : "Processing failed",
                  }
                : f,
            ),
          );
          setError(`Failed to ${mode}: ${fileItem.originalName}`);
          setTimeout(() => setError(""), 5000);
        }
      }

      if (!controller.signal.aborted) {
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
      setAbortController(null);
      setProgress({
        current: 0,
        total: 0,
        currentFile: "",
        estimatedTimeRemaining: 0,
      });
    }
  }, [canProcess, files, mode, password]);

  const abortProcessing = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setIsProcessing(false);
      setError("Operation cancelled by user");
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "processing"
            ? { ...f, status: "pending", progress: 0 }
            : f,
        ),
      );
    }
  }, [abortController]);

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Mode Selector - Always Visible */}
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${mode === "encrypt" ? styles.active : ""}`}
            onClick={() => {
              setMode("encrypt");
              clearFiles();
              setResults([]);
              setPassword("");
              setConfirmPassword("");
            }}
            aria-label="Switch to encrypt mode"
          >
            <span aria-hidden="true">🔒</span>
            Encrypt Files
          </button>
          <button
            className={`${styles.modeBtn} ${mode === "decrypt" ? styles.active : ""}`}
            onClick={() => {
              setMode("decrypt");
              clearFiles();
              setResults([]);
              setPassword("");
              setConfirmPassword("");
            }}
            aria-label="Switch to decrypt mode"
          >
            <span aria-hidden="true">🔓</span>
            Decrypt Files
          </button>
        </div>

        {/* File Upload Area - Always Visible */}
        <div
          className={`${styles.dropZone} ${isProcessing ? styles.disabled : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="File upload area"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            style={{ display: "none" }}
            disabled={isProcessing}
            aria-label="File input"
          />
          <div className={styles.dropContent}>
            <span className={styles.dropIcon} aria-hidden="true">
              📁
            </span>
            <p>Drag & drop files here or click to browse</p>
            <small>
              Supports any file type - Images, PDFs, Documents, Videos, Audio,
              ZIP, etc.
            </small>
            <small>Maximum individual file size: 100MB</small>
          </div>
        </div>

        {/* File List - Shown only when files exist */}
        {hasValidFiles && (
          <div className={styles.fileList}>
            <div className={styles.fileListHeader}>
              <h3>Selected Files ({files.length})</h3>
              {!isProcessing && (
                <button
                  onClick={clearFiles}
                  className={styles.clearBtn}
                  aria-label="Clear all files"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className={styles.fileGrid}>
              {files.map((file) => (
                <div key={file.id} className={styles.fileCard}>
                  <div className={styles.fileIcon} aria-hidden="true">
                    {file.originalType.startsWith("image/") && "🖼️"}
                    {file.originalType === "application/pdf" && "📄"}
                    {file.originalType.includes("word") && "📝"}
                    {file.originalType.includes("zip") && "📦"}
                    {file.originalType.startsWith("video/") && "🎥"}
                    {file.originalType.startsWith("audio/") && "🎵"}
                    {!file.originalType && "📁"}
                  </div>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName} title={file.originalName}>
                      {file.originalName}
                    </div>
                    <div className={styles.fileMeta}>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    {file.status === "processing" && (
                      <div className={styles.fileProgress}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${file.progress}%` }}
                            role="progressbar"
                            aria-valuenow={file.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <span className={styles.progressText}>
                          {Math.round(file.progress)}%
                        </span>
                      </div>
                    )}
                    {file.status === "error" && (
                      <div className={styles.fileError}>{file.error}</div>
                    )}
                  </div>
                  {!isProcessing && file.status === "pending" && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className={styles.removeBtn}
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password Section - Shown only when files exist */}
        {hasValidFiles && (
          <div className={`${styles.passwordSection} ${styles.slideIn}`}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {mode === "encrypt"
                  ? "Encryption Password"
                  : "Decryption Password"}
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password..."
                  className={styles.passwordInput}
                  disabled={isProcessing}
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
                {mode === "encrypt" && (
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className={styles.generateBtn}
                    aria-label="Generate secure password"
                  >
                    🔄
                  </button>
                )}
              </div>
              {mode === "encrypt" && password && (
                <div className={styles.strengthMeter}>
                  <div
                    className={styles.strengthBar}
                    style={{
                      width: `${(passwordStrength.score / 7) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                    role="progressbar"
                    aria-valuenow={passwordStrength.score}
                    aria-valuemin={0}
                    aria-valuemax={7}
                  />
                  <span
                    className={styles.strengthLabel}
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              {mode === "encrypt" && (
                <div className={styles.passwordRequirements}>
                  <small>Password must contain:</small>
                  <ul>
                    <li>✓ At least 8 characters (12+ recommended)</li>
                    <li>✓ Uppercase and lowercase letters</li>
                    <li>✓ Numbers and special characters</li>
                  </ul>
                </div>
              )}
            </div>

            {mode === "encrypt" && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password..."
                  className={styles.passwordInput}
                  disabled={isProcessing}
                  aria-label="Confirm password"
                />
                {confirmPassword && !passwordsMatch && (
                  <div className={styles.errorHint} role="alert">
                    Passwords do not match
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Encryption Details Panel - Shown only when files exist and in encrypt mode */}
        {hasValidFiles && encryptionDetails && mode === "encrypt" && (
          <div className={`${styles.detailsPanel} ${styles.slideIn}`}>
            <h4>Encryption Details</h4>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span>Algorithm:</span>
                <strong>{encryptionDetails.algorithm}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Key Derivation:</span>
                <strong>{encryptionDetails.keyDerivation}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Iterations:</span>
                <strong>{encryptionDetails.iterations.toLocaleString()}</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Chunk Size:</span>
                <strong>{encryptionDetails.chunkSize}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Progress Overview - Shown during processing */}
        {isProcessing && progress.total > 0 && (
          <div className={styles.progressOverview}>
            <div className={styles.progressHeader}>
              <span>Processing: {progress.currentFile}</span>
              <span>
                {progress.current} of {progress.total} files
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
                role="progressbar"
                aria-valuenow={(progress.current / progress.total) * 100}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            {progress.estimatedTimeRemaining > 0 && (
              <div className={styles.estimateInfo}>
                Estimated time remaining:{" "}
                {Math.ceil(progress.estimatedTimeRemaining)} seconds
              </div>
            )}
            <button
              onClick={abortProcessing}
              className={styles.abortBtn}
              aria-label="Cancel operation"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Action Buttons - Shown only when files exist and not processing */}
        {hasValidFiles && !isProcessing && (
          <div className={styles.actionBar}>
            <button
              onClick={processFiles}
              disabled={!canProcess}
              className={styles.primaryBtn}
              aria-label={
                mode === "encrypt" ? "Encrypt files" : "Decrypt files"
              }
            >
              {mode === "encrypt" ? "🔒 Encrypt Files" : "🔓 Decrypt Files"}
            </button>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <h3>
                {mode === "encrypt" ? "Encrypted Files" : "Decrypted Files"} (
                {results.length})
              </h3>
              <button
                onClick={clearAllResults}
                className={styles.clearResultsBtn}
              >
                Clear All
              </button>
            </div>
            <div className={styles.resultsGrid}>
              {results.map((result) => (
                <div key={result.id} className={styles.resultCard}>
                  <div className={styles.resultIcon} aria-hidden="true">
                    {mode === "encrypt" ? "🔒" : "🔓"}
                  </div>
                  <div className={styles.resultInfo}>
                    <div
                      className={styles.resultName}
                      title={result.processedName}
                    >
                      {result.processedName}
                    </div>
                    <div className={styles.resultDetails}>
                      <div className={styles.resultDetail}>
                        <span>Original:</span>
                        <strong>{formatFileSize(result.originalSize)}</strong>
                      </div>
                      <div className={styles.resultDetail}>
                        <span>Processed:</span>
                        <strong>{formatFileSize(result.processedSize)}</strong>
                      </div>
                      <div className={styles.resultDetail}>
                        <span>Type:</span>
                        <strong>{result.type || "Unknown"}</strong>
                      </div>
                      <div className={styles.resultDetail}>
                        <span>Time:</span>
                        <strong>{result.timestamp.toLocaleTimeString()}</strong>
                      </div>
                    </div>
                  </div>
                  <div className={styles.resultActions}>
                    <button
                      onClick={() => downloadResult(result)}
                      className={styles.downloadResultBtn}
                      aria-label="Download file"
                    >
                      💾 Download
                    </button>
                    <button
                      onClick={() => copyFileInfo(result)}
                      className={styles.copyResultBtn}
                      aria-label="Copy file information"
                    >
                      📋 Info
                    </button>
                    <button
                      onClick={() => clearResult(result.id)}
                      className={styles.clearResultBtn}
                      aria-label="Remove from list"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className={styles.errorMessage} role="alert">
            <span aria-hidden="true">⚠️</span>
            <span style={{ whiteSpace: 'pre-line' }}>{error}</span>
            <button
              onClick={() => setError("")}
              aria-label="Close error message"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className={styles.successMessage} role="status">
            <span aria-hidden="true">✅</span>
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              aria-label="Close success message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Info Cards - Always Visible */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon} aria-hidden="true">
              🔐
            </div>
            <div className={styles.infoContent}>
              <h4>AES-256-GCM Encryption</h4>
              <p>
                Military-grade encryption with unique IV per chunk and
                authentication tags.
              </p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon} aria-hidden="true">
              💪
            </div>
            <div className={styles.infoContent}>
              <h4>PBKDF2 Key Derivation</h4>
              <p>
                {PBKDF2_ITERATIONS.toLocaleString()} iterations of PBKDF2 with random salt to prevent
                brute-force attacks.
              </p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon} aria-hidden="true">
              🔄
            </div>
            <div className={styles.infoContent}>
              <h4>Client-Side Processing</h4>
              <p>
                Your files never leave your device. Everything happens locally
                in your browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEncryptor;