export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink: string;
  parents: string[];
}

export interface UploadOptions {
  filename: string;
  folder?: string;
  description?: string;
  mimeType?: string;
}

export interface DriveAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class GoogleDriveService {
  private gapi: any = null;
  private isInitialized = false;
  private settings = {
    clientId: '',
    apiKey: '',
    discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    scopes: ['https://www.googleapis.com/auth/drive.file']
  };

  constructor() {
    this.loadSettings();
    this.initializeGAPI();
  }

  private loadSettings() {
    const savedData = localStorage.getItem('aiImageGenApp');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.settings?.googleDrive) {
          this.settings = { ...this.settings, ...parsed.settings.googleDrive };
        }
      } catch (error) {
        console.error('Failed to load Google Drive settings:', error);
      }
    }
  }

  updateSettings(clientId: string, apiKey: string) {
    this.settings.clientId = clientId;
    this.settings.apiKey = apiKey;
  }

  private async initializeGAPI(): Promise<void> {
    try {
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGAPIScript();
      }

      await new Promise((resolve) => {
        window.gapi.load('client:auth2', resolve);
      });

      await window.gapi.client.init({
        apiKey: this.settings.apiKey,
        clientId: this.settings.clientId,
        discoveryDocs: [this.settings.discoveryDoc],
        scope: this.settings.scopes.join(' ')
      });

      this.gapi = window.gapi;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      throw error;
    }
  }

  private loadGAPIScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<DriveAPIResponse> {
    try {
      if (!this.isInitialized) {
        await this.initializeGAPI();
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();

      return {
        success: true,
        data: {
          isSignedIn: true,
          user: user.getBasicProfile()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }

  async signOut(): Promise<DriveAPIResponse> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Not initialized' };
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();

      return { success: true, data: { isSignedIn: false } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      };
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      return authInstance.isSignedIn.get();
    } catch (error) {
      return false;
    }
  }

  async testConnection(): Promise<DriveAPIResponse> {
    try {
      if (!this.isInitialized) {
        await this.initializeGAPI();
      }

      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        const signInResult = await this.signIn();
        if (!signInResult.success) {
          return signInResult;
        }
      }

      // Test by getting user info
      const response = await this.gapi.client.drive.about.get({
        fields: 'user,storageQuota'
      });

      return {
        success: true,
        data: response.result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  async createFolder(name: string, parentId?: string): Promise<DriveAPIResponse> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in' };
      }

      const fileMetadata: any = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder'
      };

      if (parentId) {
        fileMetadata.parents = [parentId];
      }

      const response = await this.gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id,name,parents'
      });

      return {
        success: true,
        data: response.result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create folder'
      };
    }
  }

  async uploadFile(
    fileData: string | Blob,
    options: UploadOptions
  ): Promise<DriveAPIResponse> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in' };
      }

      // Convert data URL to blob if needed
      let blob: Blob;
      if (typeof fileData === 'string') {
        const response = await fetch(fileData);
        blob = await response.blob();
      } else {
        blob = fileData;
      }

      const fileMetadata: any = {
        name: options.filename,
        description: options.description
      };

      // Find or create folder if specified
      if (options.folder) {
        const folderId = await this.findOrCreateFolder(options.folder);
        if (folderId) {
          fileMetadata.parents = [folderId];
        }
      }

      // Use the simpler upload method for smaller files
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {
        type: 'application/json'
      }));
      form.append('file', blob);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime,webViewLink',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
          },
          body: form
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  private async findOrCreateFolder(folderPath: string): Promise<string | null> {
    try {
      const pathParts = folderPath.split('/').filter(part => part.length > 0);
      let currentParentId = 'root';

      for (const folderName of pathParts) {
        // Search for existing folder
        const searchResponse = await this.gapi.client.drive.files.list({
          q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${currentParentId}' in parents and trashed=false`,
          fields: 'files(id,name)'
        });

        if (searchResponse.result.files && searchResponse.result.files.length > 0) {
          currentParentId = searchResponse.result.files[0].id;
        } else {
          // Create folder
          const createResponse = await this.createFolder(folderName, currentParentId);
          if (createResponse.success && createResponse.data) {
            currentParentId = createResponse.data.id;
          } else {
            return null;
          }
        }
      }

      return currentParentId;
    } catch (error) {
      console.error('Failed to find or create folder:', error);
      return null;
    }
  }

  async listFiles(folderId?: string): Promise<DriveAPIResponse> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in' };
      }

      let query = "trashed=false";
      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      const response = await this.gapi.client.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents)',
        orderBy: 'modifiedTime desc'
      });

      return {
        success: true,
        data: response.result.files
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list files'
      };
    }
  }

  async deleteFile(fileId: string): Promise<DriveAPIResponse> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in' };
      }

      await this.gapi.client.drive.files.delete({
        fileId: fileId
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      };
    }
  }

  async getStorageQuota(): Promise<DriveAPIResponse> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in' };
      }

      const response = await this.gapi.client.drive.about.get({
        fields: 'storageQuota'
      });

      return {
        success: true,
        data: response.result.storageQuota
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get storage quota'
      };
    }
  }

  // Mock methods for development
  createMockUploadResponse(filename: string): DriveAPIResponse {
    return {
      success: true,
      data: {
        id: `mock_${Date.now()}`,
        name: filename,
        size: '1024000',
        createdTime: new Date().toISOString(),
        webViewLink: `https://drive.google.com/file/d/mock_${Date.now()}/view`
      }
    };
  }

  createMockStorageQuota(): DriveAPIResponse {
    return {
      success: true,
      data: {
        limit: '15000000000', // 15GB
        usage: '3200000000',  // 3.2GB
        usageInDrive: '2800000000'
      }
    };
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}

// Export singleton instance
export const driveService = new GoogleDriveService();

export default GoogleDriveService;