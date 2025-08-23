export interface VideoGenerationRequest {
  type: 'text-to-video' | 'image-to-video' | 'text-image-to-video';
  prompt?: string;
  image?: string; // base64 image data
  duration: number; // seconds
  fps: 24 | 30;
  resolution: '720p' | '1080p';
  style?: 'realistic' | 'anime' | 'artistic';
  seed?: number;
}

export interface VideoGenerationResponse {
  success: boolean;
  data?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    resolution: string;
    fileSize: number;
    processingTime: number;
  };
  error?: string;
  progress?: number;
  taskId?: string;
}

class Wan22Service {
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
        if (parsed.settings?.wan22) {
          this.baseUrl = parsed.settings.wan22.apiEndpoint || '';
          this.authToken = parsed.settings.wan22.authToken;
        }
      } catch (error) {
        console.error('Failed to load Wan2.2 settings:', error);
      }
    }
  }

  updateSettings(apiEndpoint: string, authToken?: string) {
    this.baseUrl = apiEndpoint;
    this.authToken = authToken;
  }

  private async makeRequest(endpoint: string, data: any): Promise<VideoGenerationResponse> {
    if (!this.baseUrl) {
      throw new Error('Wan2.2 API endpoint not configured');
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
      console.error('Wan2.2 API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const apiData = this.prepareApiData(request);
      const response = await this.makeRequest('/generate-video', apiData);
      return response;
    } catch (error) {
      // Fallback to mock generation for development
      return this.mockVideoGeneration(request);
    }
  }

  private prepareApiData(request: VideoGenerationRequest) {
    const data: any = {
      duration: request.duration,
      fps: request.fps,
      resolution: request.resolution,
      seed: request.seed
    };

    switch (request.type) {
      case 'text-to-video':
        return {
          ...data,
          task: 't2v-A14B',
          prompt: request.prompt,
          style: request.style
        };
      
      case 'image-to-video':
        return {
          ...data,
          task: 'i2v-A14B',
          image: request.image,
          style: request.style
        };
      
      case 'text-image-to-video':
        return {
          ...data,
          task: 'ti2v-5B',
          prompt: request.prompt,
          image: request.image,
          style: request.style
        };
      
      default:
        throw new Error('Invalid generation type');
    }
  }

  async getGenerationStatus(taskId: string): Promise<VideoGenerationResponse> {
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

  async cancelGeneration(taskId: string): Promise<VideoGenerationResponse> {
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

  async testConnection(): Promise<VideoGenerationResponse> {
    try {
      const testRequest: VideoGenerationRequest = {
        type: 'text-to-video',
        prompt: 'A simple test animation',
        duration: 2,
        fps: 24,
        resolution: '720p'
      };

      // Just test the connection, don't actually generate
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.authToken ? {
          'Authorization': `Bearer ${this.authToken}`
        } : {}
      });

      return {
        success: response.ok,
        error: response.ok ? undefined : 'Connection test failed'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Connection test failed'
      };
    }
  }

  // Mock video generation for development
  private async mockVideoGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    // Simulate processing time based on duration
    const processingTime = request.duration * 2000; // 2 seconds per video second
    await new Promise(resolve => setTimeout(resolve, Math.min(processingTime, 5000)));

    try {
      const mockVideo = await this.createMockVideo(request);
      const mockThumbnail = await this.createMockThumbnail(request);

      return {
        success: true,
        data: {
          videoUrl: mockVideo,
          thumbnailUrl: mockThumbnail,
          duration: request.duration,
          resolution: request.resolution,
          fileSize: request.duration * 1024 * 1024, // Estimate 1MB per second
          processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Mock video generation failed'
      };
    }
  }

  private async createMockVideo(request: VideoGenerationRequest): Promise<string> {
    // Create a simple canvas animation
    const canvas = document.createElement('canvas');
    const width = request.resolution === '1080p' ? 1920 : 1280;
    const height = request.resolution === '1080p' ? 1080 : 720;
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }

    // Create a simple animated GIF-like effect
    const frames: string[] = [];
    const frameCount = request.duration * request.fps;

    for (let i = 0; i < Math.min(frameCount, 10); i++) {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, `hsl(${(i * 36) % 360}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${((i * 36) + 60) % 360}, 70%, 40%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add text
      ctx.fillStyle = 'white';
      ctx.font = `${width / 20}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Generated Video', width / 2, height / 2);
      ctx.font = `${width / 40}px Arial`;
      ctx.fillText(`Frame ${i + 1}/${frameCount}`, width / 2, height / 2 + 60);
      
      if (request.prompt) {
        ctx.font = `${width / 50}px Arial`;
        ctx.fillText(request.prompt, width / 2, height / 2 + 100);
      }

      frames.push(canvas.toDataURL());
    }

    // For now, return the first frame as a static image
    // In a real implementation, you'd create an actual video file
    return frames[0];
  }

  private async createMockThumbnail(request: VideoGenerationRequest): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create thumbnail canvas');
    }

    // Create thumbnail
    const gradient = ctx.createLinearGradient(0, 0, 320, 180);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 320, 180);

    // Add play button
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(130, 70);
    ctx.lineTo(130, 110);
    ctx.lineTo(170, 90);
    ctx.closePath();
    ctx.fill();

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${request.type}`, 160, 40);
    ctx.font = '12px Arial';
    ctx.fillText(`${request.duration}s • ${request.resolution}`, 160, 140);

    return canvas.toDataURL();
  }

  // Utility method to get available models
  async getAvailableModels(): Promise<VideoGenerationResponse> {
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

  // Progress simulation for long video generation
  async simulateProgress(
    onProgress: (progress: number) => void,
    duration: number = 10000
  ): Promise<void> {
    const steps = 50;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      const progress = (i / steps) * 100;
      onProgress(Math.min(progress, 95)); // Cap at 95% until completion
    }
  }
}

// Export singleton instance
export const wan22Service = new Wan22Service();

// Export types
export type { VideoGenerationRequest };
export default Wan22Service;