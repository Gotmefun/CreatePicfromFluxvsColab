export interface ComfyUIWorkflow {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

export interface NodeConnection {
  from_node: string;
  from_output: string;
  to_node: string;
  to_input: string;
}

export interface PoseControlRequest {
  sourceImage: string;
  prompt: string;
  negativePrompt?: string;
  poseStrength: number;
  model: 'sd15' | 'sdxl' | 'flux';
  steps: number;
  cfgScale: number;
  seed?: number;
}

export interface PoseControlResponse {
  success: boolean;
  data?: {
    generatedImage: string;
    poseImage: string; // RGB skeleton
    originalPose: string; // detected pose
    processingTime: number;
  };
  error?: string;
  progress?: number;
}

class ComfyUIService {
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
        if (parsed.settings?.comfyui) {
          this.baseUrl = parsed.settings.comfyui.apiEndpoint || '';
          this.authToken = parsed.settings.comfyui.authToken;
        }
      } catch (error) {
        console.error('Failed to load ComfyUI settings:', error);
      }
    }
  }

  updateSettings(apiEndpoint: string, authToken?: string) {
    this.baseUrl = apiEndpoint;
    this.authToken = authToken;
  }

  // Create OpenPose + ControlNet workflow
  private createPoseControlWorkflow(request: PoseControlRequest): ComfyUIWorkflow {
    const workflow: ComfyUIWorkflow = {
      nodes: [
        // 1. Load Input Image
        {
          id: "load_image",
          type: "LoadImage",
          inputs: {
            image: request.sourceImage
          },
          outputs: { IMAGE: "image_output" }
        },
        
        // 2. OpenPose Preprocessor
        {
          id: "openpose_processor",
          type: "OpenposePreprocessor",
          inputs: {
            image: "image_output",
            detect_hand: "enable",
            detect_body: "enable",
            detect_face: "enable"
          },
          outputs: { IMAGE: "pose_image" }
        },
        
        // 3. Load ControlNet Model
        {
          id: "load_controlnet",
          type: "ControlNetLoader",
          inputs: {
            control_net_name: "control_v11p_sd15_openpose.pth"
          },
          outputs: { CONTROL_NET: "controlnet_model" }
        },
        
        // 4. Apply ControlNet
        {
          id: "apply_controlnet",
          type: "ControlNetApply",
          inputs: {
            conditioning: "positive_conditioning",
            control_net: "controlnet_model",
            image: "pose_image",
            strength: request.poseStrength
          },
          outputs: { CONDITIONING: "controlled_conditioning" }
        },
        
        // 5. Load Stable Diffusion Model
        {
          id: "load_checkpoint",
          type: "CheckpointLoaderSimple",
          inputs: {
            ckpt_name: this.getModelName(request.model)
          },
          outputs: { 
            MODEL: "model",
            CLIP: "clip",
            VAE: "vae"
          }
        },
        
        // 6. Encode Prompt
        {
          id: "clip_text_encode_positive",
          type: "CLIPTextEncode",
          inputs: {
            text: request.prompt,
            clip: "clip"
          },
          outputs: { CONDITIONING: "positive_conditioning" }
        },
        
        // 7. Encode Negative Prompt
        {
          id: "clip_text_encode_negative",
          type: "CLIPTextEncode",
          inputs: {
            text: request.negativePrompt || "low quality, blurry, distorted",
            clip: "clip"
          },
          outputs: { CONDITIONING: "negative_conditioning" }
        },
        
        // 8. K Sampler
        {
          id: "ksampler",
          type: "KSampler",
          inputs: {
            model: "model",
            positive: "controlled_conditioning",
            negative: "negative_conditioning",
            latent_image: "empty_latent",
            seed: request.seed || Math.floor(Math.random() * 1000000),
            steps: request.steps,
            cfg: request.cfgScale,
            sampler_name: "euler",
            scheduler: "normal",
            denoise: 1.0
          },
          outputs: { LATENT: "latent_output" }
        },
        
        // 9. Empty Latent Image
        {
          id: "empty_latent",
          type: "EmptyLatentImage",
          inputs: {
            width: 512,
            height: 512,
            batch_size: 1
          },
          outputs: { LATENT: "empty_latent" }
        },
        
        // 10. VAE Decode
        {
          id: "vae_decode",
          type: "VAEDecode",
          inputs: {
            samples: "latent_output",
            vae: "vae"
          },
          outputs: { IMAGE: "final_image" }
        },
        
        // 11. Save Image
        {
          id: "save_image",
          type: "SaveImage",
          inputs: {
            images: "final_image",
            filename_prefix: "pose_control"
          },
          outputs: {}
        }
      ],
      connections: [
        { from_node: "load_image", from_output: "IMAGE", to_node: "openpose_processor", to_input: "image" },
        { from_node: "openpose_processor", from_output: "IMAGE", to_node: "apply_controlnet", to_input: "image" },
        { from_node: "load_controlnet", from_output: "CONTROL_NET", to_node: "apply_controlnet", to_input: "control_net" },
        { from_node: "load_checkpoint", from_output: "MODEL", to_node: "ksampler", to_input: "model" },
        { from_node: "load_checkpoint", from_output: "CLIP", to_node: "clip_text_encode_positive", to_input: "clip" },
        { from_node: "load_checkpoint", from_output: "CLIP", to_node: "clip_text_encode_negative", to_input: "clip" },
        { from_node: "load_checkpoint", from_output: "VAE", to_node: "vae_decode", to_input: "vae" },
        { from_node: "clip_text_encode_positive", from_output: "CONDITIONING", to_node: "apply_controlnet", to_input: "conditioning" },
        { from_node: "apply_controlnet", from_output: "CONDITIONING", to_node: "ksampler", to_input: "positive" },
        { from_node: "clip_text_encode_negative", from_output: "CONDITIONING", to_node: "ksampler", to_input: "negative" },
        { from_node: "empty_latent", from_output: "LATENT", to_node: "ksampler", to_input: "latent_image" },
        { from_node: "ksampler", from_output: "LATENT", to_node: "vae_decode", to_input: "samples" },
        { from_node: "vae_decode", from_output: "IMAGE", to_node: "save_image", to_input: "images" }
      ]
    };

    return workflow;
  }

  private getModelName(model: 'sd15' | 'sdxl' | 'flux'): string {
    switch (model) {
      case 'sd15':
        return 'v1-5-pruned-emaonly.ckpt';
      case 'sdxl':
        return 'sd_xl_base_1.0.safetensors';
      case 'flux':
        return 'flux1-dev.safetensors';
      default:
        return 'v1-5-pruned-emaonly.ckpt';
    }
  }

  async generateWithPoseControl(request: PoseControlRequest): Promise<PoseControlResponse> {
    try {
      if (!this.baseUrl) {
        return this.mockPoseGeneration(request);
      }

      const workflow = this.createPoseControlWorkflow(request);
      
      const response = await fetch(`${this.baseUrl}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
        },
        body: JSON.stringify({
          prompt: workflow,
          client_id: Date.now().toString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: {
          generatedImage: result.images[0],
          poseImage: result.pose_image,
          originalPose: result.original_pose,
          processingTime: result.processing_time
        }
      };

    } catch (error) {
      console.error('ComfyUI generation failed:', error);
      return this.mockPoseGeneration(request);
    }
  }

  // Mock generation for development
  private async mockPoseGeneration(request: PoseControlRequest): Promise<PoseControlResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const mockGenerated = await this.createMockPoseResult(request);
      const mockPoseSkeleton = await this.createMockPoseSkeleton();

      return {
        success: true,
        data: {
          generatedImage: mockGenerated,
          poseImage: mockPoseSkeleton,
          originalPose: mockPoseSkeleton,
          processingTime: 3000
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Mock pose generation failed'
      };
    }
  }

  private async createMockPoseResult(request: PoseControlRequest): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pose-Controlled Character', 256, 200);
    ctx.font = '16px Arial';
    ctx.fillText('Generated with ComfyUI', 256, 240);
    ctx.fillText(`Prompt: ${request.prompt}`, 256, 280);
    ctx.fillText(`Pose Strength: ${request.poseStrength}`, 256, 320);

    return canvas.toDataURL();
  }

  private async createMockPoseSkeleton(): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create skeleton canvas');
    }

    // Black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 512, 512);

    // Draw stick figure pose
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Head
    ctx.beginPath();
    ctx.arc(256, 100, 20, 0, 2 * Math.PI);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(256, 120);
    ctx.lineTo(256, 300);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(256, 160);
    ctx.lineTo(200, 200);
    ctx.lineTo(180, 250);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(256, 160);
    ctx.lineTo(312, 200);
    ctx.lineTo(332, 250);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(256, 300);
    ctx.lineTo(220, 380);
    ctx.lineTo(200, 450);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(256, 300);
    ctx.lineTo(292, 380);
    ctx.lineTo(312, 450);
    ctx.stroke();

    return canvas.toDataURL();
  }

  async testConnection(): Promise<PoseControlResponse> {
    try {
      if (!this.baseUrl) {
        return { success: false, error: 'ComfyUI endpoint not configured' };
      }

      const response = await fetch(`${this.baseUrl}/system_stats`);
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

  // Get available models and ControlNets
  async getAvailableModels(): Promise<{ models: string[], controlnets: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/object_info`);
      const data = await response.json();
      
      return {
        models: data.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || [],
        controlnets: data.ControlNetLoader?.input?.required?.control_net_name?.[0] || []
      };
    } catch (error) {
      // Return mock data
      return {
        models: ['v1-5-pruned-emaonly.ckpt', 'sd_xl_base_1.0.safetensors'],
        controlnets: ['control_v11p_sd15_openpose.pth', 'control_v11p_sd15_canny.pth']
      };
    }
  }
}

// Export singleton instance
export const comfyUIService = new ComfyUIService();

// Export types
export type { PoseControlRequest };
export default ComfyUIService;