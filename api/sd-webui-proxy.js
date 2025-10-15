/**
 * Stable Diffusion WebUI API Proxy
 * เชื่อมต่อกับ Stable Diffusion WebUI API จาก Google Colab
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SD WebUI Proxy is running' });
});

/**
 * Text-to-Image Generation
 * POST /api/txt2img
 */
app.post('/api/txt2img', async (req, res) => {
  try {
    const {
      sd_webui_endpoint,
      prompt,
      negative_prompt = '',
      steps = 20,
      cfg_scale = 7,
      width = 512,
      height = 512,
      seed = -1,
      sampler_name = 'Euler a',
      batch_size = 1,
      n_iter = 1
    } = req.body;

    if (!sd_webui_endpoint) {
      return res.status(400).json({
        success: false,
        error: 'SD WebUI endpoint is required'
      });
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    console.log('🎨 Generating image with SD WebUI...');
    console.log('Endpoint:', sd_webui_endpoint);
    console.log('Prompt:', prompt.substring(0, 100));

    const payload = {
      prompt,
      negative_prompt,
      steps,
      cfg_scale,
      width,
      height,
      seed,
      sampler_name,
      batch_size,
      n_iter,
      override_settings: {
        sd_model_checkpoint: req.body.model_checkpoint || undefined,
        sd_vae: req.body.vae || undefined
      }
    };

    const response = await fetch(`${sd_webui_endpoint}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 300000 // 5 minutes
    });

    if (!response.ok) {
      throw new Error(`SD WebUI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      throw new Error('No images generated');
    }

    // ส่งกลับรูปแรก (base64)
    res.json({
      success: true,
      image: `data:image/png;base64,${data.images[0]}`,
      info: data.info ? JSON.parse(data.info) : null,
      parameters: data.parameters
    });

  } catch (error) {
    console.error('❌ Generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate image'
    });
  }
});

/**
 * Image-to-Image Generation
 * POST /api/img2img
 */
app.post('/api/img2img', async (req, res) => {
  try {
    const {
      sd_webui_endpoint,
      init_images,
      prompt,
      negative_prompt = '',
      steps = 20,
      cfg_scale = 7,
      width = 512,
      height = 512,
      denoising_strength = 0.75,
      seed = -1,
      sampler_name = 'Euler a'
    } = req.body;

    if (!sd_webui_endpoint) {
      return res.status(400).json({
        success: false,
        error: 'SD WebUI endpoint is required'
      });
    }

    if (!init_images || init_images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Initial image is required'
      });
    }

    console.log('🖼️ img2img with SD WebUI...');

    const payload = {
      init_images,
      prompt,
      negative_prompt,
      steps,
      cfg_scale,
      width,
      height,
      denoising_strength,
      seed,
      sampler_name
    };

    const response = await fetch(`${sd_webui_endpoint}/sdapi/v1/img2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 300000
    });

    if (!response.ok) {
      throw new Error(`SD WebUI API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      image: `data:image/png;base64,${data.images[0]}`,
      info: data.info ? JSON.parse(data.info) : null
    });

  } catch (error) {
    console.error('❌ img2img error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process image'
    });
  }
});

/**
 * Get available models
 * GET /api/models
 */
app.get('/api/models', async (req, res) => {
  try {
    const { sd_webui_endpoint } = req.query;

    if (!sd_webui_endpoint) {
      return res.status(400).json({
        success: false,
        error: 'SD WebUI endpoint is required'
      });
    }

    const response = await fetch(`${sd_webui_endpoint}/sdapi/v1/sd-models`);

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const models = await response.json();

    res.json({
      success: true,
      models: models.map(m => ({
        title: m.title,
        model_name: m.model_name,
        hash: m.hash,
        filename: m.filename
      }))
    });

  } catch (error) {
    console.error('❌ Models fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get available samplers
 * GET /api/samplers
 */
app.get('/api/samplers', async (req, res) => {
  try {
    const { sd_webui_endpoint } = req.query;

    if (!sd_webui_endpoint) {
      return res.status(400).json({
        success: false,
        error: 'SD WebUI endpoint is required'
      });
    }

    const response = await fetch(`${sd_webui_endpoint}/sdapi/v1/samplers`);

    if (!response.ok) {
      throw new Error(`Failed to fetch samplers: ${response.status}`);
    }

    const samplers = await response.json();

    res.json({
      success: true,
      samplers: samplers.map(s => s.name)
    });

  } catch (error) {
    console.error('❌ Samplers fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Check SD WebUI connection
 * POST /api/check-connection
 */
app.post('/api/check-connection', async (req, res) => {
  try {
    const { sd_webui_endpoint } = req.body;

    if (!sd_webui_endpoint) {
      return res.status(400).json({
        success: false,
        error: 'SD WebUI endpoint is required'
      });
    }

    console.log('🔍 Checking connection to:', sd_webui_endpoint);

    const response = await fetch(`${sd_webui_endpoint}/sdapi/v1/options`, {
      method: 'GET',
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error('Connection failed');
    }

    const options = await response.json();

    res.json({
      success: true,
      message: 'Connected to SD WebUI successfully',
      sd_model_checkpoint: options.sd_model_checkpoint || 'Unknown',
      sd_vae: options.sd_vae || 'Automatic'
    });

  } catch (error) {
    console.error('❌ Connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Cannot connect to SD WebUI. Please check the endpoint.'
    });
  }
});

/**
 * ControlNet txt2img
 * POST /api/controlnet/txt2img
 */
app.post('/api/controlnet/txt2img', async (req, res) => {
  try {
    const {
      sd_webui_endpoint,
      prompt,
      negative_prompt = '',
      steps = 20,
      cfg_scale = 7,
      width = 512,
      height = 512,
      seed = -1,
      controlnet_units
    } = req.body;

    if (!sd_webui_endpoint) {
      return res.status(400).json({ success: false, error: 'Endpoint required' });
    }

    console.log('🎮 ControlNet generation...');

    const payload = {
      prompt,
      negative_prompt,
      steps,
      cfg_scale,
      width,
      height,
      seed,
      alwayson_scripts: {
        controlnet: {
          args: controlnet_units || []
        }
      }
    };

    const response = await fetch(`${sd_webui_endpoint}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 300000
    });

    if (!response.ok) {
      throw new Error(`ControlNet API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      image: `data:image/png;base64,${data.images[0]}`,
      info: data.info ? JSON.parse(data.info) : null
    });

  } catch (error) {
    console.error('❌ ControlNet error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SD WebUI Proxy running on port ${PORT}`);
  console.log(`📡 Ready to connect to Stable Diffusion WebUI`);
});

module.exports = app;
