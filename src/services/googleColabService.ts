export interface ColabAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  progress?: number;
}

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
  model: string;
  references?: {
    face?: string;
    product?: string;
    environment?: string;
    pose?: string;
  };
}

export interface InpaintingRequest {
  image: string;
  mask: string;
  prompt: string;
  denoisingStrength: number;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
}

class GoogleColabService {
  private baseUrl: string = '';
  private authToken?: string;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const savedData = localStorage.getItem('aiImageGenApp');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.settings?.colab) {
          this.baseUrl = parsed.settings.colab.apiEndpoint || '';
          this.authToken = parsed.settings.colab.authToken;
        }
      } catch (error) {
        console.error('Failed to load Colab settings:', error);
      }
    }
  }

  updateSettings(apiEndpoint: string, authToken?: string) {
    this.baseUrl = apiEndpoint;
    this.authToken = authToken;
  }

  private async makeRequest(endpoint: string, data: any): Promise<ColabAPIResponse> {
    if (!this.baseUrl) {
      throw new Error('Google Colab API endpoint not configured');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Colab API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async testConnection(): Promise<ColabAPIResponse> {
    try {
      const response = await this.makeRequest('/health', {});
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Connection test failed'
      };
    }
  }

  async generateImage(request: GenerationRequest): Promise<ColabAPIResponse> {
    try {
      const response = await this.makeRequest('/generate', {
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        width: request.width,
        height: request.height,
        num_inference_steps: request.steps,
        guidance_scale: request.cfgScale,
        seed: request.seed,
        model: request.model,
        controlnet_images: request.references ? {
          face: request.references.face,
          product: request.references.product,
          environment: request.references.environment,
          pose: request.references.pose
        } : undefined
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Image generation failed'
      };
    }
  }

  async inpaintImage(request: InpaintingRequest): Promise<ColabAPIResponse> {
    try {
      const response = await this.makeRequest('/inpaint', {
        image: request.image,
        mask: request.mask,
        prompt: request.prompt,
        strength: request.denoisingStrength,
        width: request.width,
        height: request.height,
        num_inference_steps: request.steps,
        guidance_scale: request.cfgScale
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Inpainting failed'
      };
    }
  }

  async getGenerationStatus(taskId: string): Promise<ColabAPIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${taskId}`, {
        headers: this.authToken ? {
          'Authorization': `Bearer ${this.authToken}`
        } : {}
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get generation status'
      };
    }
  }

  async cancelGeneration(taskId: string): Promise<ColabAPIResponse> {
    try {
      const response = await this.makeRequest('/cancel', { task_id: taskId });
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to cancel generation'
      };
    }
  }

  async getAvailableModels(): Promise<ColabAPIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.authToken ? {
          'Authorization': `Bearer ${this.authToken}`
        } : {}
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get available models'
      };
    }
  }

  async uploadReference(file: File, category: string): Promise<ColabAPIResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const headers: Record<string, string> = {};
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseUrl}/upload-reference`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to upload reference'
      };
    }
  }

  // Utility method to create a mock response for development
  createMockResponse(imageData: string): ColabAPIResponse {
    return {
      success: true,
      data: {
        image: imageData,
        seed: Math.floor(Math.random() * 1000000),
        execution_time: 2.3
      }
    };
  }

  // Method to simulate generation progress
  async simulateProgress(
    onProgress: (progress: number) => void,
    duration: number = 3000
  ): Promise<void> {
    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      const progress = (i / steps) * 100;
      onProgress(Math.min(progress, 95)); // Cap at 95% until completion
    }
  }
}

// Export singleton instance
export const colabService = new GoogleColabService();

// Export types
export type { GenerationRequest, InpaintingRequest };
export default GoogleColabService;