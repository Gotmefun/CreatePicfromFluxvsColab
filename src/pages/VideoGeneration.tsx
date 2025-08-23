import React, { useState, useRef } from 'react';
import { wan22Service, VideoGenerationRequest } from '../services/wan22Service';
import { useAppContext } from '../hooks/useAppContext';
import { 
  Video, 
  Upload, 
  Play, 
  Download, 
  RefreshCw, 
  Settings,
  Type,
  Image as ImageIcon,
  Layers,
  Clock,
  Monitor,
  Palette,
  Wand2
} from 'lucide-react';
import SaveToGoogleDriveModal from '../components/SaveToGoogleDriveModal';

export default function VideoGeneration() {
  const { state } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [generationType, setGenerationType] = useState<'text-to-video' | 'image-to-video' | 'text-image-to-video'>('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [settings, setSettings] = useState<VideoGenerationRequest>({
    type: 'text-to-video',
    duration: 4,
    fps: 24,
    resolution: '720p',
    style: 'realistic'
  });

  const generationTypes = [
    {
      id: 'text-to-video',
      name: 'Text to Video',
      description: 'สร้างวิดีโอจาก prompt ข้อความ',
      icon: Type,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      id: 'image-to-video',
      name: 'Image to Video',
      description: 'ทำให้ภาพสถิตเคลื่อนไหว',
      icon: ImageIcon,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    {
      id: 'text-image-to-video',
      name: 'Text + Image to Video',
      description: 'รวม prompt และรูปภาพ',
      icon: Layers,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    }
  ] as const;

  const promptSuggestions = [
    'A cat walking in a beautiful garden with flowers blooming',
    'Ocean waves crashing against rocks at sunset',
    'A person cooking in a modern kitchen',
    'City traffic moving through busy streets at night',
    'Cherry blossoms falling in a peaceful park',
    'A butterfly landing on colorful flowers'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTypeChange = (type: typeof generationType) => {
    setGenerationType(type);
    setSettings(prev => ({ ...prev, type }));
    
    // Reset states when changing type
    if (type === 'text-to-video') {
      setReferenceImage(null);
    }
  };

  const generateVideo = async () => {
    if (!prompt.trim() && generationType !== 'image-to-video') {
      alert('กรุณาใส่ prompt สำหรับการสร้างวิดีโอ');
      return;
    }
    
    if ((generationType === 'image-to-video' || generationType === 'text-image-to-video') && !referenceImage) {
      alert('กรุณาอัปโหลดรูปภาพอ้างอิง');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      wan22Service.simulateProgress((progress) => {
        setProgress(progress);
      }, settings.duration * 2000); // Longer duration = longer processing

      const request: VideoGenerationRequest = {
        type: generationType,
        prompt: prompt.trim() || undefined,
        image: referenceImage || undefined,
        duration: settings.duration,
        fps: settings.fps,
        resolution: settings.resolution,
        style: settings.style
      };

      const result = await wan22Service.generateVideo(request);

      if (result.success && result.data) {
        setGeneratedVideo(result.data.videoUrl);
        setVideoThumbnail(result.data.thumbnailUrl);
        setProgress(100);
      } else {
        alert(`การสร้างวิดีโอล้มเหลว: ${result.error}`);
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      alert('เกิดข้อผิดพลาดในการสร้างวิดีโอ');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleSave = (options: any) => {
    console.log('Saving generated video:', options);
    setShowSaveModal(false);
  };

  const copyPrompt = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Generation</h1>
          <p className="text-gray-600">สร้างวิดีโอด้วย Wan2.2 AI - Text to Video, Image to Video</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Video className="w-4 h-4" />
          <span>Model: Wan2.2</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Generation Type */}
          <div className="card p-6">
            <h3 className="font-medium text-gray-900 mb-4">ประเภทการสร้าง</h3>
            <div className="space-y-3">
              {generationTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = generationType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeChange(type.id)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? `${type.border} ${type.bg}` 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 ${isSelected ? type.color : 'text-gray-400'}`} />
                      <div>
                        <h4 className={`font-medium text-sm ${isSelected ? type.color : 'text-gray-900'}`}>
                          {type.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload (for Image-to-Video and Text+Image-to-Video) */}
          {(generationType === 'image-to-video' || generationType === 'text-image-to-video') && (
            <div className="card p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                รูปภาพอ้างอิง
              </h3>
              
              {!referenceImage ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">อัปโหลดรูปภาพ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <img
                    src={referenceImage}
                    alt="Reference"
                    className="w-full rounded-lg border"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full btn-secondary text-sm"
                  >
                    เปลี่ยนรูป
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Video Settings */}
          <div className="card p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              การตั้งค่าวิดีโอ
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ระยะเวลา: {settings.duration} วินาที
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={settings.duration}
                  onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2s</span>
                  <span>10s</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FPS
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[24, 30].map(fps => (
                    <button
                      key={fps}
                      onClick={() => setSettings(prev => ({ ...prev, fps: fps as 24 | 30 }))}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        settings.fps === fps 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความละเอียด
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: '720p', label: '720P (HD)', desc: '1280×720' },
                    { value: '1080p', label: '1080P (Full HD)', desc: '1920×1080' }
                  ].map(res => (
                    <button
                      key={res.value}
                      onClick={() => setSettings(prev => ({ ...prev, resolution: res.value as '720p' | '1080p' }))}
                      className={`p-3 text-sm rounded-lg border transition-colors text-left ${
                        settings.resolution === res.value 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{res.label}</div>
                      <div className="text-xs text-gray-600">{res.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สไตล์
                </label>
                <select
                  value={settings.style}
                  onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value as 'realistic' | 'anime' | 'artistic' }))}
                  className="input-field"
                >
                  <option value="realistic">Realistic</option>
                  <option value="anime">Anime</option>
                  <option value="artistic">Artistic</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Prompt Input */}
          {(generationType === 'text-to-video' || generationType === 'text-image-to-video') && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Video Prompt</h2>
                <button className="btn-secondary text-sm flex items-center space-x-1">
                  <Wand2 className="w-4 h-4" />
                  <span>AI Suggest</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="อธิบายวิดีโอที่ต้องการให้ AI สร้าง... เช่น 'A cat playing with a ball in a sunny garden'"
                  rows={4}
                  className="input-field"
                />
                
                {/* Prompt Suggestions */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Palette className="w-4 h-4 mr-1" />
                    ตัวอย่าง Prompts
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {promptSuggestions.slice(0, 4).map((suggestion, index) => (
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
          )}

          {/* Generation Area */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Generate Video</h2>
              <div className="text-sm text-gray-600 flex items-center space-x-4">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {settings.duration}s
                </span>
                <span className="flex items-center">
                  <Monitor className="w-4 h-4 mr-1" />
                  {settings.resolution}
                </span>
              </div>
            </div>

            {!generatedVideo ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  พร้อมสร้างวิดีโอ
                </h3>
                <p className="text-gray-600 mb-6">
                  กำหนดพารามิเตอร์และคลิก Generate เพื่อสร้างวิดีโอ
                </p>
                
                <button
                  onClick={generateVideo}
                  disabled={isGenerating}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      กำลังสร้างวิดีโอ...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Video
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
                      โดยประมาณ {Math.ceil(settings.duration * 30 / 60)} นาที (ขึ้นอยู่กับความยาววิดีโอ)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Video Player */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {videoThumbnail && (
                    <div className="relative">
                      <img
                        src={videoThumbnail}
                        alt="Video thumbnail"
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors">
                          <Play className="w-8 h-8 text-gray-800 ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-gray-600">ระยะเวลา</p>
                    <p className="font-medium">{settings.duration}s</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-gray-600">ความละเอียด</p>
                    <p className="font-medium">{settings.resolution}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-gray-600">FPS</p>
                    <p className="font-medium">{settings.fps}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-gray-600">สไตล์</p>
                    <p className="font-medium">{settings.style}</p>
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
                    href={generatedVideo}
                    download={`generated_video_${Date.now()}.mp4`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลด</span>
                  </a>
                  <button
                    onClick={generateVideo}
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
      {showSaveModal && generatedVideo && (
        <SaveToGoogleDriveModal
          image={videoThumbnail || generatedVideo}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}