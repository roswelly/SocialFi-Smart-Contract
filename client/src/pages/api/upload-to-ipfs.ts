//moved from chainsafe to uploadthing

import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import { UTApi, UTFile } from 'uploadthing/server'
import crypto from 'crypto'
import path from 'path'
import sharp from 'sharp'

export const config = {
  api: {
    bodyParser: false,
  },
}

/**
 * File Deduplication Cache System
 * ------------------------------
 * A simple file deduplication system that prevents uploading the same file multiple times.
 * 
 * Why we need this:
 * 1. Avoid unnecessary uploads of the same file, reducing bandwidth usage
 * 2. Prevent duplicate files on UploadThing (since they have refuse to implement this them selves), plus saving storage space
 * 3. Return cached URLs immediately for previously uploaded files
 * 
 * How it works:
 * - It calculate a SHA-256 hash of each file's content before uploading
 * - It store the hash and corresponding URL in a JSON file on disk
 * - Before uploading, it check if the file hash already exists in our cache
 * - If found, it return the cached URL without uploading again
 * - If not found, it upload the file normally and add its hash to our cache
 * 
 * The cache persists across server restarts since it's stored on disk.
 * This is a basic implementation - in a high-traffic production app, i will suggest using a database instead of a JSON file.
 */

// File path for storing the hash cache
const CACHE_FILE_PATH = path.join(process.cwd(), 'file-hash-cache.json');

// Load the file hash cache from disk or create a new one
let fileHashCache: Record<string, string> = {};

// Initialize the cache from the JSON file if it exists
try {
  if (fs.existsSync(CACHE_FILE_PATH)) {
    const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
    fileHashCache = JSON.parse(cacheData);
    console.log(`Loaded ${Object.keys(fileHashCache).length} cached file hashes`);
  } else {
    console.log('No existing file hash cache found, creating a new one');
    // Create an empty cache file
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify({}), 'utf8');
  }
} catch (error) {
  console.error('Error loading file hash cache:', error);
  // If there's an error, start with an empty cache
  fileHashCache = {};
}

// Function to save the cache to disk
function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(fileHashCache, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving file hash cache:', error);
  }
}

