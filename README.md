# AI Image Generation - Flux

Professional AI-powered image creation system with Google Colab integration.

## 🚀 Features

- **AI Image Generation**: Create high-quality images using Flux AI model
- **Reference System**: Use face, product, environment, and pose references
- **Project Management**: Organize work into projects with templates
- **Inpainting**: Edit specific parts of images with mask painting
- **Google Drive Integration**: Automatic backup and storage
- **Template System**: Portrait, Product, Corporate, Creative, Fashion, Electronics
- **Statistics & Monitoring**: Track usage and performance

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **State Management**: Context API
- **Routing**: React Router v6
- **Backend Integration**: Google Colab API + Google Drive API
- **Deployment**: Render/Vercel ready

## 📁 Project Structure

```
src/
├── components/          # Reusable components
├── pages/              # Page components
├── hooks/              # Custom hooks
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
└── App.tsx             # Main app component
```

## 🔧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-image-generation-flux
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Configure Google API credentials
   - Set Colab endpoint URL

4. **Development**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 Deployment

### Render.com
1. Connect your GitHub repository
2. Set build command: `npm ci && npm run build`
3. Set publish directory: `./build`
4. Deploy automatically with every push

### Custom Domain Setup
- The app is configured to run under `/webaigenpicturebyflux/` path
- Production URL: `https://ptee88.com/webaigenpicturebyflux/`

## ⚙️ Configuration

### Google Colab Setup
1. Open Google Colab and load Flux AI notebook
2. Run setup cells to install dependencies
3. Get the API endpoint URL (ngrok or Colab public URL)
4. Configure in Settings page

### Google Drive Setup
1. Go to Google Cloud Console
2. Create project and enable Drive API
3. Create credentials (API Key + Client ID)
4. Configure in Settings page

## 🎯 Usage

1. **Login**: Use password `admin123`
2. **Create Project**: Choose template and upload references
3. **Generate Images**: Select references + write prompt + generate
4. **Edit Images**: Use inpainting for specific modifications
5. **Save to Drive**: Automatic backup with metadata and tags

## 📊 Key Features

### AI Generation
- Multiple AI models (Flux AI, Stable Diffusion, SDXL)
- ControlNet integration for reference-guided generation
- Adjustable parameters (steps, CFG scale, dimensions)

### Project Management
- Template-based project creation
- Reference categorization and management
- Project-specific galleries and statistics

### Cloud Integration
- Google Colab for AI processing
- Google Drive for storage and backup
- Automatic metadata and thumbnail generation

## 🔒 Security

- Password-protected access
- Secure API token handling
- Environment variable configuration
- HTTPS ready deployment

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and desktop
- Progressive Web App (PWA) features

## 📝 License

Private project - All rights reserved

## 🤝 Support

For issues and questions, please contact the development team.

---

Built with ❤️ for professional AI image generation"# CreatePicfromFluxvsColab" 
"# flux-ai-image-generator" 

