export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataURL = canvas.toDataURL('image/jpeg', quality);
      resolve(dataURL);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function createThumbnail(
  imageDataURL: string,
  width: number = 200,
  height: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;

      // Calculate scaling to cover the entire thumbnail area
      const scale = Math.max(width / img.width, height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Center the image
      const x = (width - scaledWidth) / 2;
      const y = (height - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      const thumbnailDataURL = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailDataURL);
    };

    img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
    img.src = imageDataURL;
  });
}

export function addWatermark(
  imageDataURL: string,
  watermarkText: string,
  options: {
    fontSize?: number;
    color?: string;
    opacity?: number;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const {
      fontSize = 20,
      color = 'white',
      opacity = 0.7,
      position = 'bottom-right'
    } = options;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Set watermark style
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;

      // Measure text
      const textMetrics = ctx.measureText(watermarkText);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      // Calculate position
      let x: number, y: number;
      const padding = 20;

      switch (position) {
        case 'bottom-right':
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding;
          break;
        case 'top-right':
          x = canvas.width - textWidth - padding;
          y = textHeight + padding;
          break;
        case 'top-left':
          x = padding;
          y = textHeight + padding;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = canvas.height / 2;
          break;
        default:
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
      }

      // Draw watermark
      ctx.fillText(watermarkText, x, y);

      const watermarkedDataURL = canvas.toDataURL('image/png');
      resolve(watermarkedDataURL);
    };

    img.onerror = () => reject(new Error('Failed to load image for watermark'));
    img.src = imageDataURL;
  });
}

export function extractMetadata(file: File): Promise<{
  name: string;
  size: number;
  type: string;
  lastModified: number;
  width?: number;
  height?: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      // If it's not an image, return basic metadata
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    };

    img.src = URL.createObjectURL(file);
  });
}

export function compressImage(
  imageDataURL: string,
  quality: number = 0.8,
  maxSizeKB?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      let currentQuality = quality;
      let compressed = canvas.toDataURL('image/jpeg', currentQuality);

      // If max size is specified, reduce quality until under limit
      if (maxSizeKB) {
        const maxSizeBytes = maxSizeKB * 1024;
        
        while (compressed.length > maxSizeBytes && currentQuality > 0.1) {
          currentQuality -= 0.1;
          compressed = canvas.toDataURL('image/jpeg', currentQuality);
        }
      }

      resolve(compressed);
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = imageDataURL;
  });
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPG, PNG, WebP'
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: 'ขนาดไฟล์เกิน 10MB'
    };
  }

  return { isValid: true };
}

export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000000);
}

export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const divisor = gcd(width, height);
  const aspectWidth = width / divisor;
  const aspectHeight = height / divisor;

  return `${aspectWidth}:${aspectHeight}`;
}

export function isValidImageDataURL(dataURL: string): boolean {
  return dataURL.startsWith('data:image/') && dataURL.includes('base64,');
}

export function createImageFromDataURL(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to create image from data URL'));
    img.src = dataURL;
  });
}