import React, { useState, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { GenerationSettings, Reference, GeneratedImage, SaveOptions } from '../types';
import {
  Play,
  Settings,
  Save,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Zap,
  Image as ImageIcon,
  Sliders,
  Wand2,
  Lightbulb,
  Copy,
  Plus,
  Upload
} from 'lucide-react';
import SaveToGoogleDriveModal from '../components/SaveToGoogleDriveModal';

export default function AIGeneration() {
  const { state, dispatch } = useAppContext();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedReferences, setSelectedReferences] = useState<{
    face?: Reference;
    product?: Reference;
    environment?: Reference;
    pose?: Reference;
  }>({});
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    model: state.settings.defaultModel,
    steps: 20,
    cfgScale: 7.5,
    width: 512,
    height: 512,
    seed: undefined,
    // Hires.fix defaults
    enableHiresFix: false,
    hiresUpscaler: 'Latent',
    hiresSteps: 0,
    hiresDenoising: 0.5,
    hiresUpscaleBy: 2.0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // File input refs for each category
  const faceFileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const environmentFileInputRef = useRef<HTMLInputElement>(null);
  const poseFileInputRef = useRef<HTMLInputElement>(null);

  const projectReferences = state.references.filter(ref => 
    !state.currentProject || ref.projectId === state.currentProject.id
  );

  const faceReferences = projectReferences.filter(ref => ref.category === 'faces');
  const productReferences = projectReferences.filter(ref => ref.category === 'products');
  const environmentReferences = projectReferences.filter(ref => ref.category === 'environments');
  const poseReferences = projectReferences.filter(ref => ref.category === 'poses');

  const promptSuggestions = [
    'beautiful portrait of a person, professional lighting, high quality',
    'product photography, clean background, studio lighting',
    'corporate headshot, professional attire, confident expression',
    'fashion model, dynamic pose, artistic lighting',
    'lifestyle photography, natural environment, candid moment',
    'creative portrait, artistic style, dramatic lighting'
  ];

  // NSFW Unlimited Prompt Templates
  const nsfwPromptTemplates = [
    {
      name: 'Artistic Nude',
      prompt: 'beautiful woman, artistic nude, professional photography, soft lighting, elegant pose, photorealistic, detailed skin, 8k uhd, high quality',
      negative: 'ugly, bad anatomy, bad hands, bad quality, blurry, low resolution'
    },
    {
      name: 'Sensual Portrait',
      prompt: 'sensual portrait, beautiful woman, nude, bedroom, natural lighting, photorealistic, detailed skin texture, detailed face, 8k uhd',
      negative: 'ugly, bad anatomy, bad quality, blurry, cartoon, 3d'
    },
    {
      name: 'Realistic Nude',
      prompt: 'RAW photo, beautiful asian woman, nude, natural lighting, bedroom, photorealistic, detailed face, detailed body, detailed skin, 8k uhd, dslr, professional',
      negative: 'cartoon, 3d, anime, painting, ugly, bad quality, blurry'
    },
    {
      name: 'Intimate Scene',
      prompt: 'intimate romantic scene, couple, bedroom, passionate, sensual, detailed anatomy, cinematic lighting, photorealistic, high detail, 8k uhd',
      negative: 'ugly, bad anatomy, bad proportions, bad quality, blurry, cartoon'
    },
    {
      name: 'Explicit Unlimited',
      prompt: 'explicit sexual content, photorealistic, detailed anatomy, detailed genitalia, bedroom scene, cinematic lighting, ultra detailed, 8k uhd, professional photography, realistic skin texture',
      negative: 'ugly, bad anatomy, deformed, bad quality, blurry, cartoon, 3d'
    },
    {
      name: 'Adult Scene',
      prompt: 'nsfw, adult sexual activity, explicit content, photorealistic, bedroom, detailed bodies, detailed anatomy, natural lighting, high detail, 8k uhd, professional',
      negative: 'ugly, bad anatomy, deformed, blurry, low quality, cartoon'
    }
  ];

  // Aspect Ratio Presets สำหรับแพลตฟอร์มต่างๆ
  const aspectRatioPresets = [
    { id: 'custom', name: 'กำหนดเอง', width: 512, height: 512, icon: '⚙️' },
    { id: 'square', name: 'สี่เหลี่ยมจัตุรัส (1:1)', width: 1024, height: 1024, icon: '⬜', description: 'Instagram Post' },
    { id: 'tiktok', name: 'TikTok (9:16)', width: 1080, height: 1920, icon: '📱', description: 'TikTok Full HD' },
    { id: 'instagram-reel', name: 'Instagram Reels (9:16)', width: 1080, height: 1920, icon: '📸', description: 'Instagram Reels' },
    { id: 'youtube-short', name: 'YouTube Shorts (9:16)', width: 1080, height: 1920, icon: '📹', description: 'YouTube Shorts' },
    { id: 'facebook-reel', name: 'Facebook Reel (9:16)', width: 1080, height: 1920, icon: '👍', description: 'Facebook Reels' },
    { id: 'story', name: 'Instagram Story (9:16)', width: 1080, height: 1920, icon: '📲', description: 'Instagram/Facebook Story' },
    { id: 'youtube', name: 'YouTube (16:9)', width: 1920, height: 1080, icon: '🎬', description: 'YouTube Thumbnail/Video' },
    { id: 'twitter', name: 'Twitter/X (16:9)', width: 1200, height: 675, icon: '🐦', description: 'Twitter/X Post' }
  ];

  const handleAspectRatioChange = (presetId: string) => {
    const preset = aspectRatioPresets.find(p => p.id === presetId);
    if (preset) {
      setGenerationSettings(prev => ({
        ...prev,
        width: preset.width,
        height: preset.height
      }));
    }
  };

  const handleReferenceSelect = (category: keyof typeof selectedReferences, reference: Reference) => {
    setSelectedReferences(prev => ({
      ...prev,
      [category]: prev[category]?.id === reference.id ? undefined : reference
    }));
  };

  // Handle file upload for references
  const handleFileUpload = async (category: 'faces' | 'products' | 'environments' | 'poses', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;

        // Create new reference
        const newReference: Reference = {
          id: Date.now().toString(),
          filename: file.name,
          url: imageUrl,
          category: category,
          tags: [],
          projectId: state.currentProject?.id || 'general',
          uploadedAt: new Date()
        };

        // Add to state
        dispatch({ type: 'ADD_REFERENCE', payload: newReference });

        console.log(`✅ อัปโหลด Reference สำเร็จ: ${category}`);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูป');
    }

    // Reset input
    event.target.value = '';
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert('กรุณาใส่ prompt');
      return;
    }

    // เช็คการตั้งค่าตาม API Mode
    if (state.settings.apiMode === 'huggingface') {
      if (!state.settings.huggingFace.apiKey) {
        alert('⚠️ กรุณาใส่ Hugging Face API Key ที่ Settings > Hugging Face ก่อน\n\n💡 รับ API Key ฟรีได้ที่ huggingface.co/settings/tokens');
        return;
      }
    } else if (state.settings.apiMode === 'colab') {
      if (!state.settings.colab.apiEndpoint) {
        alert('⚠️ กรุณาตั้งค่า API Endpoint ที่ Settings > Google Colab ก่อน');
        return;
      }
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      console.log('🚀 API Mode:', state.settings.apiMode);
      console.log('📸 Selected References:', {
        face: selectedReferences.face?.filename,
        product: selectedReferences.product?.filename,
        environment: selectedReferences.environment?.filename,
        pose: selectedReferences.pose?.filename
      });

      // ปรับ negative prompt ตาม NSFW mode
      let finalNegativePrompt = negativePrompt;
      if (!state.settings.nsfwMode) {
        // ถ้าปิด NSFW mode = เพิ่ม NSFW blocking keywords
        const nsfwBlockKeywords = 'nsfw, nude, naked, explicit, adult content, sexual';
        finalNegativePrompt = finalNegativePrompt
          ? `${finalNegativePrompt}, ${nsfwBlockKeywords}`
          : nsfwBlockKeywords;
      }

      let imageDataUrl: string;

      // ==================================================
      // 🚀 HUGGING FACE API MODE
      // ==================================================
      if (state.settings.apiMode === 'huggingface') {
        console.log('🤗 Using Hugging Face API');
        console.log('📦 Model:', state.settings.huggingFace.model);

        const hfApiUrl = `https://api-inference.huggingface.co/models/${state.settings.huggingFace.model}`;

        const response = await fetch(hfApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.settings.huggingFace.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              negative_prompt: finalNegativePrompt || undefined,
              num_inference_steps: generationSettings.steps,
              guidance_scale: generationSettings.cfgScale,
              width: generationSettings.width,
              height: generationSettings.height,
            }
          })
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Hugging Face API Error:', response.status, errorText);

          if (response.status === 401) {
            throw new Error('API Key ไม่ถูกต้อง - กรุณาตรวจสอบที่ Settings');
          } else if (response.status === 503) {
            throw new Error('Model กำลังโหลด - กรุณารอสักครู่แล้วลองใหม่ (ประมาณ 20 วินาที)');
          } else {
            throw new Error(`Hugging Face API Error: ${response.status} ${response.statusText}`);
          }
        }

        // Hugging Face returns image as blob
        const imageBlob = await response.blob();

        // Convert blob to base64
        const reader = new FileReader();
        imageDataUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageBlob);
        });

        console.log('✅ Hugging Face สร้างรูปสำเร็จ!');
      }
      // ==================================================
      // 🔬 GOOGLE COLAB API MODE
      // ==================================================
      else {
        console.log('🔬 Using Google Colab API');
        const apiUrl = `${state.settings.colab.apiEndpoint}/sdapi/v1/txt2img`;
        console.log('📡 API URL:', apiUrl);

      // คำนวณ initial size เมื่อใช้ Hires.fix
      let initialWidth = generationSettings.width;
      let initialHeight = generationSettings.height;

      if (generationSettings.enableHiresFix && generationSettings.hiresUpscaleBy) {
        initialWidth = Math.round(generationSettings.width / generationSettings.hiresUpscaleBy);
        initialHeight = Math.round(generationSettings.height / generationSettings.hiresUpscaleBy);
        // ปัดให้หาร 8 ลงตัว
        initialWidth = Math.round(initialWidth / 8) * 8;
        initialHeight = Math.round(initialHeight / 8) * 8;
      }

      console.log('🎨 Generation Settings:', {
        enableHiresFix: generationSettings.enableHiresFix,
        initialSize: `${initialWidth}x${initialHeight}`,
        finalSize: `${generationSettings.width}x${generationSettings.height}`,
        upscaler: generationSettings.hiresUpscaler,
        denoising: generationSettings.hiresDenoising
      });

      // สร้าง request body
      const requestBody: any = {
        prompt: prompt,
        negative_prompt: finalNegativePrompt,
        steps: generationSettings.steps,
        cfg_scale: generationSettings.cfgScale,
        width: initialWidth,
        height: initialHeight,
        seed: generationSettings.seed || -1,
        sampler_name: "DPM++ 2M Karras",
        restore_faces: false,
        enable_hr: generationSettings.enableHiresFix || false
      };

      // เพิ่ม Hires.fix parameters ถ้าเปิดใช้งาน
      if (generationSettings.enableHiresFix) {
        requestBody.hr_scale = generationSettings.hiresUpscaleBy;
        requestBody.hr_upscaler = generationSettings.hiresUpscaler;
        requestBody.hr_second_pass_steps = generationSettings.hiresSteps || 0;
        requestBody.denoising_strength = generationSettings.hiresDenoising;
        requestBody.hr_resize_x = generationSettings.width;
        requestBody.hr_resize_y = generationSettings.height;
      }

      console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.images || data.images.length === 0) {
        throw new Error('ไม่สามารถสร้างรูปได้');
      }

        console.log('✅ Colab สร้างรูปสำเร็จ!');

        // Convert base64 to data URL
        imageDataUrl = `data:image/png;base64,${data.images[0]}`;
      }

      // ==================================================
      // ✅ SAVE GENERATED IMAGE (Both APIs)
      // ==================================================
      setProgress(100);
      setGeneratedImage(imageDataUrl);

      // Save to generated images
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        filename: `generated_${Date.now()}.png`,
        url: imageDataUrl,
        prompt,
        negativePrompt: negativePrompt || undefined,
        settings: generationSettings,
        references: Object.values(selectedReferences).filter(Boolean) as Reference[],
        projectId: state.currentProject?.id || 'general',
        createdAt: new Date(),
        metadata: {
          width: generationSettings.width,
          height: generationSettings.height,
          format: 'png',
          size: 1024 * 1024, // 1MB mock
          tags: []
        }
      };

      dispatch({ type: 'ADD_GENERATED_IMAGE', payload: newImage });

    } catch (error: any) {
      console.error('Generation failed:', error);

      // Handle specific error cases
      let errorMessage = '❌ เกิดข้อผิดพลาดในการสร้างภาพ';

      // Hugging Face specific errors
      if (state.settings.apiMode === 'huggingface') {
        if (error.message.includes('API Key ไม่ถูกต้อง')) {
          errorMessage = `🚫 Hugging Face API Key ไม่ถูกต้อง

กรุณาตรวจสอบ:
1. ไปที่ Settings > Hugging Face
2. ตรวจสอบว่า API Key ถูกต้อง (ขึ้นต้นด้วย hf_)
3. หากไม่มี API Key ให้สร้างใหม่ที่:
   https://huggingface.co/settings/tokens`;
        } else if (error.message.includes('Model กำลังโหลด')) {
          errorMessage = `⏳ Model กำลังโหลด

Hugging Face กำลังโหลด AI Model...
กรุณารอสักครู่ (ประมาณ 20-30 วินาที) แล้วลองใหม่อีกครั้ง

💡 Model ที่ใช้: ${state.settings.huggingFace.model}`;
        } else if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
          errorMessage = `🌐 ไม่สามารถเชื่อมต่อ Hugging Face API ได้

กรุณาตรวจสอบ:
• อินเทอร์เน็ตเชื่อมต่อปกติ
• Hugging Face API ทำงานปกติ

หากยังไม่ได้ ลองเปลี่ยนเป็น Colab Mode ที่ Settings`;
        } else if (error.message.includes('Hugging Face API Error')) {
          errorMessage = `❌ ${error.message}

กรุณาลองใหม่อีกครั้ง หรือเปลี่ยน Model ที่ Settings > Hugging Face`;
        }
      }
      // Colab specific errors
      else {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
          errorMessage = `🚫 ไม่สามารถเชื่อมต่อ Colab API ได้

❗ สาเหตุที่เป็นไปได้:
1️⃣ Cloudflare Tunnel URL หมดอายุ (Tunnel ใช้ได้ไม่เกิน 24 ชั่วโมง)
2️⃣ Colab Notebook หยุดทำงานแล้ว
3️⃣ Cell 4.5 (Cloudflare Tunnel) ยังไม่ได้รัน

🔧 วิธีแก้ไข:
1. กลับไปที่ Google Colab Notebook
2. รัน Cell 4.5 (Cloudflare Tunnel) ใหม่
3. คัดลอก URL ใหม่ที่ขึ้นในรูปแบบ:
   https://[ชื่อ-ใหม่].trycloudflare.com
4. ไปที่ Settings > Google Colab
5. อัปเดต API Endpoint ด้วย URL ใหม่
6. คลิก "บันทึก"
7. กลับมาลองอีกครั้ง

💡 ทิป: ลองเปลี่ยนเป็น Hugging Face Mode แทน (แนะนำ)`;
        } else if (error.message.includes('API Error')) {
          errorMessage = `❌ Stable Diffusion WebUI Error\n\n${error.message}\n\nกรุณาตรวจสอบ:\n• WebUI กำลังรันอยู่หรือไม่\n• Settings ถูกต้องหรือไม่`;
        }
      }

      alert(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const createMockImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = generationSettings.width;
    canvas.height = generationSettings.height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#4F46E5');
      gradient.addColorStop(1, '#7C3AED');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AI Generated Image', canvas.width / 2, canvas.height / 2);
      ctx.font = '16px Arial';
      ctx.fillText(new Date().toLocaleString(), canvas.width / 2, canvas.height / 2 + 40);
    }
    
    return canvas.toDataURL();
  };

  const copyPrompt = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleSave = async (options: SaveOptions) => {
    if (!generatedImage) return;

    try {
      console.log('💾 Saving to Google Drive:', options);

      // TODO: เชื่อมต่อ Google Drive API จริง
      // ตอนนี้บันทึกลง localStorage ก่อน

      const imageToSave: GeneratedImage = {
        id: Date.now().toString(),
        filename: options.filename || `ai-gen-${Date.now()}.png`,
        url: generatedImage,
        prompt,
        negativePrompt: negativePrompt || undefined,
        settings: generationSettings,
        references: Object.values(selectedReferences).filter(Boolean) as Reference[],
        projectId: state.currentProject?.id || 'general',
        createdAt: new Date(),
        metadata: {
          width: generationSettings.width,
          height: generationSettings.height,
          format: 'png',
          size: 0,
          tags: options.tags || [],
          description: options.description
        }
      };

      dispatch({ type: 'ADD_GENERATED_IMAGE', payload: imageToSave });

      console.log('✅ บันทึกสำเร็จ!');
      alert('✅ บันทึกรูปสำเร็จ! ดูได้ที่ Gallery');
      setShowSaveModal(false);

    } catch (error) {
      console.error('❌ Save error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Generation</h1>
          <p className="text-gray-600">สร้างภาพด้วย Flux AI</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn-secondary ${showSettings ? 'bg-gray-200' : ''}`}
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="w-4 h-4" />
            <span>Model: {generationSettings.model}</span>
          </div>
        </div>
      </div>

      {/* Current Project */}
      {state.currentProject && (
        <div className="card p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Project: {state.currentProject.name}</p>
              <p className="text-xs text-blue-500">Template: {state.currentProject.template}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-blue-600">References: {projectReferences.length}</p>
              <p className="text-blue-500">Generated: {state.generatedImages.filter(img => img.projectId === state.currentProject?.id).length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reference Selection */}
        <div className="lg:col-span-1 space-y-6">
          {/* Face References */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
              <span className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                หน้าคน ({faceReferences.length})
              </span>
              <button
                onClick={() => faceFileInputRef.current?.click()}
                className="btn-secondary text-xs px-2 py-1 flex items-center"
                title="อัปโหลดรูปหน้าคน"
              >
                <Plus className="w-3 h-3 mr-1" />
                เพิ่ม
              </button>
            </h3>
            <input
              ref={faceFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('faces', e)}
              className="hidden"
            />
            {faceReferences.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {faceReferences.slice(0, 4).map(ref => (
                  <button
                    key={ref.id}
                    onClick={() => handleReferenceSelect('face', ref)}
                    className={`
                      relative rounded-lg overflow-hidden border-2 transition-all
                      ${selectedReferences.face?.id === ref.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <img src={ref.url} alt={ref.filename} className="w-full h-16 object-cover" />
                    {selectedReferences.face?.id === ref.id && (
                      <div className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center">
                        <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีรูป</p>
                <p className="text-xs mt-1">คลิก "เพิ่ม" เพื่ออัปโหลด</p>
              </div>
            )}
          </div>

          {/* Product References */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
              <span className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                สินค้า ({productReferences.length})
              </span>
              <button
                onClick={() => productFileInputRef.current?.click()}
                className="btn-secondary text-xs px-2 py-1 flex items-center"
                title="อัปโหลดรูปสินค้า"
              >
                <Plus className="w-3 h-3 mr-1" />
                เพิ่ม
              </button>
            </h3>
            <input
              ref={productFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('products', e)}
              className="hidden"
            />
            {productReferences.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {productReferences.slice(0, 4).map(ref => (
                  <button
                    key={ref.id}
                    onClick={() => handleReferenceSelect('product', ref)}
                    className={`
                      relative rounded-lg overflow-hidden border-2 transition-all
                      ${selectedReferences.product?.id === ref.id
                        ? 'border-green-500 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <img src={ref.url} alt={ref.filename} className="w-full h-16 object-cover" />
                    {selectedReferences.product?.id === ref.id && (
                      <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีรูป</p>
                <p className="text-xs mt-1">คลิก "เพิ่ม" เพื่ออัปโหลด</p>
              </div>
            )}
          </div>

          {/* Environment References */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
              <span className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                สภาพแวดล้อม ({environmentReferences.length})
              </span>
              <button
                onClick={() => environmentFileInputRef.current?.click()}
                className="btn-secondary text-xs px-2 py-1 flex items-center"
                title="อัปโหลดรูปสภาพแวดล้อม"
              >
                <Plus className="w-3 h-3 mr-1" />
                เพิ่ม
              </button>
            </h3>
            <input
              ref={environmentFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('environments', e)}
              className="hidden"
            />
            {environmentReferences.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {environmentReferences.slice(0, 4).map(ref => (
                  <button
                    key={ref.id}
                    onClick={() => handleReferenceSelect('environment', ref)}
                    className={`
                      relative rounded-lg overflow-hidden border-2 transition-all
                      ${selectedReferences.environment?.id === ref.id
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <img src={ref.url} alt={ref.filename} className="w-full h-16 object-cover" />
                    {selectedReferences.environment?.id === ref.id && (
                      <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีรูป</p>
                <p className="text-xs mt-1">คลิก "เพิ่ม" เพื่ออัปโหลด</p>
              </div>
            )}
          </div>

          {/* Pose References */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
              <span className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                ท่าทาง ({poseReferences.length})
              </span>
              <button
                onClick={() => poseFileInputRef.current?.click()}
                className="btn-secondary text-xs px-2 py-1 flex items-center"
                title="อัปโหลดรูปท่าทาง"
              >
                <Plus className="w-3 h-3 mr-1" />
                เพิ่ม
              </button>
            </h3>
            <input
              ref={poseFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload('poses', e)}
              className="hidden"
            />
            {poseReferences.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {poseReferences.slice(0, 4).map(ref => (
                  <button
                    key={ref.id}
                    onClick={() => handleReferenceSelect('pose', ref)}
                    className={`
                      relative rounded-lg overflow-hidden border-2 transition-all
                      ${selectedReferences.pose?.id === ref.id
                        ? 'border-orange-500 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <img src={ref.url} alt={ref.filename} className="w-full h-16 object-cover" />
                    {selectedReferences.pose?.id === ref.id && (
                      <div className="absolute inset-0 bg-orange-500 bg-opacity-20 flex items-center justify-center">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีรูป</p>
                <p className="text-xs mt-1">คลิก "เพิ่ม" เพื่ออัปโหลด</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Generation Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Aspect Ratio Selection - Always Visible */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sliders className="w-5 h-5 mr-2" />
              📐 เลือกขนาดภาพ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {aspectRatioPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleAspectRatioChange(preset.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-left
                    ${generationSettings.width === preset.width && generationSettings.height === preset.height
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xl">{preset.icon}</span>
                    <span className="font-medium text-sm">{preset.name}</span>
                  </div>
                  {preset.description && (
                    <p className="text-xs text-gray-500">{preset.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{preset.width} × {preset.height}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Prompt</h2>
              <button className="btn-secondary text-sm">
                <Wand2 className="w-4 h-4 mr-1" />
                AI Suggest
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt หลัก
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="อธิบายภาพที่ต้องการให้ AI สร้าง..."
                  rows={4}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Negative Prompt (ไม่ต้องการ)
                </label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="สิ่งที่ไม่ต้องการให้ปรากฏในภาพ..."
                  rows={2}
                  className="input-field"
                />
              </div>
            </div>

            {/* Prompt Suggestions */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 mr-1" />
                คำแนะนำ Prompt
              </p>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => copyPrompt(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors flex items-center"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {suggestion.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            {/* NSFW Unlimited Prompt Templates */}
            {state.settings.nsfwMode && (
              <div className="mt-4 border-t pt-4 bg-purple-50 -mx-6 px-6 py-4 rounded-lg">
                <p className="text-sm font-bold text-purple-900 mb-3 flex items-center">
                  🔞 NSFW Unlimited Templates
                  <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">18+</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {nsfwPromptTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPrompt(template.prompt);
                        setNegativePrompt(template.negative);
                      }}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-purple-700 mt-3 font-medium">
                  💡 ไม่มีข้อจำกัด - คลิกเพื่อใช้ Prompt สำเร็จรูป
                </p>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          {showSettings && (
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Sliders className="w-5 h-5 mr-2" />
                  ⚙️ ตั้งค่าขั้นสูง
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
                    <input
                      type="number"
                      min="10"
                      max="50"
                      value={generationSettings.steps}
                      onChange={(e) => setGenerationSettings(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CFG Scale</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      step="0.5"
                      value={generationSettings.cfgScale}
                      onChange={(e) => setGenerationSettings(prev => ({ ...prev, cfgScale: parseFloat(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                    <input
                      type="number"
                      min="512"
                      max="2048"
                      step="64"
                      value={generationSettings.width}
                      onChange={(e) => setGenerationSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                    <input
                      type="number"
                      min="512"
                      max="2048"
                      step="64"
                      value={generationSettings.height}
                      onChange={(e) => setGenerationSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Hires.fix Section */}
              <div className="border-t pt-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="enableHiresFix"
                    checked={generationSettings.enableHiresFix}
                    onChange={(e) => setGenerationSettings(prev => ({ ...prev, enableHiresFix: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="enableHiresFix" className="ml-2 text-sm font-medium text-gray-900">
                    🎨 Enable Hires.fix (สำหรับความละเอียดสูง)
                  </label>
                </div>

                {generationSettings.enableHiresFix && (
                  <div className="ml-6 space-y-4">
                    <p className="text-xs text-gray-600 mb-4">
                      💡 Hires.fix จะสร้างภาพขนาดเล็กก่อน แล้วขยายให้คมชัด เหมาะสำหรับภาพขนาดใหญ่ (1080x1920)
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upscaler
                        </label>
                        <select
                          value={generationSettings.hiresUpscaler}
                          onChange={(e) => setGenerationSettings(prev => ({ ...prev, hiresUpscaler: e.target.value }))}
                          className="input-field"
                        >
                          <option value="Latent">Latent (เร็ว)</option>
                          <option value="Latent (nearest-exact)">Latent (nearest-exact)</option>
                          <option value="None">None</option>
                          <option value="Lanczos">Lanczos</option>
                          <option value="Nearest">Nearest</option>
                          <option value="ESRGAN_4x">ESRGAN 4x (คม)</option>
                          <option value="R-ESRGAN 4x+">R-ESRGAN 4x+</option>
                          <option value="SwinIR_4x">SwinIR 4x</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upscale By
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          step="0.1"
                          value={generationSettings.hiresUpscaleBy}
                          onChange={(e) => setGenerationSettings(prev => ({ ...prev, hiresUpscaleBy: parseFloat(e.target.value) }))}
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ขยาย {generationSettings.hiresUpscaleBy}x
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Denoising
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.05"
                          value={generationSettings.hiresDenoising}
                          onChange={(e) => setGenerationSettings(prev => ({ ...prev, hiresDenoising: parseFloat(e.target.value) }))}
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          0.3-0.7 แนะนำ
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hires Steps
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={generationSettings.hiresSteps}
                          onChange={(e) => setGenerationSettings(prev => ({ ...prev, hiresSteps: parseInt(e.target.value) }))}
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          0 = ใช้ steps หลัก
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-900">
                        <strong>📊 Preview:</strong> สร้างที่ {Math.round(generationSettings.width / generationSettings.hiresUpscaleBy!)}x{Math.round(generationSettings.height / generationSettings.hiresUpscaleBy!)}
                        → ขยายเป็น {generationSettings.width}x{generationSettings.height}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generate Image</h3>
                <p className="text-sm text-gray-600">
                  Selected: {Object.values(selectedReferences).filter(Boolean).length} references
                </p>
              </div>
              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>กำลังสร้าง...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Generated Image */}
            {generatedImage && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <a
                      href={generatedImage}
                      download="generated-image.png"
                      className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Model: {generationSettings.model}</p>
                    <p>Size: {generationSettings.width}×{generationSettings.height}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-secondary text-sm">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Regenerate
                    </button>
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="btn-primary text-sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save to Drive
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && generatedImage && (
        <SaveToGoogleDriveModal
          image={generatedImage}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}