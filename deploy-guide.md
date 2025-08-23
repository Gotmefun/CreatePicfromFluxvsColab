# 🚀 Deployment Guide - AI Image Generation

## 📋 Pre-deployment Checklist

### ✅ Files Ready
- [x] `package.json` - homepage configured
- [x] `src/App.tsx` - basename setup for production
- [x] `public/_redirects` - SPA routing rules
- [x] `render.yaml` - Render.com configuration
- [x] `.env.production` - production environment variables
- [x] `README.md` - project documentation

### ✅ Configuration
- [x] Base path: `/webaigenpicturebyflux`
- [x] Production URL: `https://ptee88.com/webaigenpicturebyflux/`
- [x] Environment variables setup
- [x] Build optimization

## 🌐 Deployment Options

### Option 1: Render.com (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Image Generation system"
   git branch -M main
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Connect GitHub repository
   - Select "Static Site" service

3. **Configuration**
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `./build`
   - **Auto-Deploy**: Enable for main branch

4. **Custom Domain**
   - In Render dashboard → Settings → Custom Domains
   - Add: `ptee88.com` with path `/webaigenpicturebyflux`

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure `vercel.json`**
   ```json
   {
     "rewrites": [
       {
         "source": "/webaigenpicturebyflux/(.*)",
         "destination": "/webaigenpicturebyflux/index.html"
       }
     ]
   }
   ```

### Option 3: Netlify

1. **Build**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Drag `build` folder to Netlify
   - Or connect GitHub repository

3. **Configure redirects**
   - `_redirects` file already included

## ⚙️ Environment Setup

### Production Environment Variables
```env
REACT_APP_BASE_PATH=/webaigenpicturebyflux
REACT_APP_APP_NAME=AI Image Generation - Flux
PUBLIC_URL=https://ptee88.com/webaigenpicturebyflux
```

### Google Services Setup

#### Google Colab
1. Open Colab notebook with Flux AI
2. Run setup cells
3. Get public URL (ngrok/Colab)
4. Configure in app Settings

#### Google Drive API
1. Google Cloud Console → New Project
2. Enable Google Drive API
3. Create credentials:
   - API Key
   - OAuth 2.0 Client ID
4. Add authorized domain: `ptee88.com`
5. Configure in app Settings

## 🔧 Build Optimization

### Performance
```bash
# Analyze bundle size
npm run build
npx serve -s build

# Check performance
npm install -g lighthouse
lighthouse https://ptee88.com/webaigenpicturebyflux/
```

### Security Headers
Already configured in `render.yaml`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## 🧪 Testing

### Local Testing
```bash
# Test production build locally
npm run build
npx serve -s build -l 3000

# Visit: http://localhost:3000/webaigenpicturebyflux/
```

### Pre-deployment Tests
- [ ] Login functionality
- [ ] Navigation between pages
- [ ] Asset loading (CSS, JS, images)
- [ ] API endpoints configuration
- [ ] Mobile responsiveness

## 📊 Monitoring

### Performance Monitoring
- Use browser DevTools
- Monitor Core Web Vitals
- Check bundle size regularly

### Error Tracking
- Console errors
- Network failures
- API response monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
name: Deploy to Render
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build
    - name: Deploy to Render
      # Render auto-deploys from GitHub
```

## 🚨 Troubleshooting

### Common Issues

1. **404 on refresh**
   - Check `_redirects` file
   - Verify SPA routing setup

2. **Assets not loading**
   - Check `PUBLIC_URL` environment variable
   - Verify `homepage` in package.json

3. **API CORS errors**
   - Configure Google Colab CORS
   - Check API endpoint URLs

4. **Build failures**
   - Check Node.js version (16+)
   - Clear node_modules and reinstall

### Debug Commands
```bash
# Check environment variables
npm run start # Should show correct base path

# Verify build output
npm run build
ls build/static # Check asset paths

# Test production locally
npx serve -s build -l 3000
```

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables
3. Test locally before deploying
4. Check network requests in DevTools

---

**Ready to deploy!** 🎉 Your AI Image Generation system is configured for production at `https://ptee88.com/webaigenpicturebyflux/`