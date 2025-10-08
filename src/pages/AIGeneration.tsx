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
  Copy
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
    seed: undefined
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // NSFW Prompt Templates
  const nsfwPromptTemplates = [
    {
      name: 'Artistic Nude',
      prompt: 'beautiful woman, artistic nude, professional photography, soft lighting, elegant pose, photorealistic, detailed skin, 8k uhd, high quality',
      negative: 'ugly, bad anatomy, bad hands, bad quality, blurry, low resolution'
    },
    {
      name: 'Intimate Scene',
      prompt: 'intimate romantic scene, two people, bedroom, cinematic lighting, photorealistic, passionate, sensual, detailed, 8k uhd',
      negative: 'ugly, bad anatomy, bad proportions, bad quality, blurry, cartoon, low resolution'
    },
    {
      name: 'Sensual Portrait',
      prompt: 'sensual portrait, beautiful woman, bedroom, natural lighting, photorealistic, detailed skin texture, 8k uhd',
      negative: 'ugly, bad anatomy, bad quality, blurry, cartoon, 3d'
    },
    {
      name: 'Realistic Nude',
      prompt: 'RAW photo, beautiful asian woman, nude, natural lighting, bedroom, photorealistic, detailed face, detailed skin, 8k uhd, dslr',
      negative: 'cartoon, 3d, anime, painting, ugly, bad quality, blurry'
    },
    {
      name: 'Explicit Content',
      prompt: 'explicit sexual content, photorealistic, bedroom scene, detailed anatomy, cinematic lighting, high detail, 8k uhd, professional photography',
      negative: 'ugly, bad anatomy, deformed, bad quality, blurry, cartoon, 3d, low resolution'
    }
  ];

  // Aspect Ratio Presets สำหรับแพลตฟอร์มต่างๆ
  const aspectRatioPresets = [
    { id: 'custom', name: 'กำหนดเอง', width: 512, height: 512, icon: '⚙️' },
    { id: 'square', name: 'สี่เหลี่ยมจัตุรัส (1:1)', width: 1024, height: 1024, icon: '⬜', description: 'Instagram Post' },
    { id: 'tiktok', name: 'แนวตั้ง TikTok (9:16)', width: 720, height: 1280, icon: '📱', description: 'TikTok, Instagram Reels' },
    { id: 'facebook-reel', name: 'แนวตั้ง Facebook Reel (9:16)', width: 720, height: 1280, icon: '📱', description: 'Facebook Reels' },
    { id: 'youtube', name: 'แนวนอน YouTube (16:9)', width: 1280, height: 720, icon: '🎬', description: 'YouTube Thumbnail' },
    { id: 'youtube-short', name: 'แนวตั้ง YouTube Shorts (9:16)', width: 720, height: 1280, icon: '📹', description: 'YouTube Shorts' },
    { id: 'twitter', name: 'Twitter Post (16:9)', width: 1200, height: 675, icon: '🐦', description: 'Twitter/X' },
    { id: 'story', name: 'Instagram Story (9:16)', width: 1080, height: 1920, icon: '📲', description: 'Instagram/Facebook Story' }
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

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert('กรุณาใส่ prompt');
      return;
    }

    // เช็คว่าตั้งค่า API Endpoint หรือยัง
    if (!state.settings.colab.apiEndpoint) {
      alert('⚠️ กรุณาตั้งค่า API Endpoint ที่ Settings > Google Colab ก่อน');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      console.log('🚀 กำลังเรียก Colab API:', state.settings.colab.apiEndpoint);

      // ปรับ negative prompt ตาม NSFW mode
      let finalNegativePrompt = negativePrompt;
      if (!state.settings.nsfwMode) {
        // ถ้าปิด NSFW mode = เพิ่ม NSFW blocking keywords
        const nsfwBlockKeywords = 'nsfw, nude, naked, explicit, adult content, sexual';
        finalNegativePrompt = finalNegativePrompt
          ? `${finalNegativePrompt}, ${nsfwBlockKeywords}`
          : nsfwBlockKeywords;
      }

      // เรียก Colab API จริง
      const response = await fetch(`${state.settings.colab.apiEndpoint}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: finalNegativePrompt,
          steps: generationSettings.steps,
          guidance_scale: generationSettings.cfgScale,
          width: generationSettings.width,
          height: generationSettings.height,
          seed: generationSettings.seed
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success || !data.image) {
        throw new Error(data.error || 'ไม่สามารถสร้างรูปได้');
      }

      console.log('✅ สร้างรูปสำเร็จ!');
      setProgress(100);
      setGeneratedImage(data.image);

      // Save to generated images
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        filename: `generated_${Date.now()}.png`,
        url: data.image,
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

    } catch (error) {
      console.error('Generation failed:', error);
      alert('เกิดข้อผิดพลาดในการสร้างภาพ');
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
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              หน้าคน ({faceReferences.length})
            </h3>
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
          </div>

          {/* Product References */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              สินค้า ({productReferences.length})
            </h3>
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
          </div>

          {/* Environment References */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              สภาพแวดล้อม ({environmentReferences.length})
            </h3>
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
          </div>

          {/* Pose References */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              ท่าทาง ({poseReferences.length})
            </h3>
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
          </div>
        </div>

        {/* Main Generation Area */}
        <div className="lg:col-span-2 space-y-6">
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

            {/* NSFW Prompt Templates */}
            {state.settings.nsfwMode && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  🔞 NSFW Templates
                </p>
                <div className="flex flex-wrap gap-2">
                  {nsfwPromptTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPrompt(template.prompt);
                        setNegativePrompt(template.negative);
                      }}
                      className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-900 px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 คลิกเพื่อใช้ template พร้อม negative prompt ที่เหมาะสม
                </p>
              </div>
            )}
          </div>

          {/* Generation Settings */}
          {showSettings && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sliders className="w-5 h-5 mr-2" />
                Generation Settings
              </h3>

              {/* Aspect Ratio Presets */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📐 ขนาดภาพสำหรับแพลตฟอร์ม
                </label>
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

              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ⚙️ ตั้งค่าขั้นสูง
                </label>
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