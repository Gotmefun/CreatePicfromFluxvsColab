import React, { useState, useRef } from 'react';
import { waifu2xService, Waifu2xRequest } from '../services/waifu2xService';
import { useAppContext } from '../hooks/useAppContext';
import { 
  Upload, 
  Zap, 
  Download, 
  RefreshCw, 
  Settings,
  ArrowRight,
  Eye,
  EyeOff,
  BarChart3,
  Clock,
  Maximize
} from 'lucide-react';
import SaveToGoogleDriveModal from '../components/SaveToGoogleDriveModal';

export default function ImageEnhancement() {
  const { state } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStats, setProcessingStats] = useState<{
    originalSize: { width: number; height: number };
    enhancedSize: { width: number; height: number };
    processingTime: number;
    scale: number;
  } | null>(null);

  const [settings, setSettings] = useState<Waifu2xRequest>({
    image: '',
    scale: 2,
    denoise: 1,
    format: 'png'
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setOriginalImage(imageData);
        setEnhancedImage(null);
        setProcessingStats(null);
        setSettings(prev => ({ ...prev, image: imageData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setOriginalImage(imageData);
        setEnhancedImage(null);
        setProcessingStats(null);
        setSettings(prev => ({ ...prev, image: imageData }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const result = await waifu2xService.upscaleImage(settings);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.data) {
        setEnhancedImage(result.data.upscaledImage);
        setProcessingStats({
          originalSize: result.data.originalSize,
          enhancedSize: result.data.upscaledSize,
          processingTime: result.data.processingTime,
          scale: settings.scale
        });
      } else {
        alert(`การประมวลผลล้มเหลว: ${result.error}`);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      alert('เกิดข้อผิดพลาดในการปรับปรุงภาพ');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleSave = (options: any) => {
    console.log('Saving enhanced image:', options);
    setShowSaveModal(false);
  };

  const resetProcess = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setProcessingStats(null);
    setProgress(0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Enhancement</h1>
          <p className="text-gray-600">ปรับปรุงคุณภาพและขยายขนาดภาพด้วย Waifu2x AI</p>
        </div>
        <div className="flex items-center space-x-3">
          {enhancedImage && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="btn-secondary flex items-center space-x-2"
            >
              {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showComparison ? 'ซ่อนเปรียบเทียบ' : 'แสดงเปรียบเทียบ'}</span>
            </button>
          )}
          <button
            onClick={resetProcess}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>เริ่มใหม่</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Area */}
          <div className="card p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              อัปโหลดภาพ
            </h3>
            
            {!originalImage ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">คลิกหรือลากไฟล์มาวาง</p>
                <p className="text-xs text-gray-500">รองรับ JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="space-y-3">
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full rounded-lg border"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full btn-secondary text-sm"
                >
                  เปลี่ยนภาพ
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

          {/* Enhancement Settings */}
          <div className="card p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              การตั้งค่า
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scale (ขยาย): {settings.scale}x
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 4, 8].map(scale => (
                    <button
                      key={scale}
                      onClick={() => setSettings(prev => ({ ...prev, scale: scale as 2 | 4 | 8 }))}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        settings.scale === scale 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {scale}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Noise Reduction: {settings.denoise}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3].map(level => (
                    <button
                      key={level}
                      onClick={() => setSettings(prev => ({ ...prev, denoise: level as 0 | 1 | 2 | 3 }))}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        settings.denoise === level 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  0=ไม่ลด, 3=ลดมากสุด
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปแบบไฟล์
                </label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as 'png' | 'jpg' | 'webp' }))}
                  className="input-field"
                >
                  <option value="png">PNG (คุณภาพสูง)</option>
                  <option value="jpg">JPG (ไฟล์เล็ก)</option>
                  <option value="webp">WebP (สมดุล)</option>
                </select>
              </div>
            </div>

            <button
              onClick={processImage}
              disabled={!originalImage || isProcessing}
              className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  กำลังประมวลผล...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  ปรับปรุงภาพ
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-4">
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
          </div>

          {/* Processing Stats */}
          {processingStats && (
            <div className="card p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                ผลลัพธ์
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ขนาดเดิม:</span>
                  <span className="font-medium">
                    {processingStats.originalSize.width}×{processingStats.originalSize.height}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ขนาดใหม่:</span>
                  <span className="font-medium text-green-600">
                    {processingStats.enhancedSize.width}×{processingStats.enhancedSize.height}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">การขยาย:</span>
                  <span className="font-medium">{processingStats.scale}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    เวลาที่ใช้:
                  </span>
                  <span className="font-medium">
                    {(processingStats.processingTime / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Display Area */}
        <div className="lg:col-span-3">
          {!originalImage ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Maximize className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                เริ่มต้นปรับปรุงภาพของคุณ
              </h3>
              <p className="text-gray-600 mb-6">
                อัปโหลดภาพเพื่อเพิ่มความละเอียดและปรับปรุงคุณภาพด้วย AI
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">2x</span>
                  </div>
                  <p className="font-medium text-blue-900">Upscale 2x</p>
                  <p className="text-blue-700">เหมาะสำหรับภาพทั่วไป</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 font-bold">4x</span>
                  </div>
                  <p className="font-medium text-green-900">Upscale 4x</p>
                  <p className="text-green-700">สำหรับภาพขนาดเล็ก</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">8x</span>
                  </div>
                  <p className="font-medium text-purple-900">Upscale 8x</p>
                  <p className="text-purple-700">สำหรับ icon หรือ pixel art</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Comparison */}
              <div className="card p-6">
                {showComparison && enhancedImage ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">ภาพต้นฉบับ</h3>
                        {processingStats && (
                          <span className="text-sm text-gray-600">
                            {processingStats.originalSize.width}×{processingStats.originalSize.height}
                          </span>
                        )}
                      </div>
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full rounded-lg border shadow-sm"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 flex items-center">
                          ภาพที่ปรับปรุงแล้ว
                          <ArrowRight className="w-4 h-4 mx-2 text-green-600" />
                          <span className="text-green-600">{settings.scale}x</span>
                        </h3>
                        {processingStats && (
                          <span className="text-sm text-green-600 font-medium">
                            {processingStats.enhancedSize.width}×{processingStats.enhancedSize.height}
                          </span>
                        )}
                      </div>
                      <img
                        src={enhancedImage}
                        alt="Enhanced"
                        className="w-full rounded-lg border shadow-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {enhancedImage ? 'ภาพที่ปรับปรุงแล้ว' : 'ภาพต้นฉบับ'}
                      </h3>
                      {processingStats && enhancedImage && (
                        <span className="text-sm text-green-600 font-medium">
                          {processingStats.enhancedSize.width}×{processingStats.enhancedSize.height}
                        </span>
                      )}
                    </div>
                    <img
                      src={enhancedImage || originalImage}
                      alt={enhancedImage ? 'Enhanced' : 'Original'}
                      className="w-full rounded-lg border shadow-sm"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {enhancedImage && (
                  <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Save to Drive</span>
                    </button>
                    <a
                      href={enhancedImage}
                      download={`enhanced_${Date.now()}.${settings.format}`}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลด</span>
                    </a>
                    <button
                      onClick={processImage}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>ประมวลผลใหม่</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && enhancedImage && (
        <SaveToGoogleDriveModal
          image={enhancedImage}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}