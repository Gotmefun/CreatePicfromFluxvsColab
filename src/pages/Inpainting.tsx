import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Upload, Download, Save, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import SaveToGoogleDriveModal from '../components/SaveToGoogleDriveModal';

interface Point {
  x: number;
  y: number;
}

export default function Inpainting() {
  const { state, dispatch } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [steps, setSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [denoisingStrength, setDenoisingStrength] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

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
        const imageUrl = event.target?.result as string;
        setBaseImage(imageUrl);
        
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setZoom(1);
          setPan({ x: 0, y: 0 });
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImageToCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !originalImage) return;

    canvas.width = 512;
    canvas.height = 512;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const scale = Math.min(512 / originalImage.width, 512 / originalImage.height) * zoom;
    const scaledWidth = originalImage.width * scale;
    const scaledHeight = originalImage.height * scale;
    
    const x = (512 - scaledWidth) / 2 + pan.x;
    const y = (512 - scaledHeight) / 2 + pan.y;
    
    ctx.drawImage(originalImage, x, y, scaledWidth, scaledHeight);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const point = getCanvasCoordinates(e);
    setLastPoint(point);
    drawBrush(point);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const currentPoint = getCanvasCoordinates(e);
    if (lastPoint) {
      drawLine(lastPoint, currentPoint);
    }
    setLastPoint(currentPoint);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const drawBrush = (point: Point) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(point.x, point.y, brushSize / 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawLine = (start: Point, end: Point) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    if (originalImage) {
      drawImageToCanvas();
    }
  };

  const processInpainting = async () => {
    if (!baseImage || !prompt.trim()) {
      alert('กรุณาเลือกรูปและใส่ prompt');
      return;
    }

    setIsProcessing(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      const maskDataUrl = canvas.toDataURL('image/png');

      // Mock processing for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock result image
      const mockResult = baseImage; // Use original image as mock result
      setResultImage(mockResult);

    } catch (error) {
      console.error('Inpainting error:', error);
      alert('เกิดข้อผิดพลาดในการประมวลผล: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleSave = async (metadata: any) => {
    if (!resultImage) return;

    try {
      const timestamp = Date.now().toString();
      const newImage = {
        id: timestamp,
        filename: `inpainted-${timestamp}.png`,
        url: resultImage,
        prompt,
        negativePrompt: negativePrompt || '',
        settings: {
          model: state.settings.defaultModel,
          steps,
          cfgScale: guidanceScale,
          width: 512,
          height: 512,
          denoisingStrength
        },
        references: [],
        projectId: state.currentProject?.id || '',
        createdAt: new Date(),
        metadata: {
          width: 512,
          height: 512,
          format: 'png',
          size: 0,
          tags: ['inpainting'],
          description: prompt
        }
      };

      dispatch({ type: 'ADD_GENERATED_IMAGE', payload: newImage });
      setShowSaveModal(false);
      alert('บันทึกสำเร็จ!');
    } catch (error) {
      console.error('Save error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));

  const handlePan = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 2) {
      e.preventDefault();
      const movementX = e.movementX;
      const movementY = e.movementY;
      setPan(prev => ({
        x: prev.x + movementX,
        y: prev.y + movementY
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Inpainting</h1>
        <p className="text-gray-600">แก้ไขส่วนที่ต้องการของรูปภาพด้วย AI โดยการระบายพื้นที่และใส่ prompt</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">อัปโหลดรูปภาพ</h3>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">คลิกเพื่อเลือกรูปภาพ</p>
              <p className="text-sm text-gray-500">รองรับ PNG, JPG, JPEG</p>
            </div>
          </div>

          <div className="card p-6">
            {!baseImage ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">เลือกรูปภาพเพื่อเริ่มต้น</p>
                <p className="text-gray-500">ระบายพื้นที่ที่ต้องการแก้ไขด้วยเมาส์</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">แก้ไขรูปภาพ</h3>
                  <div className="flex items-center space-x-2">
                    <button onClick={zoomOut} className="btn-secondary p-2" title="ซูมออก">
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-[60px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button onClick={zoomIn} className="btn-secondary p-2" title="ซูมเข้า">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={clearCanvas} className="btn-secondary p-2" title="ล้างการระบาย">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={512}
                    height={512}
                    className="border border-gray-300 rounded-lg cursor-crosshair max-w-full h-auto"
                    onMouseDown={startDrawing}
                    onMouseMove={(e) => {
                      draw(e);
                      handlePan(e);
                    }}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ขนาดพู่กัน: {brushSize}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  เคล็ดลับ: คลิกซ้ายเพื่อระบาย, คลิกขวาค้างเพื่อเลื่อนภาพ
                </p>
              </div>
            )}
          </div>

          {baseImage && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt สำหรับพื้นที่ที่ระบาย</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="อธิบายสิ่งที่ต้องการให้ปรากฏในพื้นที่ที่ระบาย..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Negative Prompt</label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="input-field"
                    rows={2}
                    placeholder="สิ่งที่ไม่ต้องการให้ปรากฏ..."
                  />
                </div>

                <button
                  onClick={processInpainting}
                  disabled={isProcessing || !prompt.trim()}
                  className="btn-primary w-full"
                >
                  {isProcessing ? 'กำลังประมวลผล...' : 'เริ่ม Inpainting'}
                </button>
              </div>
            </div>
          )}

          {resultImage && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">ผลลัพธ์</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="btn-primary text-sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save to Drive
                  </button>
                  <a
                    href={resultImage || ''}
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
                  <img src={baseImage || ''} alt="Original" className="w-full rounded-lg border" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">หลัง</p>
                  <img src={resultImage || ''} alt="Result" className="w-full rounded-lg border" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">พารามิเตอร์</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steps: {steps}
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guidance Scale: {guidanceScale}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>

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
                  onChange={(e) => setDenoisingStrength(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ความแรงในการแก้ไข (1.0 = เปลี่ยนแปลงมาก)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {showSaveModal && resultImage && (
        <SaveToGoogleDriveModal
          image={resultImage || ''}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
