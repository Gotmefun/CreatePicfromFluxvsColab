import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AppSettings } from '../types';
import { 
  Save, 
  Settings as SettingsIcon, 
  Link, 
  Database, 
  Palette, 
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function Settings() {
  const { state, dispatch } = useAppContext();
  const [settings, setSettings] = useState<AppSettings>(state.settings);
  const [activeTab, setActiveTab] = useState<'general' | 'colab' | 'drive' | 'models'>('general');
  const [testingConnection, setTestingConnection] = useState<'colab' | 'drive' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    colab: 'connected' | 'disconnected' | 'testing';
    drive: 'connected' | 'disconnected' | 'testing';
  }>({
    colab: 'disconnected',
    drive: 'disconnected'
  });

  const tabs = [
    { id: 'general', name: 'ทั่วไป', icon: SettingsIcon },
    { id: 'colab', name: 'Google Colab', icon: Link },
    { id: 'drive', name: 'Google Drive', icon: Database },
    { id: 'models', name: 'AI Models', icon: Palette },
  ] as const;

  const handleSave = () => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    alert('บันทึกการตั้งค่าเรียบร้อย');
  };

  const testConnection = async (service: 'colab' | 'drive') => {
    setTestingConnection(service);
    setConnectionStatus(prev => ({ ...prev, [service]: 'testing' }));

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success/failure
      const isSuccess = Math.random() > 0.3;
      setConnectionStatus(prev => ({ 
        ...prev, 
        [service]: isSuccess ? 'connected' : 'disconnected' 
      }));
      
      if (!isSuccess) {
        alert(`ไม่สามารถเชื่อมต่อ ${service === 'colab' ? 'Google Colab' : 'Google Drive'} ได้`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [service]: 'disconnected' }));
    } finally {
      setTestingConnection(null);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-image-gen-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          alert('นำเข้าการตั้งค่าเรียบร้อย');
        } catch (error) {
          alert('ไฟล์การตั้งค่าไม่ถูกต้อง');
        }
      };
      reader.readAsText(file);
    }
  };

  const getStatusIcon = (status: 'connected' | 'disconnected' | 'testing') => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusText = (status: 'connected' | 'disconnected' | 'testing') => {
    switch (status) {
      case 'connected':
        return 'เชื่อมต่อแล้ว';
      case 'disconnected':
        return 'ไม่ได้เชื่อมต่อ';
      case 'testing':
        return 'กำลังทดสอบ...';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">จัดการการตั้งค่าระบบ</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import Settings
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          <button onClick={exportSettings} className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </button>
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            บันทึก
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">การตั้งค่าทั่วไป</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Model เริ่มต้น
                    </label>
                    <select
                      value={settings.defaultModel}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        defaultModel: e.target.value as any 
                      }))}
                      className="input-field"
                    >
                      <option value="flux-ai">Flux AI</option>
                      <option value="stable-diffusion">Stable Diffusion</option>
                      <option value="sdxl">SDXL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ธีม
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        theme: e.target.value as 'light' | 'dark' 
                      }))}
                      className="input-field"
                    >
                      <option value="light">สว่าง</option>
                      <option value="dark">มืด</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        autoSave: e.target.checked 
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      บันทึกรูปอัตโนมัติไปยัง Google Drive
                    </span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1 ml-6">
                    เมื่อเปิดใช้งาน รูปที่สร้างจะถูกบันทึกไปยัง Google Drive โดยอัตโนมัติ
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'colab' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Google Colab Integration</h2>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(connectionStatus.colab)}
                    <span className="text-sm text-gray-600">
                      {getStatusText(connectionStatus.colab)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-1">วิธีตั้งค่า Google Colab</h3>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>เปิด Google Colab และโหลด Flux AI notebook</li>
                        <li>รัน setup cells เพื่อติดตั้ง dependencies</li>
                        <li>หา API endpoint URL จาก notebook</li>
                        <li>คัดลอก URL มาใส่ในช่องด้านล่าง</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colab Notebook URL
                  </label>
                  <input
                    type="url"
                    value={settings.colab.notebookUrl}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      colab: { ...prev.colab, notebookUrl: e.target.value }
                    }))}
                    placeholder="https://colab.research.google.com/drive/..."
                    className="input-field"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    URL ของ Google Colab notebook ที่รัน Flux AI
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Endpoint
                  </label>
                  <input
                    type="url"
                    value={settings.colab.apiEndpoint}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      colab: { ...prev.colab, apiEndpoint: e.target.value }
                    }))}
                    placeholder="https://xxxx-xx-xx-xx-xx.ngrok-free.app"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    API endpoint URL ที่ได้จาก ngrok หรือ Colab
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auth Token (ไม่บังคับ)
                  </label>
                  <input
                    type="password"
                    value={settings.colab.authToken || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      colab: { ...prev.colab, authToken: e.target.value }
                    }))}
                    placeholder="Token สำหรับ authentication"
                    className="input-field"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => testConnection('colab')}
                    disabled={testingConnection === 'colab'}
                    className="btn-primary disabled:opacity-50"
                  >
                    {testingConnection === 'colab' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        กำลังทดสอบ...
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        ทดสอบการเชื่อมต่อ
                      </>
                    )}
                  </button>
                  
                  <a
                    href="https://colab.research.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    เปิด Google Colab
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'drive' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Google Drive Integration</h2>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(connectionStatus.drive)}
                    <span className="text-sm text-gray-600">
                      {getStatusText(connectionStatus.drive)}
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Database className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-900 mb-1">การตั้งค่า Google Drive API</h3>
                      <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                        <li>ไปที่ Google Cloud Console</li>
                        <li>สร้างโปรเจกต์ใหม่หรือเลือกโปรเจกต์ที่มี</li>
                        <li>เปิดใช้งาน Google Drive API</li>
                        <li>สร้าง API credentials (API Key และ Client ID)</li>
                        <li>ใส่ข้อมูลในช่องด้านล่าง</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={settings.googleDrive.clientId}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        googleDrive: { ...prev.googleDrive, clientId: e.target.value }
                      }))}
                      placeholder="xxxxx.apps.googleusercontent.com"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={settings.googleDrive.apiKey}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        googleDrive: { ...prev.googleDrive, apiKey: e.target.value }
                      }))}
                      placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxx"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discovery Document URL
                  </label>
                  <input
                    type="url"
                    value={settings.googleDrive.discoveryDoc}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      googleDrive: { ...prev.googleDrive, discoveryDoc: e.target.value }
                    }))}
                    className="input-field"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scopes
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {settings.googleDrive.scopes.map((scope, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {scope}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    สิทธิ์ที่ต้องการในการเข้าถึง Google Drive
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => testConnection('drive')}
                    disabled={testingConnection === 'drive'}
                    className="btn-primary disabled:opacity-50"
                  >
                    {testingConnection === 'drive' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        กำลังทดสอบ...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        ทดสอบการเชื่อมต่อ
                      </>
                    )}
                  </button>
                  
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Google Cloud Console
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'models' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">AI Models Management</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card p-4 border-2 border-primary-200 bg-primary-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-primary-900">Flux AI</h3>
                      <span className="text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded">
                        ปัจจุบัน
                      </span>
                    </div>
                    <p className="text-sm text-primary-800 mb-3">
                      โมเดล AI คุณภาพสูงสำหรับการสร้างภาพ
                    </p>
                    <div className="text-xs text-primary-700">
                      <p>ขนาด: ~8GB</p>
                      <p>คุณภาพ: สูงมาก</p>
                      <p>ความเร็ว: ปานกลาง</p>
                    </div>
                  </div>

                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Stable Diffusion</h3>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        พร้อมใช้
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      โมเดลพื้นฐานที่เสถียรและรวดเร็ว
                    </p>
                    <div className="text-xs text-gray-500">
                      <p>ขนาด: ~4GB</p>
                      <p>คุณภาพ: ดี</p>
                      <p>ความเร็ว: เร็ว</p>
                    </div>
                  </div>

                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">SDXL</h3>
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                        Beta
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      เวอร์ชันขยายสำหรับภาพความละเอียดสูง
                    </p>
                    <div className="text-xs text-gray-500">
                      <p>ขนาด: ~12GB</p>
                      <p>คุณภาพ: สูงมาก</p>
                      <p>ความเร็ว: ช้า</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-900 mb-1">
                        ข้อจำกัดพื้นที่ Google Drive
                      </h3>
                      <p className="text-sm text-yellow-800">
                        ด้วยพื้นที่ 15GB ฟรี คุณสามารถเก็บ AI model ได้ประมาณ 1-2 โมเดล พร้อมกับไฟล์อื่นๆ 
                        หากต้องการใช้หลายโมเดล แนะนำให้อัปเกรด Google Drive เป็น 100GB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">การจัดการโมเดล</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="btn-secondary flex items-center justify-center">
                      <Download className="w-4 h-4 mr-2" />
                      ดาวน์โหลดโมเดลใหม่
                    </button>
                    <button className="btn-secondary flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      อัปเดตโมเดล
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}