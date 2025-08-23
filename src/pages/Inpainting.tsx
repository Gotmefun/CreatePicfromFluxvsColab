import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { InpaintingMask } from '../types';
import { 
  Upload, 
  Brush, 
  Eraser, 
  RotateCcw, 
  Play, 
  Save, 
  Settings, 
  Eye, 
  EyeOff,
  Palette,
  Download,
  RefreshCw,
  Minus,
  Plus,
  Move,
  Square
} from 'lucide-react';
import SaveToGoogleDriveModal from '../components/SaveToGoogleDriveModal';

export default function Inpainting() {
  const { state } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [showMask, setShowMask] = useState(true);
  const [maskOpacity, setMaskOpacity] = useState(0.7);
  const [prompt, setPrompt] = useState('');
  const [denoisingStrength, setDenoisingStrength] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (baseImage && originalImage) {
      drawImageToCanvas();
    }
  }, [baseImage, originalImage, zoom, pan]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setBaseImage(event.target?.result as string);
          setResultImage(null);
          clearMask();
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImageToCanvas = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    // Set canvas size
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    maskCanvas.width = originalImage.width;
    maskCanvas.height = originalImage.height;

    // Draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);

    // Apply zoom and pan
    canvas.style.transform = `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`;
    maskCanvas.style.transform = `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`;
  };

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const ctx = maskCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
  };

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width * zoom);
    const scaleY = canvas.height / (rect.height * zoom);
    
    return {
      x: (e.clientX - rect.left - pan.x) * scaleX,
      y: (e.clientY - rect.top - pan.y) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (tool === 'pan') {
      setIsPanning(true);
      setLastPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !maskCanvasRef.current) return;

    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);

    ctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 0, 0, ${maskOpacity})`;
    ctx.fill();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - lastPan.x,
        y: e.clientY - lastPan.y
      });
      return;
    }

    if (isDrawing) {
      draw(e);
    }
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    setZoom(newZoom);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const processInpainting = async () => {
    if (!baseImage || !prompt.trim()) {
      alert('กรุณาเลือกรูปและใส่ prompt');
      return;
    }

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskData = maskCanvas.toDataURL();
    if (maskData === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==') {
      alert('กรุณาระบายพื้นที่ที่ต้องการแก้ไข');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create mock result (replace with actual API call)
      const mockResult = createMockInpaintedImage();
      setResultImage(mockResult);

    } catch (error) {
      console.error('Inpainting failed:', error);
      alert('เกิดข้อผิดพลาดในการประมวลผล');
    } finally {
      setIsProcessing(false);
    }
  };

  const createMockInpaintedImage = () => {
    if (!originalImage) return '';

    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw original image
      ctx.drawImage(originalImage, 0, 0);
      
      // Add some visual indication of inpainting
      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      ctx.fillRect(originalImage.width * 0.3, originalImage.height * 0.3, 
                   originalImage.width * 0.4, originalImage.height * 0.4);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Inpainted Area', canvas.width / 2, canvas.height / 2);
    }
    
    return canvas.toDataURL();
  };

  const handleSave = (options: any) => {
    console.log('Saving inpainted image:', options);
    setShowSaveModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inpainting</h1>
          <p className="text-gray-600">แก้ไขส่วนต่างๆ ของภาพด้วย AI</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary flex items-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>เลือกรูป</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tools Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Drawing Tools */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-4">เครื่องมือ</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTool('brush')}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                    tool === 'brush' 
                      ? 'border-primary-500 bg-primary-50 text-primary-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Brush className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                    tool === 'eraser' 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Eraser className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ขนาดแปรง: {brushSize}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความโปร่งใส: {Math.round(maskOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={maskOpacity}
                  onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMask(!showMask)}
                  className="btn-secondary flex items-center space-x-1"
                >
                  {showMask ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="text-sm">Mask</span>
                </button>
                <button
                  onClick={clearMask}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">Clear</span>
                </button>
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-4">มุมมอง</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Zoom: {Math.round(zoom * 100)}%</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleZoom(-0.1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleZoom(0.1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={resetView}
                className="w-full btn-secondary text-sm"
              >
                รีเซ็ตมุมมอง
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 mb-4">การตั้งค่า</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Denoising Strength: {denoisingStrength}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={denoisingStrength}
                  onChange={(e) => setDenoisingStrength(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 mt-1">
                  สูง = เปลี่ยนแปลงมาก, ต่ำ = เปลี่ยนแปลงน้อย
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Canvas */}
          <div className="card p-6">
            {!baseImage ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">อัปโหลดรูปเพื่อเริ่มแก้ไข</h3>
                <p className="text-gray-600">รองรับ JPG, PNG ขนาดไม่เกิน 10MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative overflow-hidden bg-gray-100 rounded-lg" style={{ height: '500px' }}>
                  <canvas
                    ref={canvasRef}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <canvas
                    ref={maskCanvasRef}
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ${
                      showMask ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  
                  {/* Brush Preview */}
                  <div 
                    className="brush-preview"
                    style={{
                      width: `${brushSize}px`,
                      height: `${brushSize}px`,
                      borderColor: tool === 'brush' ? '#3b82f6' : '#ef4444'
                    }}
                  />
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>💡 ใช้เมาส์ระบายพื้นที่ที่ต้องการแก้ไข แล้วใส่ prompt อธิบายสิ่งที่ต้องการให้เปลี่ยน</p>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          {baseImage && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt สำหรับพื้นที่ที่ระบาย</h3>
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="อธิบายสิ่งที่ต้องการให้ปรากฏในพื้นที่ที่ระบาย เช่น 'holding iPhone' หรือ 'beautiful flowers'"
                  rows={3}
                  className="input-field"
                />
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>ตัวอย่าง: "holding smartphone", "red rose flowers", "mountain landscape"</p>
                  </div>
                  <button
                    onClick={processInpainting}
                    disabled={isProcessing || !prompt.trim()}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>กำลังประมวลผล...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>เริ่มแก้ไข</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {resultImage && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">ผลลัพธ์</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="btn-primary text-sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save to Drive
                  </button>
                  <a
                    href={resultImage}
                    download="inpainted-image.png"
                    className="btn-secondary text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">ก่อน</p>
                  <img src={baseImage} alt="Original" className="w-full rounded-lg border" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">หลัง</p>
                  <img src={resultImage} alt="Result" className="w-full rounded-lg border" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Save Modal */}
      {showSaveModal && resultImage && (
        <SaveToGoogleDriveModal
          image={resultImage}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}