// Function to calculate file hash
function calculateFileHash(buffer: Buffer): string {
  // Convert buffer to string to avoid type issues
  const content = buffer.toString('binary');
  const hash = crypto.createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

// Function to get file extension
function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Image compression function
 * Compresses images larger than 500KB to be 300KB or less
 * @param buffer Original file buffer
 * @param mimetype File mimetype
 * @returns Promise with compressed buffer
 */
async function compressImageIfNeeded(buffer: Buffer, mimetype: string): Promise<Buffer> {
  // Only compress if it's an image
  if (!mimetype.startsWith('image/')) {
    return buffer;
  }

  // Check if file size is over 500KB (500 * 1024 bytes)
  if (buffer.length <= 500 * 1024) {
    return buffer;
  }

  console.log(`Compressing image of size ${(buffer.length / 1024).toFixed(2)}KB (type: ${mimetype})`);

  try {
    // Create a sharp instance from the buffer
    const image = sharp(buffer);
    
    // Get image metadata to make better compression decisions
    const metadata = await image.metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 1200;
    const format = metadata.format;
    
    console.log(`Image dimensions: ${width}x${height}, format: ${format}`);
    
    // Calculate a target size that maintains aspect ratio but limits dimensions
    // For larger images, we'll scale down more to save space
    let targetWidth = width;
    let targetHeight = height;
    
    // Only resize if the image is large
    if (width > 1500 || height > 1500) {
      const aspectRatio = width / height;
      if (width > height) {
        targetWidth = Math.min(width, 1500);
        targetHeight = Math.round(targetWidth / aspectRatio);
      } else {
        targetHeight = Math.min(height, 1500);
        targetWidth = Math.round(targetHeight * aspectRatio);
      }
    }
    
    let compressedBuffer: Buffer;
    
    // Determine the best format to use based on the input format
    // We'll preserve the original format when possible
    switch (mimetype) {
      case 'image/png':
        // For PNGs, use lossless compression
        compressedBuffer = await image
          .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
          .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true })
          .toBuffer();
        
        // If PNG is still too large, try WebP which has better compression
        if (compressedBuffer.length > 400 * 1024) {
          compressedBuffer = await image
            .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80, lossless: false })
            .toBuffer();
        }
        break;
        
      case 'image/webp':
        // For WebP, try to maintain the format with good quality
        compressedBuffer = await image
          .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, nearLossless: true })
          .toBuffer();
        
        // If still too large, use lossy WebP with lower quality
        if (compressedBuffer.length > 300 * 1024) {
          compressedBuffer = await image
            .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 70, nearLossless: false })
            .toBuffer();
        }
        break;
        
      case 'image/gif':
        // For GIFs, convert to WebP which handles animation better than JPEG
        compressedBuffer = await image
          .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        break;
        
      case 'image/jpeg':
      case 'image/jpg':
      default:
        // For JPEGs and other formats, start with high quality
        let quality = 85;
        compressedBuffer = await image
          .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality, mozjpeg: true }) // mozjpeg provides better compression
          .toBuffer();
        
        // If still too large, try with slightly lower quality but preserve dimensions
        if (compressedBuffer.length > 300 * 1024) {
          quality = 75;
          compressedBuffer = await image
            .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();
        }
        
        // If still too large, reduce quality further but maintain reasonable dimensions
        if (compressedBuffer.length > 300 * 1024) {
          quality = 65;
          compressedBuffer = await image
            .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();
        }
        break;
    }
    
    // If we've tried our best but the image is still too large, make one final attempt
    // with more aggressive settings, but only if it's significantly over our target
    if (compressedBuffer.length > 400 * 1024) {
      // WebP is our best option for final compression while maintaining reasonable quality
      compressedBuffer = await image
        .resize(Math.min(targetWidth, 1200), Math.min(targetHeight, 1200), { fit: 'inside' })
        .webp({ quality: 70, alphaQuality: 70 })
        .toBuffer();
    }
    
    console.log(`Compressed image from ${(buffer.length / 1024).toFixed(2)}KB to ${(compressedBuffer.length / 1024).toFixed(2)}KB`);
    
    // If compression actually made the file larger (rare, but possible), return original
    if (compressedBuffer.length >= buffer.length) {
      console.log('Compression resulted in larger file, using original');
      return buffer;
    }
    
    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original buffer if compression fails
    return buffer;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = formidable();

  try {
    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const fileContent = await fs.promises.readFile(file.filepath);
    
    // Compress image if needed (for files > 500KB)
    const processedFileContent = await compressImageIfNeeded(
      fileContent, 
      file.mimetype || 'application/octet-stream'
    );
    
    // Calculate file hash for deduplication (using the processed content)
    const fileHash = calculateFileHash(processedFileContent);
    const fileExt = getFileExtension(file.originalFilename || '');
    const dedupeKey = `${fileHash}${fileExt}`;
    
    // Check if this file has been uploaded before
    if (fileHashCache[dedupeKey]) {
      console.log('File already exists, returning cached URL:', fileHashCache[dedupeKey]);
      return res.status(200).json({ url: fileHashCache[dedupeKey] });
    }
    
    // Initialize UploadThing API client
    const uploadThingToken = process.env.UPLOADTHING_TOKEN;
    
    if (!uploadThingToken) {
      console.error('Missing UploadThing token');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const utapi = new UTApi({ token: uploadThingToken });
    
    // Create a UTFile object from the processed file content
    const fileName = file.originalFilename || 'unnamed_file';
    const fileBlob = new Blob([processedFileContent], { type: file.mimetype || 'application/octet-stream' });
    const utFile = new UTFile(
      [fileBlob], 
      fileName,
      { type: file.mimetype || 'application/octet-stream' }
    );
    
    // Upload file to UploadThing
    const uploadResponse = await utapi.uploadFiles([utFile]);
    
    if (uploadResponse && uploadResponse.length > 0) {
      const fileData = uploadResponse[0];
      
      if (fileData.data && fileData.data.ufsUrl) {
        // Cache the file hash and URL for future requests
        fileHashCache[dedupeKey] = fileData.data.ufsUrl;
        saveCache(); // Save the updated cache to the JSON file
        
        // Only use ufsUrl to avoid deprecation warnings
        res.status(200).json({ url: fileData.data.ufsUrl })
      } else if (fileData.error) {
        console.error('UploadThing error:', fileData.error);
        res.status(500).json({ error: fileData.error.message || 'Failed to upload file' })
      } else {
        res.status(500).json({ error: 'No URL found in the response' })
      }
    } else {
      res.status(500).json({ error: 'No response from UploadThing' })
    }

  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ error: 'Failed to upload file' })
  }
}