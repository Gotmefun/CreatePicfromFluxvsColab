export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  client?: string;
  template: ProjectTemplate;
  createdAt: Date;
  updatedAt: Date;
  imageCount: number;
  folderPath: string;
  references: Reference[];
}

export interface Reference {
  id: string;
  filename: string;
  url: string;
  category: ReferenceCategory;
  tags: string[];
  projectId: string;
  uploadedAt: Date;
}

export type ReferenceCategory = 'faces' | 'products' | 'environments' | 'poses';

export type ProjectTemplate = 'portrait' | 'product' | 'corporate' | 'creative' | 'fashion' | 'electronics';

export interface GenerationSettings {
  model: AIModel;
  steps: number;
  cfgScale: number;
  width: number;
  height: number;
  seed?: number;
  denoisingStrength?: number;
}

export type AIModel = 'stable-diffusion' | 'sdxl' | 'flux-ai';

export interface GeneratedImage {
  id: string;
  filename: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  settings: GenerationSettings;
  references: Reference[];
  projectId: string;
  createdAt: Date;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  tags: string[];
  description?: string;
}

export interface SaveOptions {
  filename: string;
  folder: string;
  tags: string[];
  description?: string;
  format: 'png' | 'jpg' | 'webp';
  includeMetadata: boolean;
  createThumbnail: boolean;
  addToGallery: boolean;
}

export interface InpaintingMask {
  canvas: HTMLCanvasElement;
  maskData: ImageData;
  brushSize: number;
  opacity: number;
}

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  discoveryDoc: string;
  scopes: string[];
}

export interface ColabConfig {
  notebookUrl: string;
  apiEndpoint: string;
  authToken?: string;
}

export interface AppSettings {
  googleDrive: GoogleDriveConfig;
  colab: ColabConfig;
  defaultModel: AIModel;
  autoSave: boolean;
  theme: 'light' | 'dark';
}