import React, { useState, useRef } from 'react';
import { comfyUIService, PoseControlRequest } from '../services/comfyUIService';
import { useAppContext } from '../hooks/useAppContext';
import { 
  Upload, 
  Play, 
  Download, 
  RefreshCw, 
  Settings,
  Users,
  User,
  Sliders,
  Image as ImageIcon,
  Zap,
  Monitor,
  AlertCircle,
  CheckCircle,
  Wand2,
  Activity
} from 'lucide-react';
import SaveToGoogleDriveModal from '../components/SaveToGoogleDriveModal';

export default function PoseControl() {
  const { state } = useAppContext();
  const sourceImageRef = useRef<HTMLInputElement>(null);
  
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('low quality, blurry, distorted, deformed');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [detectedPose, setDetectedPose] = useState<string | null>(null);
  const [poseImage, setPoseImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [progress, setProgress] = useState(0);
  
  const [settings, setSettings] = useState<Omit<PoseControlRequest, 'sourceImage' | 'prompt' | 'negativePrompt'>>({
    poseStrength: 1.0,
    model: 'sd15',
    steps: 20,
    cfgScale: 7.5,
    seed: undefined
  });

  const models = [
    { value: 'sd15', label: 'Stable Diffusion 1.5', desc: 'เร็ว, คุณภาพดี' },
    { value: 'sdxl', label: 'SDXL', desc: 'คุณภาพสูง, ช้ากว่า' },
    { value: 'flux', label: 'Flux', desc: 'โมเดลล้ำสมัย' }
  ];

  const promptSuggestions = [
    'a beautiful anime girl in elegant dress',
    'a handsome man in casual clothes',
    'a warrior in medieval armor',
    'a dancing ballerina in white tutu',
    'a superhero in colorful costume',
    'a business person in formal attire'
  ];

  const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
        // Clear previous results when new image is uploaded
        setGeneratedImage(null);
        setDetectedPose(null);
        setPoseImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const testConnection = async () => {
    try {
      const result = await comfyUIService.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const generateWithPoseControl = async () => {
    if (!sourceImage) {
      alert('กรุณาอัปโหลดรูปภาพต้นฉบับ');
      return;
    }
    
    if (!prompt.trim()) {
      alert('กรุณาใส่ prompt สำหรับตัวละคร');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 1000);

      const request: PoseControlRequest = {
        sourceImage,
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        poseStrength: settings.poseStrength,
        model: settings.model,
        steps: settings.steps,
        cfgScale: settings.cfgScale,
        seed: settings.seed
      };

      const result = await comfyUIService.generateWithPoseControl(request);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.data) {
        setGeneratedImage(result.data.generatedImage);
        setPoseImage(result.data.poseImage);
        setDetectedPose(result.data.originalPose);
      } else {
        alert(`การสร้างรูปภาพล้มเหลว: ${result.error}`);
      }
    } catch (error) {
      console.error('Pose control generation failed:', error);
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleSave = (options: any) => {
    console.log('Saving generated image:', options);
    setShowSaveModal(false);
  };

  const copyPrompt = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const randomizeSeed = () => {
    setSettings(prev => ({ ...prev, seed: Math.floor(Math.random() * 1000000) }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pose Control</h1>
          <p className="text-gray-600">สร้างตัวละครตามท่าทางด้วย ComfyUI + ControlNet (OpenPose)</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={testConnection}
            className="btn-secondary text-sm flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>Test Connection</span>
          </button>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
            <span className={`font-medium ${
              connectionStatus === 'connected' ? 'text-green-600' : 
              connectionStatus === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'error' ? 'Disconnected' : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Source Image Upload */}
          <div className="card p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              รูปต้นฉบับ (Pose)
            </h3>
            
            {!sourceImage ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => sourceImageRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">อัปโหลดรูปภาพ</p>
                <p className="text-xs text-gray-500 mt-1">เพื่อตรวจจับท่าทาง</p>
              </div>
            ) : (
              <div className="space-y-3">
                <img
                  src={sourceImage}
                  alt="Source pose"
                  className="w-full rounded-lg border"
                />
                <button
                  onClick={() => sourceImageRef.current?.click()}
                  className="w-full btn-secondary text-sm"
                >
                  เปลี่ยนรูป
                </button>
              </div>
            )}
            
            <input
              ref={sourceImageRef}
              type="file"
              accept="image/*"
              onChange={handleSourceImageUpload}
              className="hidden"
            />
          </div>

          {/* Model Selection */}
          <div className="card p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              โมเดล AI
            </h3>
            
            <div className="space-y-2">
              {models.map(model => (
                <button
                  key={model.value}
                  onClick={() => setSettings(prev => ({ ...prev, model: model.value as any }))}
                  className={`w-full p-3 text-sm rounded-lg border transition-colors text-left ${
                    settings.model === model.value 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{model.label}</div>
                  <div className="text-xs text-gray-600">{model.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generation Settings */}
          <div className="card p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              การตั้งค่า
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pose Strength: {settings.poseStrength}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={settings.poseStrength}
                  onChange={(e) => setSettings(prev => ({ ...prev, poseStrength: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1</span>
                  <span>2.0</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steps: {settings.steps}
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={settings.steps}
                  onChange={(e) => setSettings(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>50</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CFG Scale: {settings.cfgScale}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={settings.cfgScale}
                  onChange={(e) => setSettings(prev => ({ ...prev, cfgScale: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seed (ไม่จำกัด = Random)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={settings.seed || ''}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      seed: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Random"
                    className="input-field flex-1"
                  />
                  <button
                    onClick={randomizeSeed}
                    className="btn-secondary px-3"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Prompt Input */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Character Prompt</h2>
              <button className="btn-secondary text-sm flex items-center space-x-1">
                <Wand2 className="w-4 h-4" />
                <span>AI Suggest</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Positive Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="อธิบายตัวละครที่ต้องการ... เช่น 'a beautiful anime girl in elegant dress'"
                  rows={3}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Negative Prompt
                </label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="สิ่งที่ไม่ต้องการให้ปรากฏในรูป..."
                  rows={2}
                  className="input-field"
                />
              </div>
              
              {/* Prompt Suggestions */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  ตัวอย่าง Character Prompts
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {promptSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => copyPrompt(suggestion)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded text-left transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generation Area */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Generate Character</h2>
              <div className="text-sm text-gray-600 flex items-center space-x-4">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  OpenPose
                </span>
                <span className="flex items-center">
                  <Monitor className="w-4 h-4 mr-1" />
                  {settings.model.toUpperCase()}
                </span>
              </div>
            </div>

            {!generatedImage ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  พร้อมสร้างตัวละคร
                </h3>
                <p className="text-gray-600 mb-6">
                  อัปโหลดรูปภาพท่าทาง ใส่ prompt และคลิก Generate
                </p>
                
                <button
                  onClick={generateWithPoseControl}
                  disabled={isGenerating || !sourceImage || !prompt.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      กำลังสร้างตัวละคร...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Character
                    </>
                  )}
                </button>

                {/* Progress Bar */}
                {isGenerating && (
                  <div className="mt-6 max-w-md mx-auto">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>กำลังประมวลผล...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      กำลังตรวจจับท่าทาง → สร้างตัวละคร → ประมวลผลภาพ
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Original Image */}
                  {sourceImage && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        รูปต้นฉบับ
                      </h4>
                      <img
                        src={sourceImage}
                        alt="Original"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Detected Pose */}
                  {poseImage && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        ท่าทางที่ตรวจจับ
                      </h4>
                      <img
                        src={poseImage}
                        alt="Detected pose"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Generated Character */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      ตัวละครที่สร้าง
                    </h4>
                    <img
                      src={generatedImage}
                      alt="Generated character"
                      className="w-full rounded-lg border"
                    />
                  </div>
                </div>

                {/* Generation Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-gray-600">Model</p>
                    <p className="font-medium">{settings.model.toUpperCase()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-gray-600">Steps</p>
                    <p className="font-medium">{settings.steps}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-gray-600">CFG Scale</p>
                    <p className="font-medium">{settings.cfgScale}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-gray-600">Pose Strength</p>
                    <p className="font-medium">{settings.poseStrength}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Save to Drive</span>
                  </button>
                  <a
                    href={generatedImage}
                    download={`pose_character_${Date.now()}.png`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลด</span>
                  </a>
                  <button
                    onClick={generateWithPoseControl}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>สร้างใหม่</span>
                  </button>
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