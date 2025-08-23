import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './hooks/useAppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectCreate from './pages/ProjectCreate';
import ReferenceManager from './pages/ReferenceManager';
import AIGeneration from './pages/AIGeneration';
import Inpainting from './pages/Inpainting';
import ProjectGallery from './pages/ProjectGallery';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import Login from './pages/Login';
import ImageEnhancement from './pages/ImageEnhancement';
import VideoGeneration from './pages/VideoGeneration';
import PoseControl from './pages/PoseControl';

function App() {
  const basePath = '';

  return (
    <AppProvider>
      <Router basename={basePath}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="project/create" element={<ProjectCreate />} />
            <Route path="references" element={<ReferenceManager />} />
            <Route path="generate" element={<AIGeneration />} />
            <Route path="enhance" element={<ImageEnhancement />} />
            <Route path="video" element={<VideoGeneration />} />
            <Route path="pose" element={<PoseControl />} />
            <Route path="inpainting" element={<Inpainting />} />
            <Route path="gallery" element={<ProjectGallery />} />
            <Route path="settings" element={<Settings />} />
            <Route path="statistics" element={<Statistics />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;