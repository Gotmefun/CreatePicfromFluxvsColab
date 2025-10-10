import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Project, Reference, GeneratedImage, AppSettings } from '../types';

interface AppState {
  projects: Project[];
  currentProject: Project | null;
  references: Reference[];
  generatedImages: GeneratedImage[];
  settings: AppSettings;
   loading: boolean;
}

type AppAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_REFERENCES'; payload: Reference[] }
  | { type: 'ADD_REFERENCE'; payload: Reference }
  | { type: 'UPDATE_REFERENCE'; payload: Reference }
  | { type: 'DELETE_REFERENCE'; payload: string }
  | { type: 'SET_GENERATED_IMAGES'; payload: GeneratedImage[] }
  | { type: 'ADD_GENERATED_IMAGE'; payload: GeneratedImage }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  projects: [],
  currentProject: null,
  references: [],
  generatedImages: [],
  settings: {
    googleDrive: {
      clientId: '',
      apiKey: '',
      discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      scopes: ['https://www.googleapis.com/auth/drive.file']
    },
    colab: {
      notebookUrl: '',
      apiEndpoint: ''
    },
    defaultModel: 'flux-ai',
    autoSave: true,
    theme: 'light',
    nsfwMode: false
  },
   loading: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p),
        currentProject: state.currentProject?.id === action.payload.id ? action.payload : state.currentProject
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject
      };
    
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    
    case 'SET_REFERENCES':
      return { ...state, references: action.payload };
    
    case 'ADD_REFERENCE':
      return { ...state, references: [...state.references, action.payload] };
    
     case 'UPDATE_REFERENCE':
    return {
      ...state,
      references: state.references.map(r => r.id   === action.payload.id ? action.payload : r)
    };
    case 'DELETE_REFERENCE':
      return { ...state, references: state.references.filter(r => r.id !== action.payload) };
    
    case 'SET_GENERATED_IMAGES':
      return { ...state, generatedImages: action.payload };
    
    case 'ADD_GENERATED_IMAGE':
      return { ...state, generatedImages: [...state.generatedImages, action.payload] };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('aiImageGenApp');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.projects) dispatch({ type: 'SET_PROJECTS', payload: parsed.projects });
        if (parsed.references) dispatch({ type: 'SET_REFERENCES', payload: parsed.references });
        if (parsed.generatedImages) dispatch({ type: 'SET_GENERATED_IMAGES', payload: parsed.generatedImages });
        if (parsed.settings) dispatch({ type: 'SET_SETTINGS', payload: parsed.settings });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      projects: state.projects,
      references: state.references,
      generatedImages: state.generatedImages,
      settings: state.settings
    };
    localStorage.setItem('aiImageGenApp', JSON.stringify(dataToSave));
  }, [state.projects, state.references, state.generatedImages, state.settings]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
