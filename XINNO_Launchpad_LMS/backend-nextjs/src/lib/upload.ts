import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

// Upload file to local storage
export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', folder);
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name.replace(/\s/g, '_')}`;
    const filepath = join(uploadDir, filename);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    await writeFile(filepath, buffer);

    // Return public URL
    return `/${folder}/${filename}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

// Get file type category
export function getFileType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';
  
  // Videos
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) {
    return 'VIDEO';
  }
  
  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
    return 'IMAGE';
  }
  
  // Documents
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    return 'DOCUMENT';
  }
  
  // Presentations
  if (['ppt', 'pptx', 'odp'].includes(ext)) {
    return 'PRESENTATION';
  }
  
  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return 'SPREADSHEET';
  }
  
  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(ext)) {
    return 'CODE';
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'ARCHIVE';
  }
  
  return 'OTHER';
}

// Validate file size (in MB)
export function validateFileSize(file: File, maxSizeMB: number = 100): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

// Validate file type
export function validateFileType(file: File, allowedTypes?: string[]): boolean {
  if (!allowedTypes || allowedTypes.length === 0) return true;
  
  const fileType = getFileType(file.name);
  return allowedTypes.includes(fileType);
}

// Parse multipart form data
export async function parseMultipartForm(request: NextRequest): Promise<{ fields: Record<string, string>, files: Record<string, File> }> {
  try {
    const formData = await request.formData();
    const fields: Record<string, string> = {};
    const files: Record<string, File> = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
      } else {
        fields[key] = value.toString();
      }
    }

    return { fields, files };
  } catch (error) {
    console.error('Error parsing multipart form:', error);
    throw new Error('Failed to parse form data');
  }
}
