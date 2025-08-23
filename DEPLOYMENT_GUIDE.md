# Deployment Guide - AI Gen Pic Flux with Colab

## Overview
This guide helps you deploy the AI Image Generation app to `ptee88.com/aigenpicfluxaiwithcolab` using Render and GitHub.

## Prerequisites
- GitHub account
- Render account (free tier available)
- Git installed on your computer

## Step 1: GitHub Setup

### 1.1 Create GitHub Repository
1. Go to [GitHub](https://github.com) and log in
2. Click "New repository"
3. Name: `ai-gen-pic-flux-colab`
4. Set to Public
5. Don't initialize with README (we have files already)
6. Click "Create repository"

### 1.2 Push Code to GitHub
Run these commands in your project directory:

```bash
git init
git add .
git commit -m "Initial commit: AI Gen Pic Flux with Colab"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-gen-pic-flux-colab.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 2: Render Setup

### 2.1 Connect GitHub to Render
1. Go to [Render](https://render.com) and log in
2. Click "New" → "Static Site"
3. Connect your GitHub account if not already connected
4. Select your repository `ai-gen-pic-flux-colab`

### 2.2 Configure Render Deployment
Use these settings:

- **Name**: `ai-gen-pic-flux-colab`
- **Branch**: `main`
- **Root Directory**: (leave blank)
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `build`

### 2.3 Environment Variables (if needed)
Add any required environment variables in Render dashboard:
- Go to your service → Environment
- Add variables like API keys if your app uses them

## Step 3: Custom Domain Setup

### 3.1 Configure Custom Path
The app is already configured for `/aigenpicfluxaiwithcolab` path:
- `package.json` has correct homepage URL
- `render.yaml` has proper routing rules
- `_redirects` file handles SPA routing

### 3.2 Domain Configuration
1. In Render dashboard, go to your service
2. Go to "Settings" → "Custom Domains"
3. Add domain: `ptee88.com`
4. Configure your DNS to point to Render's servers
5. Render will provide the required DNS settings

## Step 4: Deployment Process

### 4.1 Automatic Deployment
- Every push to `main` branch will trigger automatic deployment
- Build time: ~3-5 minutes
- Render will show build logs

### 4.2 Manual Deployment
If needed, you can manually deploy:
1. Go to your Render service dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

## Step 5: Verify Deployment

1. Wait for deployment to complete
2. Visit: `https://ptee88.com/aigenpicfluxaiwithcolab`
3. Test all major features:
   - AI Generation page
   - Image Enhancement
   - Video Generation
   - Settings page

## Configuration Files Updated

The following files have been configured for the new path:

1. **package.json** - Updated homepage URL
2. **render.yaml** - Updated routing rules
3. **public/_redirects** - Updated SPA routing

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check build logs in Render dashboard
   - Verify all dependencies in `package.json`
   - Make sure Node.js version is compatible

2. **Routing Issues**
   - Verify `_redirects` file is in `public` folder
   - Check `render.yaml` routing rules
   - Test with direct URL access

3. **404 Errors**
   - Ensure `homepage` in `package.json` matches domain path
   - Check if static files are being served correctly

4. **API Connection Issues**
   - Verify environment variables are set
   - Check CORS configuration if using external APIs
   - Test API endpoints separately

## Support

- Render Documentation: https://render.com/docs
- GitHub Documentation: https://docs.github.com
- React Build Documentation: https://create-react-app.dev/docs/deployment/

## Security Notes

The current configuration includes security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff  
- Referrer-Policy: strict-origin-when-cross-origin

Make sure to:
- Never commit API keys or secrets
- Use environment variables for sensitive data
- Keep dependencies updated for security patches